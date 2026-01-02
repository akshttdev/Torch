import time

LLM_CALLS = []
RATE_LIMIT = 5   # calls per minute
WINDOW = 60      # seconds


def llm_allowed() -> bool:
    global LLM_CALLS
    now = time.time()

    # keep only recent calls
    LLM_CALLS = [t for t in LLM_CALLS if now - t < WINDOW]
    return len(LLM_CALLS) < RATE_LIMIT


def record_llm_call():
    LLM_CALLS.append(time.time())