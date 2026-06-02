"""
restore_from_b2 — rebuild a Qdrant collection from the B2 backup.

Run when Qdrant Cloud drops a collection (free-tier eviction, accidental
wipe, fresh cluster) and you don't want to re-crawl pytorch.org.

Usage:
    python -m app.scripts.restore_from_b2 --collection docs
    python -m app.scripts.restore_from_b2 --all
    python -m app.scripts.restore_from_b2 --collection code --no-bm25
    python -m app.scripts.restore_from_b2 --all --batch 256

The script:
    1. Streams the latest JSONL.gz chunk file for each collection from B2.
    2. If every record already has a precomputed `vector`, push as-is.
       Otherwise re-embed via the right encoder (text vs code).
    3. (Re)creates the Qdrant collection if missing, then upserts in batches.
    4. Downloads + installs the BM25 pickle into the in-memory registry
       (unless `--no-bm25` is passed).

This script does NOT touch pytorch.org / GitHub. The corpus is whatever
last got written to B2.
"""
from __future__ import annotations

import argparse
import sys
import time
import uuid
from typing import Iterable, Iterator

from dotenv import load_dotenv

load_dotenv()

from qdrant_client.http.models import Distance, PointStruct, VectorParams  # noqa: E402

from app.db.qdrant import (  # noqa: E402
    CODE_COLLECTION_NAME,
    DOCS_COLLECTION_NAME,
    ISSUES_COLLECTION_NAME,
    get_qdrant,
)
from app.embeddings.encoder import embed_code, embed_text  # noqa: E402
from app.retrieval import bm25  # noqa: E402
from app.storage import b2  # noqa: E402

# routing key → (qdrant collection name, "code" flag, b2 layout name)
_COLLS = {
    "docs":   (DOCS_COLLECTION_NAME,   False, "docs"),
    "code":   (CODE_COLLECTION_NAME,   True,  "code"),
    "issues": (ISSUES_COLLECTION_NAME, False, "issues"),
}


def _batched(it: Iterator[dict], n: int) -> Iterable[list[dict]]:
    buf: list[dict] = []
    for r in it:
        buf.append(r)
        if len(buf) >= n:
            yield buf
            buf = []
    if buf:
        yield buf


def _ensure_qdrant_collection(client, name: str, dim: int) -> None:
    exists = any(c.name == name for c in client.get_collections().collections)
    if not exists:
        print(f"  [qdrant] creating collection {name!r} (dim={dim})")
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )


def _stable_point_id(record_id: str) -> str:
    """Qdrant requires UUID or int point ids; map our string ids to uuid5."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, record_id))


def restore_collection(coll_key: str, *, batch_size: int = 128) -> dict:
    qcoll, is_code, b2_name = _COLLS[coll_key]
    layout = next(l for l in b2.ALL if l.name == b2_name)

    if not b2.exists(layout.latest_key):
        return {"collection": coll_key, "ok": False, "reason": f"no latest blob in B2 at {layout.latest_key}"}

    print(f"[{coll_key}] restoring from {layout.latest_key}")

    t0 = time.perf_counter()
    client = get_qdrant()

    n_total = 0
    n_embedded = 0
    n_passthrough = 0
    dim_seen = None

    for batch in _batched(b2.read_chunks(layout.latest_key), batch_size):
        # Decide whether to embed or pass through
        need_embed = [r for r in batch if not r.get("vector")]
        if need_embed:
            texts = [r.get("content", "") for r in need_embed]
            vectors = embed_code(texts) if is_code else embed_text(texts)
            for r, v in zip(need_embed, vectors):
                r["vector"] = v
            n_embedded += len(need_embed)
        n_passthrough += len(batch) - len(need_embed)

        dim_seen = dim_seen or len(batch[0]["vector"])
        _ensure_qdrant_collection(client, qcoll, dim_seen)

        points = []
        for r in batch:
            pid = _stable_point_id(str(r["id"]))
            payload = {k: v for k, v in r.items() if k != "vector"}
            points.append(PointStruct(id=pid, vector=r["vector"], payload=payload))
        client.upsert(collection_name=qcoll, points=points)

        n_total += len(batch)
        if n_total % (batch_size * 5) == 0:
            print(f"  [{coll_key}] {n_total} chunks restored…")

    dt = time.perf_counter() - t0
    print(f"[{coll_key}] done · {n_total} chunks · embedded={n_embedded} passthrough={n_passthrough} · {dt:.1f}s")
    return {
        "collection": coll_key,
        "ok": True,
        "n": n_total,
        "embedded": n_embedded,
        "passthrough": n_passthrough,
        "seconds": round(dt, 2),
    }


def restore_bm25(coll_key: str) -> dict:
    layout = next(l for l in b2.ALL if l.name == _COLLS[coll_key][2])
    if not b2.exists(layout.bm25_key):
        return {"collection": coll_key, "bm25_ok": False, "reason": "no BM25 pickle in B2"}
    idx = bm25.load_from_b2(coll_key)
    if idx is None:
        return {"collection": coll_key, "bm25_ok": False, "reason": "failed to load"}
    bm25.set_index(coll_key, idx)
    print(f"[{coll_key}] BM25 loaded: n={idx.n}")
    return {"collection": coll_key, "bm25_ok": True, "n": idx.n}


def main():
    ap = argparse.ArgumentParser(description="Rebuild Qdrant collections from the B2 backup.")
    grp = ap.add_mutually_exclusive_group(required=True)
    grp.add_argument("--all", action="store_true", help="Restore docs + code + issues.")
    grp.add_argument(
        "--collection",
        choices=tuple(_COLLS.keys()),
        help="Restore a single collection.",
    )
    ap.add_argument("--batch", type=int, default=128, help="Embed/upsert batch size.")
    ap.add_argument("--no-bm25", action="store_true", help="Skip the BM25 restore step.")
    args = ap.parse_args()

    if not b2.ping():
        print("ERROR: cannot reach B2. Check B2_S3_ENDPOINT_URL / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / B2_BUCKET.")
        sys.exit(2)

    targets = list(_COLLS.keys()) if args.all else [args.collection]

    report = []
    for c in targets:
        report.append(restore_collection(c, batch_size=args.batch))
        if not args.no_bm25:
            report.append(restore_bm25(c))

    print("\n=== restore report ===")
    for r in report:
        print(" ", r)


if __name__ == "__main__":
    main()
