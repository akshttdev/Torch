from dotenv import load_dotenv
load_dotenv()

from app.rag.router import route_query
from app.retrieval.multi_search import multi_collection_search
from app.rag.fusion import weighted_merge
from app.rag.reranker import rerank


TEST_QUERIES = [
    "Why does backward retain_graph cause memory leak?",
    "CUDA crash during backward pass",
]


def run():
    for query in TEST_QUERIES:
        print("=" * 80)
        print("QUERY:", query)

        # Phase 2.1 — routing
        routing = route_query(query)
        print("ROUTING:", routing)

        # Phase 2.2 — retrieve
        merged = multi_collection_search(query, routing)

        # Phase 2.3 — fuse
        fused = weighted_merge(merged, routing)

        assert len(fused) > 0, "❌ No fused results"

        # Phase 2.4 — rerank
        reranked = rerank(query, fused, top_k=8)

        assert len(reranked) > 0, "❌ No reranked results"

        # ---- Display results ----
        for i, r in enumerate(reranked, 1):
    
            print(
                f"[{i}] {r['payload']['source'].upper()} "
                f"rerank_score={r['rerank_score']:.4f}"
            )
            print(r["payload"].get("content", "")[:300])
            print("-" * 60)

        print("✅ Phase 2.4 reranking test passed")


if __name__ == "__main__":
    run()