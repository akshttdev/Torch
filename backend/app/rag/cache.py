import time
import hashlib
from typing import Any, Dict

# Simple in-memory cache (replace with Redis later)
_QUERY_CACHE: Dict[str, Dict] = {}

DEFAULT_TTL = 600  # 10 minutes


def _hash_query(query: str) -> str:
    return hashlib.sha256(query.strip().lower().encode()).hexdigest()


def get_cached(query: str):
    key = _hash_query(query)
    entry = _QUERY_CACHE.get(key)

    if not entry:
        return None

    if time.time() - entry["ts"] > entry["ttl"]:
        del _QUERY_CACHE[key]
        return None

    return entry["value"]


def set_cached(query: str, value: Any, ttl: int = DEFAULT_TTL):
    key = _hash_query(query)
    _QUERY_CACHE[key] = {
        "value": value,
        "ts": time.time(),
        "ttl": ttl,
    }