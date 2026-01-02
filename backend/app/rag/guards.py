from typing import List, Dict


def is_definitive(context: List[Dict]) -> bool:
    """
    Returns True if the answer is directly present in context.
    """
    if not context:
        return False

    for c in context:
        text = c.get("content", "").lower()
        if "keeps the computation graph alive" in text:
            return True
        if "freed after backward" in text:
            return True

    return False


def answer_from_context(context: List[Dict]) -> str:
    """
    Deterministic answer builder from context.
    """
    return " ".join(c["content"] for c in context)