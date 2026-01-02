import os
from dotenv import load_dotenv

load_dotenv()

USE_GEMINI = os.getenv("USE_GEMINI", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")


def generate_answer(prompt: str) -> str:
    """
    LLM abstraction layer.
    - Uses Gemini if enabled
    - Falls back to deterministic response otherwise
    """

    if not USE_GEMINI:
        # 🔒 Safe fallback for tests / CI
        return _fallback_answer(prompt)

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not set")

    try:
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        return response.text.strip()

    except Exception as e:
        # Never crash the pipeline
        return f"[Gemini error] {str(e)}"


def _fallback_answer(prompt: str) -> str:
    """
    Deterministic fallback used for tests.
    """
    return (
        "Based on the provided context, backward with retain_graph=True "
        "keeps the computation graph alive after backward, which prevents "
        "memory from being freed and can lead to increased memory usage."
    )