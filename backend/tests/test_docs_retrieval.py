from dotenv import load_dotenv
load_dotenv()

print("TEST FILE LOADED")

from app.db.qdrant import get_qdrant, COLLECTION_NAME
from app.embeddings.encoder import embed

QUERY = "What does retain_graph do in backward?"

def run():
    print("RUN() CALLED")

    client = get_qdrant()
    query_vector = embed([QUERY])[0]

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=5,
    )

    print(f"\nQUERY: {QUERY}\n")
    for i, hit in enumerate(results, 1):
        payload = hit.payload
        print("=" * 80)
        print(f"[Result {i}] Score: {hit.score:.4f}")
        print("Title:", payload.get("title"))
        print("URL:", payload.get("url"))
        print(payload.get("content", "")[:300])

if __name__ == "__main__":
    run()