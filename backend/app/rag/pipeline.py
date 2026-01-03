# backend/app/rag/pipeline.py

from typing import List, Dict

from app.rag.router import route_query
from app.retrieval.multi_search import multi_collection_search
from app.rag.reranker import rerank

from app.rag.context import assemble_context
from app.rag.prompt import build_prompt
from app.rag.llm import generate_answer

from app.rag.rate_limit import llm_allowed, record_llm_call
from app.rag.guards import is_definitive, answer_from_context


# -----------------------------
# Raw retrieval (NO double fusion)
# -----------------------------
def retrieve_raw(query: str) -> List[Dict]:
    routing = route_query(query)
    return multi_collection_search(query, routing)


# -----------------------------
# Retrieval + reranking
# -----------------------------
def retrieve(query: str, top_k: int = 8) -> List[Dict]:
    results = retrieve_raw(query)
    return rerank(query, results, top_k=top_k)


# -----------------------------
# Full RAG answer
# -----------------------------
def answer(query: str) -> str:
    chunks = retrieve(query)
    context = assemble_context(chunks)  # ✅ string

    # deterministic short-circuit
    if is_definitive(context):
        return answer_from_context(context)

    # rate limit
    if not llm_allowed():
        return "Rate limit reached. Please try again shortly."

    prompt = build_prompt(query, context)

    record_llm_call()
    return generate_answer(prompt)