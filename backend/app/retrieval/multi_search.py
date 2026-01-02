from dotenv import load_dotenv
load_dotenv()

from typing import Dict, List
from qdrant_client import QdrantClient

from app.db.qdrant import (
    get_qdrant,
    DOCS_COLLECTION_NAME,
    CODE_COLLECTION_NAME,
    ISSUES_COLLECTION_NAME,
)

from app.embeddings.encoder import embed_text, embed_code
from app.rag.fusion import (
    normalize_scores,
    apply_weight,
    fuse_results,
)


COLLECTION_MAP = {
    "docs": DOCS_COLLECTION_NAME,
    "code": CODE_COLLECTION_NAME,
    "issues": ISSUES_COLLECTION_NAME,
}


def _search_collection(
    client: QdrantClient,
    collection: str,
    query: str,
    top_k: int,
) -> List[Dict]:
    """
    Run a vector search on a single collection.
    """
    if collection == "code":
        vector = embed_code([query])[0]
    else:
        vector = embed_text([query])[0]

    hits = client.search(
        collection_name=COLLECTION_MAP[collection],
        query_vector=vector,
        limit=top_k,
    )

    results = []
    for h in hits:
        results.append({
            "collection": collection,
            "score": h.score,
            "payload": h.payload,
        })

    return results


def multi_collection_search(
    query: str,
    routing: Dict,
) -> List[Dict]:
    """
    Phase 2.3:
    - retrieve per collection
    - normalize scores
    - apply routing weights
    - fuse + rank
    """
    client = get_qdrant()

    all_results = {
        "docs": [],
        "code": [],
        "issues": [],
    }

    # ---------- Retrieve ----------
    for collection in routing["collections"]:
        all_results[collection] = _search_collection(
            client=client,
            collection=collection,
            query=query,
            top_k=routing["top_k"][collection],
        )

    # ---------- Normalize ----------
    for k in all_results:
        all_results[k] = normalize_scores(all_results[k])

    # ---------- Apply Weights ----------
    for k in all_results:
        all_results[k] = apply_weight(
            all_results[k],
            routing["weights"][k],
        )

    # ---------- Fuse ----------
    fused = fuse_results(
        all_results["docs"],
        all_results["code"],
        all_results["issues"],
    )

    return fused