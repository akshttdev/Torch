
from dotenv import load_dotenv
load_dotenv()

from app.retrieval.multi_search import multi_collection_search
from app.rag.router import route_query


def run():
    queries = [
        "What does retain_graph do in backward?",
        "Why does backward retain_graph cause memory leak?",
        "CUDA crash during backward pass",
    ]

    for q in queries:
        print("=" * 80)
        print("QUERY:", q)

        routing = route_query(q)
        print("ROUTING:", routing)

        results = multi_collection_search(q, routing)

        for i, r in enumerate(results[:8], 1):
            print(f"[{i}] {r['collection'].upper()} "
                  f"score={r['final_score']:.4f}")
            print(r["payload"].get("title") or r["payload"].get("symbol"))
            print("-" * 60)


if __name__ == "__main__":
    run()