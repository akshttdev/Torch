from app.rag.router import route_query
from app.retrieval.multi_search import multi_collection_search
from app.rag.fusion import weighted_merge
from app.rag.reranker import rerank
from app.rag.cache import get_cached, set_cached

from app.rag.prompt import build_prompt
from app.rag.llm import generate_answer
from app.rag.guards import is_definitive, answer_from_context
from app.rag.rate_limit import llm_allowed, record_llm_call


def answer_query(query: str, context: list) -> str:
    prompt = build_prompt(query, context)
    return generate_answer(prompt)

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