from typing import List, Union, Dict


def build_prompt(query: str, context: Union[str, List[Dict]]) -> str:
    # Case 1: context already assembled (string)
    if isinstance(context, str):
        formatted_context = context

    # Case 2: structured context (list of dicts)
    else:
        blocks = []
        for i, chunk in enumerate(context, start=1):
            source = chunk.get("source", "unknown").upper()
            content = chunk.get("content", "").strip()

            blocks.append(
                f"[CONTEXT {i}]\n"
                f"SOURCE: {source}\n"
                f"{content}"
            )

        formatted_context = "\n\n".join(blocks)

    return f"""
You are an expert PyTorch engineer and technical assistant.

RULES:
1. Answer ONLY using the provided context.
2. If the answer is not present in the context, say:
   "The provided context does not contain enough information to answer this."
3. Prefer official documentation over issues.
4. Use code snippets ONLY if they appear in the context.
5. Do NOT invent APIs, functions, or explanations.
6. Be concise but technically precise.

=====================
CONTEXT
=====================
{formatted_context}

=====================
USER QUESTION
=====================
{query}

=====================
ANSWER
=====================
""".strip()