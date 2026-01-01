import time
import uuid
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

from app.db.qdrant import (
    get_qdrant,
    init_issues_collection,
    ISSUES_COLLECTION_NAME,
)
from app.embeddings.encoder import embed_text
from app.ingestion.issues.fetch_issues import fetch_issues
from app.ingestion.issues.chunker import chunk_issue

BATCH_SIZE = 16

def run():
    print("🚀 Phase 1.3 — Issues ingestion started")

    init_issues_collection()
    client = get_qdrant()

    issues = fetch_issues(limit=1000)  # yes, 1000 is fine
    print(f"🧵 Issues fetched: {len(issues)}")

    points = []

    for issue in tqdm(issues, desc="Processing issues"):
        chunks = chunk_issue(issue)
        if not chunks:
            continue

        vectors = embed_text(chunks)  # ✅ 768

        for chunk, vector in zip(chunks, vectors):
            pid = uuid.uuid5(
                uuid.NAMESPACE_URL,
                issue["url"] + chunk
            )

            points.append({
                "id": str(pid),
                "vector": vector,
                "payload": {
                    "source": "issue",
                    "issue_number": issue["number"],
                    "title": issue["title"],
                    "url": issue["url"],
                    "labels": issue["labels"],
                    "content": chunk,
                },
            })

    print(f"📦 Total issue chunks: {len(points)}")

    for i in range(0, len(points), BATCH_SIZE):
        client.upsert(
            collection_name=ISSUES_COLLECTION_NAME,
            points=points[i:i + BATCH_SIZE],
        )
        print(f"Upserted {min(i + BATCH_SIZE, len(points))}/{len(points)}")
        time.sleep(0.25)

    print("✅ Phase 1.3 (Issues) completed")

if __name__ == "__main__":
    run()