import os
import time
import uuid
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

from app.ingestion.code.utils import build_code_content
from app.db.qdrant import get_qdrant, init_code_collection, CODE_COLLECTION_NAME
from app.embeddings.encoder import embed_code
from app.ingestion.code.code_parser import parse_python_file

# ---------------- CONFIG ---------------- #

PYTORCH_REPO_PATH = Path("data/pytorch")   # cloned pytorch repo
TARGET_DIRS = [
    "torch/nn/modules",
    "torch/nn/functional.py",
    "torch/optim",
    "torch/autograd",
    "torch/cuda",
]

BATCH_SIZE = 16
SLEEP_BETWEEN_BATCHES = 0.3

# ---------------------------------------- #


def iter_python_files():
    """Yield Python files from selected PyTorch directories."""
    for rel_path in TARGET_DIRS:
        path = PYTORCH_REPO_PATH / rel_path
        if path.is_file() and path.suffix == ".py":
            yield path
        elif path.is_dir():
            for file in path.rglob("*.py"):
                yield file


def deterministic_id(file_path: str, symbol: str, start: int, end: int) -> str:
    """Stable UUID for deduplication."""
    key = f"{file_path}:{symbol}:{start}:{end}"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))


def run():
    print("🚀 Phase 1.2 — Code ingestion started")

    init_code_collection()
    client = get_qdrant()

    python_files = list(iter_python_files())
    print(f"📂 Python files found: {len(python_files)}")

    points = []

    for file_path in tqdm(python_files, desc="Parsing code"):
        chunks = parse_python_file(str(file_path))
        if not chunks:
            continue

        texts = [c["content"] for c in chunks]
        vectors = embed_code(texts)  # CodeBERT embeddings

        for chunk, vector in zip(chunks, vectors):
            point_id = deterministic_id(
                chunk["file_path"],
                chunk["symbol"],
                chunk["start_line"],
                chunk["end_line"],
            )

            points.append({
                "id": point_id,
                "vector": vector,
                "payload": {
                    "source": "code",
                    "symbol": chunk["symbol"],
                    "type": chunk["type"],
                    "file_path": chunk["file_path"],
                    "content": build_code_content(chunk),
                },
            })

    print(f"📦 Total code chunks: {len(points)}")

    # -------- Batched upsert -------- #
    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i:i + BATCH_SIZE]
        client.upsert(
            collection_name=CODE_COLLECTION_NAME,
            points=batch,
        )
        print(f"Upserted {i + len(batch)} / {len(points)}")
        time.sleep(SLEEP_BETWEEN_BATCHES)

    print("✅ Phase 1.2 (Code) completed successfully")


if __name__ == "__main__":
    run()