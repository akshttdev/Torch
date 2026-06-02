"""
POST /ask — Server-Sent Events stream.

Event shapes (SSE `data:` body is the JSON):
    {"type":"sources",   "sources":[ {n,title,url,kind,score,snippet}, ... ]}
    {"type":"token",     "text":"..."}
    {"type":"citation",  "id":2}          ← every time `[n]` appears in stream
    {"type":"done",      "latency_ms":..., "n_tokens":...}
    {"type":"error",     "message":"..."}

The frontend's `EventSource` consumer can:
    – render `token` events into a prose container
    – when a `citation` event arrives, replace the literal `[2]` it just
      printed with a chip pointing to `sources[1]`
    – stop on `done` or `error`
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import time
from typing import AsyncGenerator, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.rag.prompt import build_prompt
from app.rag.rate_limit import llm_allowed, record_llm_call
from app.retrieval.hybrid import hybrid_search

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# request body
# ─────────────────────────────────────────────────────────────────────────────


class AskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    sources: list[str] | None = Field(
        default=None,
        description='Optional UI filter, subset of {"docs","code","issues"}.',
    )
    top_k: int = Field(default=8, ge=1, le=12)


# ─────────────────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────────────────

_CITE_RE = re.compile(r"\[(\d+)\]")


def _short_snippet(text: str, n: int = 220) -> str:
    text = (text or "").strip()
    if len(text) <= n:
        return text
    return text[:n].rsplit(" ", 1)[0] + "…"


def _to_source_card(idx: int, row: dict) -> dict:
    """Trim a rerank-ranked chunk into the small UI source card."""
    p = row.get("payload") or {}
    return {
        "n": idx,
        "id": str(row.get("id") or p.get("id") or ""),
        "kind": p.get("kind") or row.get("collection") or "docs",
        "title": p.get("title") or p.get("section") or "(untitled)",
        "url": p.get("source_url") or p.get("url") or "",
        "score": float(row.get("rerank_score") or row.get("score") or 0.0),
        "snippet": _short_snippet(p.get("content") or ""),
    }


def _build_numbered_prompt(query: str, sources: list[dict]) -> str:
    """
    Layer a citation contract on top of the existing prompt template.
    `app.rag.prompt.build_prompt` knows the base shape; we just append the
    numbered SOURCES list and the [n] instruction.
    """
    numbered = "\n\n".join(
        f"[{s['n']}] {s['title']}\n{s.get('url','')}\n{_short_snippet((s.get('snippet') or ''), 1200)}"
        for s in sources
    )
    contract = (
        "Cite every factual claim by appending [n] where n is the SOURCE "
        "index. If no SOURCE supports a claim, say 'I don't know.'"
    )
    return f"{build_prompt(query, numbered)}\n\n{contract}"


# ─────────────────────────────────────────────────────────────────────────────
# LLM streaming
# ─────────────────────────────────────────────────────────────────────────────


async def _stream_gemini(prompt: str) -> AsyncGenerator[str, None]:
    """Yield text chunks from Gemini. If anything fails, yield a single fallback message."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        yield "[Gemini disabled — set GEMINI_API_KEY to enable streaming answers]"
        return
    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        loop = asyncio.get_running_loop()

        # google-genai's stream method is blocking; run in a thread.
        def _iter():
            return client.models.generate_content_stream(model=model, contents=prompt)

        stream = await loop.run_in_executor(None, _iter)
        for chunk in stream:
            t = getattr(chunk, "text", None)
            if t:
                yield t
                # yield control so other coroutines (and the network) flush
                await asyncio.sleep(0)
    except Exception as e:
        yield f"\n\n[LLM error] {e}"


# ─────────────────────────────────────────────────────────────────────────────
# citation-regex stream parser
# ─────────────────────────────────────────────────────────────────────────────


async def _emit(payload: dict) -> str:
    return json.dumps(payload, separators=(",", ":"))


async def _ask_stream(req: AskRequest) -> AsyncGenerator[dict, None]:
    t0 = time.perf_counter()

    # 1. retrieve
    try:
        rows = hybrid_search(
            req.query,
            sources=req.sources,
            rerank_top_k=req.top_k,
        )
    except Exception as e:
        yield {"event": "message", "data": await _emit({"type": "error", "message": f"retrieval failed: {e}"})}
        return

    if not rows:
        yield {"event": "message", "data": await _emit({"type": "sources", "sources": []})}
        yield {"event": "message", "data": await _emit({
            "type": "token",
            "text": "I couldn't find any grounded sources for that question. Try rephrasing.",
        })}
        yield {"event": "message", "data": await _emit({
            "type": "done",
            "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
            "n_tokens": 0,
        })}
        return

    sources = [_to_source_card(i + 1, r) for i, r in enumerate(rows)]
    yield {"event": "message", "data": await _emit({"type": "sources", "sources": sources})}

    # 2. rate-limit the LLM call itself
    if not llm_allowed():
        yield {"event": "message", "data": await _emit({
            "type": "token",
            "text": "Rate limit reached on the LLM. Please try again shortly.",
        })}
        yield {"event": "message", "data": await _emit({"type": "done", "latency_ms": 0, "n_tokens": 0})}
        return
    record_llm_call()

    prompt = _build_numbered_prompt(req.query, sources)

    # 3. stream tokens, intercepting `[n]` to emit citation events
    pending = ""          # rolling buffer (handles `[` arriving in one chunk and `2]` in the next)
    n_tokens = 0
    seen_n: set[int] = set()

    async for chunk in _stream_gemini(prompt):
        pending += chunk
        # drain everything except a trailing incomplete `[…`
        while True:
            m = _CITE_RE.search(pending)
            if not m:
                # if the buffer ends mid-`[…` (no `]` yet), hold the tail
                last_open = pending.rfind("[")
                if last_open != -1 and last_open >= len(pending) - 6 and "]" not in pending[last_open:]:
                    emit, pending = pending[:last_open], pending[last_open:]
                else:
                    emit, pending = pending, ""
                if emit:
                    n_tokens += len(emit)
                    yield {"event": "message", "data": await _emit({"type": "token", "text": emit})}
                break

            # emit everything before the citation
            pre, pending = pending[: m.start()], pending[m.end():]
            if pre:
                n_tokens += len(pre)
                yield {"event": "message", "data": await _emit({"type": "token", "text": pre})}
            # emit the literal `[n]` as a token too (frontend turns it into a chip)
            n_lit = m.group(0)
            yield {"event": "message", "data": await _emit({"type": "token", "text": n_lit})}
            n_idx = int(m.group(1))
            if 1 <= n_idx <= len(sources):
                payload = {"type": "citation", "id": n_idx}
                if n_idx not in seen_n:
                    payload["source"] = sources[n_idx - 1]
                    seen_n.add(n_idx)
                yield {"event": "message", "data": await _emit(payload)}

    # flush any tail
    if pending:
        n_tokens += len(pending)
        yield {"event": "message", "data": await _emit({"type": "token", "text": pending})}

    yield {"event": "message", "data": await _emit({
        "type": "done",
        "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
        "n_tokens": n_tokens,
    })}


# ─────────────────────────────────────────────────────────────────────────────
# route
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/ask")
async def ask(req: AskRequest, request: Request) -> EventSourceResponse:
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="`query` is required")

    async def event_iter():
        async for ev in _ask_stream(req):
            if await request.is_disconnected():
                break
            yield ev

    return EventSourceResponse(event_iter())
