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


