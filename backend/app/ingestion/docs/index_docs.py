import time
import uuid
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

from app.db.qdrant import get_qdrant, init_docs_collection, DOCS_COLLECTION_NAME
from app.embeddings.encoder import embed_text
from app.ingestion.docs.chunker import chunk_docs
from app.ingestion.docs.crawler import get_doc_links, extract_page

BATCH_SIZE = 16


def run():
    print("🚀 Phase 1.1 — Docs ingestion started")

    init_docs_collection()
    client = get_qdrant()

    links = get_doc_links()
    print("📄 DOC LINKS FOUND:", len(links))

    points = []

    for url in tqdm(links, desc="Crawling docs"):
        page = extract_page(url)
        if not page:
            continue

        chunks = chunk_docs(page["text"])
        vectors = embed_text(chunks)  # ✅ 768-dim

        for chunk, vector in zip(chunks, vectors):
            pid = uuid.uuid5(
                uuid.NAMESPACE_URL,
                page["url"] + chunk
            )

            points.append({
                "id": str(pid),
                "vector": vector,
                "payload": {
                    "source": "documentation",
                    "title": page["title"],
                    "url": page["url"],
                    "content": chunk,
                },
            })

    print("📦 TOTAL DOC CHUNKS:", len(points))

    for i in range(0, len(points), BATCH_SIZE):
        client.upsert(
            collection_name=DOCS_COLLECTION_NAME,  # ✅ FIXED
            points=points[i:i + BATCH_SIZE],
        )
        print(f"Upserted {min(i + BATCH_SIZE, len(points))}/{len(points)}")
        time.sleep(0.3)

    print("✅ Phase 1.1 (Docs) completed successfully")


if __name__ == "__main__":
    run()