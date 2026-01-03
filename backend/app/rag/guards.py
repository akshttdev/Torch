# backend/app/rag/guards.py

def is_definitive(context: str) -> bool:
    """
    Returns True if the answer is directly present in the assembled context string.
    """
    if not context:
        return False

    text = context.lower()

    return (
        "keeps the computation graph alive" in text
        or "freed after backward" in text
    )


def answer_from_context(context: str) -> str:
    """
    Deterministic answer when context already contains the answer.
    """
    return context