from typing import List, Dict
from sentence_transformers import CrossEncoder

_reranker = None

def _load_reranker():
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    return _reranker


def _get_content(r: Dict) -> str:
    if "content" in r:
        return r["content"]
    if "payload" in r and "content" in r["payload"]:
        return r["payload"]["content"]
    return ""


def rerank(query: str, results: List[Dict], top_k: int = 10) -> List[Dict]:
    if not results:
        return []

    model = _load_reranker()

    pairs = [
        (query, _get_content(r))
        for r in results
    ]

    scores = model.predict(pairs)

    for r, score in zip(results, scores):
        r["rerank_score"] = float(score)

    return sorted(
        results,
        key=lambda r: r["rerank_score"],
        reverse=True
    )[:top_k]