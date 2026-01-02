from app.rag.router import route_query
from app.retrieval.multi_search import multi_collection_search
from app.rag.fusion import weighted_merge
from app.rag.reranker import rerank
from app.rag.cache import get_cached, set_cached


def retrieve(query: str, top_k: int = 10):
    # 1️⃣ Cache check
    cached = get_cached(query)
    if cached:
        return cached

    # 2️⃣ Normal pipeline
    routing = route_query(query)
    merged = multi_collection_search(query, routing)
    fused = weighted_merge(merged, routing)
    final = rerank(query, fused, top_k=top_k)

    # 3️⃣ Store cache
    set_cached(query, final)

    return final