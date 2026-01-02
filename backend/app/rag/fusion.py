from typing import List, Dict
from collections import defaultdict


def normalize_scores(results: List[Dict]) -> List[Dict]:
    if not results:
        return results

    scores = [r["score"] for r in results]
    min_s, max_s = min(scores), max(scores)

    if min_s == max_s:
        for r in results:
            r["norm_score"] = 1.0
        return results

    for r in results:
        r["norm_score"] = (r["score"] - min_s) / (max_s - min_s)

    return results


def apply_weight(results: List[Dict], weight: float) -> List[Dict]:
    for r in results:
        r["final_score"] = r["norm_score"] * weight
    return results


def fuse_results(
    docs: List[Dict],
    code: List[Dict],
    issues: List[Dict],
) -> List[Dict]:
    merged = docs + code + issues
    return sorted(merged, key=lambda r: r["final_score"], reverse=True)


def weighted_merge(
    results: List[Dict],
    routing: Dict,
) -> List[Dict]:
    """
    Phase 2.3 – weighted fusion
    """

    grouped = defaultdict(list)

    # group by collection
    for r in results:
        grouped[r["collection"]].append(r)

    docs = normalize_scores(grouped.get("docs", []))
    code = normalize_scores(grouped.get("code", []))
    issues = normalize_scores(grouped.get("issues", []))

    docs = apply_weight(docs, routing["weights"].get("docs", 0.0))
    code = apply_weight(code, routing["weights"].get("code", 0.0))
    issues = apply_weight(issues, routing["weights"].get("issues", 0.0))

    return fuse_results(docs, code, issues)