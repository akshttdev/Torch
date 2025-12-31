from dotenv import load_dotenv
load_dotenv()

from app.db.qdrant import get_qdrant, CODE_COLLECTION_NAME
from app.embeddings.encoder import embed_code

def run():
    print("🧪 Testing CODE retrieval")

    client = get_qdrant()

    query = "What does retain_graph do in backward?"
    print("QUERY:", query)

    query_vector = embed_code([query])[0]

    results = client.search(
        collection_name=CODE_COLLECTION_NAME,
        query_vector=query_vector,
        limit=5,
    )

    for i, hit in enumerate(results, 1):
        payload = hit.payload or {}

        text = (
            payload.get("content")
            or payload.get("code")
            or payload.get("docstring")
            or ""
        )

        print("\n" + "=" * 80)
        print(f"[Result {i}] Score: {hit.score:.4f}")
        print("File:", payload.get("file_path"))
        print("Symbol:", payload.get("symbol"))
        print(text[:500])

    print("\n✅ Code retrieval test completed")

if __name__ == "__main__":
    run()