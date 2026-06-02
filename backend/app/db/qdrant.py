"""
Qdrant client + collection names.

We share the Synapse cluster with another project (a `media` collection,
1024-dim), so all Torch collections live behind a configurable prefix.
Default prefix is `torch_`, so they appear in the Qdrant UI as:

    media           ← Synapse project
    torch_docs
    torch_code
    torch_issues

Override with TORCH_COLLECTION_PREFIX=foo_ for a sandbox cluster.
"""
import os

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# ─── collection naming ───────────────────────────────────────────────────
PREFIX = os.environ.get("TORCH_COLLECTION_PREFIX", "torch_")

DOCS_COLLECTION_NAME = f"{PREFIX}docs"
CODE_COLLECTION_NAME = f"{PREFIX}code"
ISSUES_COLLECTION_NAME = f"{PREFIX}issues"

# ─── client ──────────────────────────────────────────────────────────────


def get_qdrant() -> QdrantClient:
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
        prefer_grpc=False,
        timeout=60,
    )


def _exists(client: QdrantClient, name: str) -> bool:
    return any(c.name == name for c in client.get_collections().collections)


def _ensure(client: QdrantClient, name: str, dim: int = 768) -> None:
    if not _exists(client, name):
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )


def init_docs_collection() -> None:
    _ensure(get_qdrant(), DOCS_COLLECTION_NAME, dim=768)


def init_issues_collection() -> None:
    _ensure(get_qdrant(), ISSUES_COLLECTION_NAME, dim=768)


def init_code_collection() -> None:
    _ensure(get_qdrant(), CODE_COLLECTION_NAME, dim=768)


def init_all_collections() -> None:
    c = get_qdrant()
    _ensure(c, DOCS_COLLECTION_NAME, 768)
    _ensure(c, CODE_COLLECTION_NAME, 768)
    _ensure(c, ISSUES_COLLECTION_NAME, 768)
