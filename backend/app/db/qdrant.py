import os
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

DOCS_COLLECTION_NAME = "docs_collection"
CODE_COLLECTION_NAME = "code_collection"
ISSUES_COLLECTION_NAME = "issues_collection"


def get_qdrant() -> QdrantClient:
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
        prefer_grpc=False,
        timeout=60,
    )


def _exists(client: QdrantClient, name: str) -> bool:
    return any(c.name == name for c in client.get_collections().collections)


def init_docs_collection():
    c = get_qdrant()
    if not _exists(c, DOCS_COLLECTION_NAME):
        c.create_collection(
            DOCS_COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )


def init_issues_collection():
    c = get_qdrant()
    if not _exists(c, ISSUES_COLLECTION_NAME):
        c.create_collection(
            ISSUES_COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )


def init_code_collection():
    c = get_qdrant()
    if not _exists(c, CODE_COLLECTION_NAME):
        c.create_collection(
            CODE_COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )