"""
Hybrid retrieval: dense (Qdrant) + sparse (BM25) per collection, fused by
true Reciprocal Rank Fusion (k=60), then reranked by the cross-encoder.

This is the function called from `/search` and `/ask`. It deliberately does
NOT touch the legacy `multi_collection_search` so the existing tests keep
working — that path stays as the "dense-only" reference.
"""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from qdrant_client.http.models import Filter

from app.db.qdrant import (
    DOCS_COLLECTION_NAME,
    CODE_COLLECTION_NAME,
    ISSUES_COLLECTION_NAME,
    get_qdrant,
)
from app.embeddings.encoder import embed_code, embed_text
from app.rag.fusion import reciprocal_rank_fusion, Hit
from app.rag.reranker import rerank
from app.rag.router import route_query
from app.retrieval import bm25

# Map the routing names → (qdrant collection, BM25 key, "code" flag)
_COLL_INFO: Dict[str, Tuple[str, str, bool]] = {
    "documentation": (DOCS_COLLECTION_NAME, "docs", False),
    "code":          (CODE_COLLECTION_NAME, "code", True),
    "issues":        (ISSUES_COLLECTION_NAME, "issues", False),
}


def _dense_search(
    collection_key: str,
    query: str,
    top_k: int,
) -> List[Hit]:
    qcoll, _bm25_name, is_code = _COLL_INFO[collection_key]
    vector = (embed_code([query]) if is_code else embed_text([query]))[0]

    client = get_qdrant()
    points = client.search(
        collection_name=qcoll,
        query_vector=vector,
        limit=top_k,
        with_payload=True,
    )
    out: List[Hit] = []
    for p in points:
        payload = p.payload or {}
        cid = payload.get("id") or str(p.id)
        # carry the qdrant numeric score on the payload for transparency
        payload = {**payload, "_dense_score": float(p.score)}
        out.append((str(cid), float(p.score), payload))
    return out


def _bm25_search(
    collection_key: str,
    query: str,
    top_k: int,
) -> List[Hit]:
    _qcoll, bm25_name, _ = _COLL_INFO[collection_key]
    idx = bm25.get(bm25_name)
    if idx is None:
        return []
    raw = idx.search(query, top_k=top_k)
    return [(cid, score, {**payload, "_bm25_score": score}) for cid, score, payload in raw]


def hybrid_search(
    query: str,
    *,
    sources: Optional[List[str]] = None,
    fused_top_k: int = 30,
    per_source_top_k: int = 50,
    rerank_top_k: int = 8,
    do_rerank: bool = True,
) -> List[dict]:
    """
    End-to-end hybrid retrieval.

    Steps:
        1. route_query → per-collection top_k + weights
        2. per collection: dense Qdrant search + BM25 search in parallel-ish
        3. RRF over all rank lists (k=60), capped at `fused_top_k`
        4. cross-encoder rerank top-N → top `rerank_top_k`

    Args:
        sources: optional UI filter — restrict to ["docs", "code", "issues"].
            Maps onto routing keys "documentation" / "code" / "issues".
        fused_top_k: cap after RRF, before rerank.
        rerank_top_k: final cap returned to caller.
        do_rerank: if False, skip the cross-encoder (cheaper smoke tests).
    """
    routing = route_query(query)

    # apply UI source filter, if any
    source_map = {"docs": "documentation", "code": "code", "issues": "issues"}
    if sources:
        wanted = {source_map[s] for s in sources if s in source_map}
        routing["collections"] = [c for c in routing["collections"] if c in wanted]

    all_lists: List[List[Hit]] = []
    for coll in routing["collections"]:
        per = max(per_source_top_k, routing["top_k"].get(coll, per_source_top_k))
        try:
            all_lists.append(_dense_search(coll, query, per))
        except Exception as e:
            print(f"[hybrid] dense {coll} failed: {e}")
        try:
            all_lists.append(_bm25_search(coll, query, per))
        except Exception as e:
            print(f"[hybrid] bm25 {coll} failed: {e}")

    fused = reciprocal_rank_fusion(all_lists, k=60, top_k=fused_top_k)
    fused_as_dicts = [
        {
            "id": cid,
            "score": score,
            "rrf_score": score,
            "payload": payload,
            "collection": payload.get("kind") or payload.get("collection"),
        }
        for cid, score, payload in fused
    ]

    if not do_rerank or not fused_as_dicts:
        return fused_as_dicts[:rerank_top_k]

    try:
        return rerank(query, fused_as_dicts, top_k=rerank_top_k)
    except Exception as e:
        print(f"[hybrid] rerank failed, returning RRF-only: {e}")
        return fused_as_dicts[:rerank_top_k]
