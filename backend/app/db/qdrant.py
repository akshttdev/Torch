import os
from qdrant_client import QdrantClient

COLLECTION_NAME = "docs_collection"

def get_qdrant():
    url = os.environ.get("QDRANT_URL")
    key = os.environ.get("QDRANT_API_KEY")

    print("QDRANT_URL =", url)
    print("QDRANT_API_KEY SET =", bool(key))

    return QdrantClient(
        url=url,
        api_key=key,
        prefer_grpc=False
    )