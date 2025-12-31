import os
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from qdrant_client.http.exceptions import UnexpectedResponse

# Collection names
DOCS_COLLECTION_NAME = "docs_collection"
CODE_COLLECTION_NAME = "code_collection"
ISSUES_COLLECTION_NAME = "issues_collection"


def get_qdrant():
    url = os.getenv("QDRANT_URL")
    key = os.getenv("QDRANT_API_KEY")

    print("QDRANT_URL =", url)
    print("QDRANT_API_KEY SET =", bool(key))

    return QdrantClient(
        url=url,
        api_key=key,
        prefer_grpc=False,
        timeout=60,
    )


def init_docs_collection():
    client = get_qdrant()
    try:
        client.get_collection(DOCS_COLLECTION_NAME)
        print("✅ Docs collection exists")
    except UnexpectedResponse:
        print("🆕 Creating docs collection")
        client.create_collection(
            collection_name=DOCS_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,  # BGE
                distance=Distance.COSINE,
            ),
        )


def init_code_collection():
    client = get_qdrant()
    try:
        client.get_collection(CODE_COLLECTION_NAME)
        print("✅ Code collection exists")
    except UnexpectedResponse:
        print("🆕 Creating code collection")
        client.create_collection(
            collection_name=CODE_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=768,  # CodeBERT
                distance=Distance.COSINE,
            ),
        )


def init_issues_collection():
    client = get_qdrant()
    try:
        client.get_collection(ISSUES_COLLECTION_NAME)
        print("✅ Issues collection exists")
    except UnexpectedResponse:
        print("🆕 Creating issues collection")
        client.create_collection(
            collection_name=ISSUES_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,  # BGE
                distance=Distance.COSINE,
            ),
        )