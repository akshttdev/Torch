from typing import Dict, List

CODE_KEYWORDS = [
    "error", "traceback", "exception", "stack",
    "backward", "retain_graph", "torch.",
    ".py", "::", "(", ")"
]

ISSUE_KEYWORDS = [
    "bug", "memory leak", "crash", "slow",
    "segfault", "hang", "issue", "problem"
]

DOC_KEYWORDS = [
    "what is", "what does", "why", "how does",
    "explain", "documentation"
]


def route_query(query: str) -> Dict:
    q = query.lower()

    score = {
        "documentation": 0,
        "code": 0,
        "issues": 0,
    }

    for kw in CODE_KEYWORDS:
        if kw in q:
            score["code"] += 2

    for kw in ISSUE_KEYWORDS:
        if kw in q:
            score["issues"] += 2

    for kw in DOC_KEYWORDS:
        if kw in q:
            score["documentation"] += 1

    # docs always useful
    score["documentation"] += 1

    # strong bias for explanatory queries
    if any(x in q for x in ["why", "what is", "what does", "how does", "explain"]):
        score["documentation"] += 3

    total = sum(score.values())
    weights = {k: v / total for k, v in score.items()}

    top_k = {
        "documentation": 4 if weights["documentation"] > 0.25 else 3,
        "code": 6 if weights["code"] > 0.3 else 4,
        "issues": 4 if weights["issues"] > 0.25 else 2,
    }

    collections = [
        k for k, v in weights.items()
        if v > 0.15 or k == "documentation"
    ]

    return {
        "collections": collections,
        "weights": weights,
        "top_k": top_k,
    }