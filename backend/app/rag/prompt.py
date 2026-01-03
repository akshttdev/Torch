# backend/app/rag/prompt.py

def build_prompt(query: str, context: str) -> str:
    """
    Build a grounded LLM prompt from a single assembled context string.
    """

    system_rules = """You are an expert PyTorch engineer and technical assistant.

RULES:
1. Answer ONLY using the provided context.
2. If the answer is not present in the context, say:
   "The provided context does not contain enough information to answer this."
3. Prefer official documentation over issues.
4. Use code snippets ONLY if they appear in the context.
5. Do NOT invent APIs, functions, or explanations.
6. Be concise but technically precise.
"""

    prompt = f"""{system_rules}

=====================
CONTEXT
=====================
{context}

=====================
USER QUESTION
=====================
{query}

=====================
ANSWER
=====================
"""

    return prompt