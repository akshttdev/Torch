from dotenv import load_dotenv
load_dotenv()


from app.retrieval.multi_search import multi_collection_search
from app.rag.router import route_query


def pretty_print(results):
    for collection, hits in results.items():
        print(f"\n--- {collection.upper()} RESULTS ({len(hits)}) ---")
        for i, h in enumerate(hits, 1):
            print(f"[{i}] Score: {h['score']:.4f}")
            print(h["payload"].get("title") or h["payload"].get("symbol"))
            print(h["payload"].get("url", ""))
            print("-" * 60)


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
        pretty_print(results)


if __name__ == "__main__":
    run()