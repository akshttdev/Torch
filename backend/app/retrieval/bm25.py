"""
BM25 sparse retrieval, per collection.

Each collection (`docs`, `code`, `issues`, …) gets its own BM25Okapi
index built from the chunk corpus. The index is:

  • built in-memory at ingest time
  • pickled to local disk under `data/bm25/<collection>.pkl`
  • mirrored to B2 under `bm25/<collection>.pkl` (the durable copy)

At HTTP-server boot, we restore from local pickle (or download from B2 if
local is missing). The hot path is `search(query, top_k)`.

The hybrid retriever (multi_search + RRF) combines BM25's ranked ids with
the dense retriever's ranked ids via Reciprocal Rank Fusion. BM25 catches
literal symbol matches like ``set_to_none=True`` or ``num_workers`` that
the dense model paraphrases away.
"""
from __future__ import annotations

import os
import pickle
import re
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from rank_bm25 import BM25Okapi

from app.storage import b2

# ─────────────────────────────────────────────────────────────────────────────
# tokenization
# ─────────────────────────────────────────────────────────────────────────────

# Greedy: split on anything not word-char or dot, lowercase, keep dotted ids
# like `torch.nn.Linear` and snake_case tokens like `num_workers`.
_TOKEN_RE = re.compile(r"[A-Za-z0-9_.]+")


def tokenize(text: str) -> List[str]:
    if not text:
        return []
    return [t.lower() for t in _TOKEN_RE.findall(text)]


# ─────────────────────────────────────────────────────────────────────────────
# index
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class BM25Index:
    """In-memory BM25 + the parallel id list so we can map ranks → chunk ids."""

    bm25: BM25Okapi
    ids: List[str]            # chunk ids, ordered to match bm25 corpus rows
    payloads: List[dict]      # full chunk payload per row (so /search can return them)
    n: int                    # corpus size

    def search(self, query: str, top_k: int = 50) -> List[Tuple[str, float, dict]]:
        """Return [(id, score, payload), …] sorted by descending BM25 score."""
        toks = tokenize(query)
        if not toks:
            return []
        scores = self.bm25.get_scores(toks)
        if top_k >= len(scores):
            ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        else:
            # partial top-k via argpartition — fast for big corpora
            import numpy as np

            idx = np.argpartition(-scores, top_k)[:top_k]
            ranked = idx[np.argsort(-scores[idx])].tolist()
        return [
            (self.ids[i], float(scores[i]), self.payloads[i])
            for i in ranked
            if scores[i] > 0.0
        ]


# ─────────────────────────────────────────────────────────────────────────────
# build / persist
# ─────────────────────────────────────────────────────────────────────────────


def _local_path(collection: str) -> Path:
    root = Path(os.environ.get("TORCH_DATA_DIR", "data")) / "bm25"
    root.mkdir(parents=True, exist_ok=True)
    return root / f"{collection}.pkl"


def build(records: Iterable[dict]) -> BM25Index:
    """
    Build a BM25 index from an iterable of chunk records (the JSONL shape from
    `storage/b2.py`). The chunk's `content` is what BM25 sees.
    """
    ids: List[str] = []
    payloads: List[dict] = []
    corpus: List[List[str]] = []

    for r in records:
        cid = r.get("id")
        content = r.get("content") or ""
        if not cid or not content:
            continue
        ids.append(cid)
        payloads.append(r)
        corpus.append(tokenize(content))

    if not corpus:
        raise ValueError("No usable records to build BM25 index from")

    bm25 = BM25Okapi(corpus)
    return BM25Index(bm25=bm25, ids=ids, payloads=payloads, n=len(ids))


def save(collection: str, idx: BM25Index, *, push_to_b2: bool = True) -> None:
    """Pickle to local disk, and mirror to B2 unless explicitly skipped."""
    payload = {
        "bm25": idx.bm25,
        "ids": idx.ids,
        "payloads": idx.payloads,
        "n": idx.n,
        "v": 1,
    }
    local = _local_path(collection)
    local.write_bytes(pickle.dumps(payload, protocol=pickle.HIGHEST_PROTOCOL))
    if push_to_b2:
        layout = next(l for l in b2.ALL if l.name == collection)
        b2.write_bm25(layout, payload)


def _from_payload(payload: dict) -> BM25Index:
    return BM25Index(
        bm25=payload["bm25"],
        ids=payload["ids"],
        payloads=payload["payloads"],
        n=payload["n"],
    )


def load_local(collection: str) -> Optional[BM25Index]:
    p = _local_path(collection)
    if not p.exists():
        return None
    return _from_payload(pickle.loads(p.read_bytes()))


def load_from_b2(collection: str) -> Optional[BM25Index]:
    layout = next((l for l in b2.ALL if l.name == collection), None)
    if layout is None:
        return None
    payload = b2.read_bm25(layout)
    if payload is None:
        return None
    return _from_payload(payload)


# ─────────────────────────────────────────────────────────────────────────────
# process-wide registry
# ─────────────────────────────────────────────────────────────────────────────

_lock = threading.Lock()
_registry: Dict[str, BM25Index] = {}


def get(collection: str) -> Optional[BM25Index]:
    """
    Lazy-load an index for a collection:
        1. cached in this process? return it
        2. local pickle? load, cache, return
        3. B2 pickle? download, write local pickle, cache, return
        4. None
    """
    with _lock:
        if collection in _registry:
            return _registry[collection]
        idx = load_local(collection) or load_from_b2(collection)
        if idx is not None:
            _registry[collection] = idx
        return idx


def set_index(collection: str, idx: BM25Index) -> None:
    """Used by ingestion after a fresh build to swap the live index."""
    with _lock:
        _registry[collection] = idx


def clear(collection: Optional[str] = None) -> None:
    """Drop in-memory caches (file pickles stay)."""
    with _lock:
        if collection is None:
            _registry.clear()
        else:
            _registry.pop(collection, None)


def stats() -> Dict[str, int]:
    """For /healthz and /sources — corpus size per collection in memory."""
    with _lock:
        return {c: idx.n for c, idx in _registry.items()}
