# backend/app/rag/context.py

from typing import List, Dict
from collections import defaultdict

MAX_PER_SOURCE = {
    "code": 4,
    "documentation": 3,
    "issues": 3,
}

def assemble_context(results: List[Dict]) -> str:
    """
    Convert retrieval results into a single grounded context string.
    """
    buckets = defaultdict(list)

    for r in results:
        source = r["collection"]
        if len(buckets[source]) < MAX_PER_SOURCE.get(source, 0):
            buckets[source].append(r)

    sections = []

    for r in buckets.get("code", []):
        p = r["payload"]
        sections.append(
            f"""[SOURCE: CODE]
File: {p.get("file_path")}
Symbol: {p.get("symbol")}

{p.get("content")}
"""
        )

    for r in buckets.get("documentation", []):
        p = r["payload"]
        sections.append(
            f"""[SOURCE: DOCUMENTATION]
Title: {p.get("title")}
URL: {p.get("url")}

{p.get("content")}
"""
        )

    for r in buckets.get("issues", []):
        p = r["payload"]
        sections.append(
            f"""[SOURCE: ISSUE]
Title: {p.get("title")}
URL: {p.get("url")}

{p.get("content")}
"""
        )

    return "\n\n".join(sections)