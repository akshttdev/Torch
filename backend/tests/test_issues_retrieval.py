from app.db.qdrant import get_qdrant, ISSUES_COLLECTION_NAME
from app.embeddings.encoder import embed_text

def run():
    client = get_qdrant()

    query = "Why does backward retain_graph cause memory leak?"
    print("QUERY:", query)

    query_vector = embed_text([query])[0]

    results = client.search(
        collection_name=ISSUES_COLLECTION_NAME,
        query_vector=query_vector,
        limit=5,
    )

    for i, hit in enumerate(results, 1):
        payload = hit.payload
        print("=" * 80)
        print(f"[Result {i}] Score: {hit.score:.4f}")
        print("Title:", payload.get("title"))
        print("URL:", payload.get("url"))
        print(payload.get("content", "")[:500])

    print("✅ Issues retrieval test completed")

if __name__ == "__main__":
    run()