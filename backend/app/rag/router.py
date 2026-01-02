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
    "what is", "how does", "explain", "documentation"
]


def route_query(query: str) -> Dict:
    q = query.lower()

    score = {
        "docs": 0,
        "code": 0,
        "issues": 0,
    }

    # --- keyword scoring ---
    for kw in CODE_KEYWORDS:
        if kw in q:
            score["code"] += 2

    for kw in ISSUE_KEYWORDS:
        if kw in q:
            score["issues"] += 2

    for kw in DOC_KEYWORDS:
        if kw in q:
            score["docs"] += 1

    # --- fallback bias ---
    score["docs"] += 1  # docs always useful

    # --- normalize ---
    total = sum(score.values())
    weights = {k: v / total for k, v in score.items()}

    # --- decide top_k per collection ---
    top_k = {
        "docs": 4 if weights["docs"] > 0.2 else 2,
        "code": 6 if weights["code"] > 0.3 else 3,
        "issues": 4 if weights["issues"] > 0.25 else 2,
    }

    collections = [k for k, v in weights.items() if v > 0.15]

    return {
        "collections": collections,
        "weights": weights,
        "top_k": top_k,
    }