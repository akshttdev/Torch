"""
Reciprocal Rank Fusion (RRF).

For each input ranked list, every doc gets a contribution of
    1 / (k + rank_in_that_list)
and we sum across lists. `k=60` is the value from the original paper
(Cormack, Clarke, Büttcher, SIGIR 2009) and is what production retrieval
systems use unless they've A/B-tested an alternative.

Why RRF over min-max-then-weight (the old fusion.py):
    • No score normalization needed across heterogeneous embedders.
      BGE cosine scores ≠ jina cosine scores ≠ BM25 scores; trying to
      normalize them apples-to-apples is hand-wavy.
    • Robust to score outliers — only ranks matter.
    • Trivially handles any number of ranked lists, not just three.
"""
from __future__ import annotations

from typing import Iterable, List, Sequence, Tuple, Union

# A ranked list is a sequence of (id, score_or_None, payload).
# We only look at rank; the score is carried through so the caller can
# still see "where this came from."
Hit = Tuple[str, float, dict]


def reciprocal_rank_fusion(
    ranked_lists: Sequence[Sequence[Hit]],
    *,
    k: int = 60,
    top_k: int = 30,
) -> List[Hit]:
    """
    Fuse `ranked_lists` into one ranked list.

    Args:
        ranked_lists: a sequence of ranked Hit-lists. Each list is already
            sorted by its source's notion of relevance (descending).
            Empty lists are allowed.
        k: RRF damping constant; 60 is the canonical default.
        top_k: cap the output at this many fused results.

    Returns:
        Fused [(id, rrf_score, payload), …], descending. Each id appears at
        most once. The payload returned is from the FIRST list the id was
        seen in (lists earlier in `ranked_lists` get priority on payload).
        rrf_score is the summed reciprocal-rank weight.
    """
    rrf_scores: dict[str, float] = {}
    payloads: dict[str, dict] = {}

    for ranked in ranked_lists:
        for rank, (cid, _score, payload) in enumerate(ranked, start=1):
            if not cid:
                continue
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (k + rank)
            payloads.setdefault(cid, payload)

    out = [
        (cid, score, payloads[cid])
        for cid, score in rrf_scores.items()
    ]
    out.sort(key=lambda t: t[1], reverse=True)
    return out[:top_k]


# ─────────────────────────────────────────────────────────────────────────────
# back-compat shim: keep the old function names callable
# ─────────────────────────────────────────────────────────────────────────────


def normalize_scores(results: List[dict]) -> List[dict]:
    """Deprecated: kept so existing imports don't crash. Returns results untouched."""
    return results


def apply_weight(results: List[dict], weight: float) -> List[dict]:
    """Deprecated. Returns results untouched."""
    return results


def fuse_results(
    docs: Union[List[dict], None] = None,
    code: Union[List[dict], None] = None,
    issues: Union[List[dict], None] = None,
    *,
    extra: Iterable[List[dict]] = (),
    k: int = 60,
    top_k: int = 30,
) -> List[dict]:
    """
    Back-compat helper that bridges the old pipeline (which calls
    `fuse_results(docs, code, issues)` with dict-rows) and the new RRF
    implementation. Each row must carry at least an "id" and "payload" key.

    For new code, call `reciprocal_rank_fusion` directly.
    """

    def _to_hits(rows: List[dict] | None) -> List[Hit]:
        if not rows:
            return []
        hits: List[Hit] = []
        for r in rows:
            cid = r.get("id") or r.get("point_id") or r.get("chunk_id")
            score = float(r.get("score", 0.0) or 0.0)
            payload = r.get("payload", r)
            if cid is None:
                continue
            hits.append((str(cid), score, payload))
        return hits

    lists = [_to_hits(docs), _to_hits(code), _to_hits(issues)]
    for extra_list in extra:
        lists.append(_to_hits(extra_list))

    fused = reciprocal_rank_fusion(lists, k=k, top_k=top_k)
    # Re-emit as dict rows for old callers.
    return [
        {"id": cid, "final_score": score, "payload": payload, "score": score}
        for cid, score, payload in fused
    ]
