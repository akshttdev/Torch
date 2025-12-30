import hashlib
import time
from tqdm import tqdm
from dotenv import load_dotenv
import uuid

load_dotenv()

from app.db.qdrant import get_qdrant, init_docs_collection, COLLECTION_NAME
from app.embeddings.encoder import embed
from app.ingestion.chunker import chunk_docs
from app.ingestion.docs_crawler import get_doc_links, extract_page

BATCH_SIZE = 16


def run():
    init_docs_collection()
    client = get_qdrant()

    links = get_doc_links()
    print("DOC LINKS FOUND:", len(links))

    points = []

    for url in tqdm(links, desc="Crawling docs"):
        page = extract_page(url)
        if not page:
            continue

        chunks = chunk_docs(page["text"])
        vectors = embed(chunks)

        for chunk, vector in zip(chunks, vectors):
            content_key = page["url"] + chunk
            content_id = uuid.uuid5(uuid.NAMESPACE_URL, content_key)

            points.append({
                "id": str(content_id),
                "vector": vector,
                "payload": {
                    "source": "documentation",
                    "title": page["title"],
                    "url": page["url"],
                    "content": chunk,
                },
            })

    print("TOTAL DOC CHUNKS:", len(points))

    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i : i + BATCH_SIZE]
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=batch,
        )
        print(f"Upserted {i + len(batch)} / {len(points)}")
        time.sleep(0.3)

    print("Phase 1.1 (Docs) completed successfully")


if __name__ == "__main__":
    run()