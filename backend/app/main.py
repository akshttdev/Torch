"""
Torch — FastAPI HTTP layer.

Endpoints:
    GET  /healthz           service + qdrant + b2 status
    GET  /sources           per-collection chunk count + last_synced_at + status
    POST /search            hybrid retrieval (dense + BM25 + RRF + rerank), JSON
    POST /ask               grounded answer, SSE stream of token/citation/done
    GET  /eval/latest       read most recent eval/runs/latest.json
    POST /feedback          append to data/feedback.jsonl

The streaming `/ask` route lives in `app.api.ask` so this file stays scannable.
"""
from __future__ import annotations

import json
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

from app.db.qdrant import (  # noqa: E402
    CODE_COLLECTION_NAME,
    DOCS_COLLECTION_NAME,
    ISSUES_COLLECTION_NAME,
    get_qdrant,
)
from app.retrieval import bm25  # noqa: E402
from app.retrieval.hybrid import hybrid_search  # noqa: E402
from app.storage import b2  # noqa: E402

# ─────────────────────────────────────────────────────────────────────────────
# lifespan: warm up indices, register them in the BM25 registry
# ─────────────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("[torch] booting…")
    # Try to hydrate every BM25 index from local pickle (fast) or B2 (durable).
    for name in ("docs", "code", "issues"):
        idx = bm25.get(name)
        if idx is None:
            print(f"[torch] no BM25 index found yet for `{name}` — search will be dense-only")
        else:
            print(f"[torch] BM25/{name} loaded: n={idx.n}")
    yield
    print("[torch] shutting down…")


app = FastAPI(
    title="Torch API",
    description="Grounded PyTorch retrieval — hybrid dense + BM25 + RRF, streaming citations.",
    version="1.0.0-rc1",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────────────────

_origins = [
    o.strip()
    for o in os.environ.get(
        "TORCH_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# very small global token-bucket — protects /ask and /search from abuse.
# Per-IP, sliding 60s window of 30 requests.
# ─────────────────────────────────────────────────────────────────────────────

from collections import defaultdict, deque  # noqa: E402

_BUCKET_WINDOW_S = 60.0
_BUCKET_LIMIT = 30
_buckets: dict[str, deque[float]] = defaultdict(deque)


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    q = _buckets[ip]
    while q and now - q[0] > _BUCKET_WINDOW_S:
        q.popleft()
    if len(q) >= _BUCKET_LIMIT:
        return True
    q.append(now)
    return False


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ─────────────────────────────────────────────────────────────────────────────
# pydantic models
# ─────────────────────────────────────────────────────────────────────────────


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    sources: Optional[List[str]] = Field(
        default=None,
        description='Restrict retrieval to a subset of {"docs","code","issues"}.',
    )
    top_k: int = Field(default=8, ge=1, le=20)


class SearchHit(BaseModel):
    id: str
    score: float
    rrf_score: Optional[float] = None
    rerank_score: Optional[float] = None
    collection: Optional[str] = None
    payload: dict


class SearchResponse(BaseModel):
    query: str
    n: int
    results: List[SearchHit]
    latency_ms: float


class SourceRow(BaseModel):
    name: str
    kind: str
    count: int
    last_synced_at: Optional[int] = None
    bm25_loaded: bool
    status: str


class SourcesResponse(BaseModel):
    sources: List[SourceRow]


class FeedbackBody(BaseModel):
    query_id: str
    rating: int = Field(..., ge=-1, le=1)
    reason: Optional[str] = None
    query: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# routes
# ─────────────────────────────────────────────────────────────────────────────


@app.get("/healthz")
async def healthz() -> dict:
    out: dict = {
        "ok": True,
        "service": "torch",
        "version": app.version,
        "ts": datetime.now(timezone.utc).isoformat(),
        "qdrant": False,
        "b2": False,
        "bm25": bm25.stats(),
    }
    try:
        get_qdrant().get_collections()
        out["qdrant"] = True
    except Exception as e:
        out["qdrant_error"] = str(e)
    try:
        out["b2"] = b2.ping()
    except Exception as e:
        out["b2_error"] = str(e)
    return out


@app.get("/sources", response_model=SourcesResponse)
async def sources() -> SourcesResponse:
    client = get_qdrant()
    rows: List[SourceRow] = []
    for kind, qcoll in (
        ("docs", DOCS_COLLECTION_NAME),
        ("code", CODE_COLLECTION_NAME),
        ("issues", ISSUES_COLLECTION_NAME),
    ):
        count = 0
        last_synced = None
        try:
            count = client.count(collection_name=qcoll, exact=False).count
        except Exception:
            pass
        # Most recent `last_synced_at` we can find by sampling 1 point ordered desc
        try:
            sample, _ = client.scroll(
                collection_name=qcoll,
                limit=1,
                with_payload=True,
                with_vectors=False,
            )
            if sample:
                last_synced = (sample[0].payload or {}).get("last_synced_at")
        except Exception:
            pass
        idx = bm25.get(kind)
        rows.append(
            SourceRow(
                name=qcoll,
                kind=kind,
                count=count,
                last_synced_at=last_synced,
                bm25_loaded=idx is not None,
                status="healthy" if count > 0 else "empty",
            )
        )
    return SourcesResponse(sources=rows)


@app.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest, request: Request) -> SearchResponse:
    if _rate_limited(_client_ip(request)):
        raise HTTPException(status_code=429, detail="Rate limit exceeded — slow down.")

    t0 = time.perf_counter()
    rows = hybrid_search(
        req.query,
        sources=req.sources,
        rerank_top_k=req.top_k,
    )
    t_ms = (time.perf_counter() - t0) * 1000.0

    hits = []
    for r in rows:
        hits.append(
            SearchHit(
                id=str(r.get("id") or ""),
                score=float(r.get("score") or 0.0),
                rrf_score=r.get("rrf_score"),
                rerank_score=r.get("rerank_score"),
                collection=r.get("collection"),
                payload=r.get("payload", {}),
            )
        )
    return SearchResponse(
        query=req.query,
        n=len(hits),
        results=hits,
        latency_ms=round(t_ms, 2),
    )


# ─────────────────────────────────────────────────────────────────────────────
# /eval/latest
# ─────────────────────────────────────────────────────────────────────────────


def _eval_root() -> Path:
    return Path(os.environ.get("TORCH_EVAL_DIR", "../eval/runs")).resolve()


@app.get("/eval/latest")
async def eval_latest() -> dict:
    root = _eval_root()
    latest = root / "latest.json"
    if not latest.exists():
        # try to pick newest *.json
        candidates = sorted(root.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not candidates:
            raise HTTPException(
                status_code=404,
                detail="No eval runs yet. Run `python -m torch_eval.run --suite smoke`.",
            )
        latest = candidates[0]
    return json.loads(latest.read_text(encoding="utf-8"))


# ─────────────────────────────────────────────────────────────────────────────
# /feedback — append-only JSONL on disk
# ─────────────────────────────────────────────────────────────────────────────


def _feedback_path() -> Path:
    p = Path(os.environ.get("TORCH_DATA_DIR", "data")) / "feedback.jsonl"
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


@app.post("/feedback")
async def feedback(body: FeedbackBody) -> dict:
    rec = {
        **body.model_dump(),
        "ts": int(datetime.now(timezone.utc).timestamp()),
    }
    with _feedback_path().open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, separators=(",", ":")) + "\n")
    return {"ok": True}


# ─────────────────────────────────────────────────────────────────────────────
# /ask SSE — mounted from its own module to keep this file readable
# ─────────────────────────────────────────────────────────────────────────────

from app.api.ask import router as ask_router  # noqa: E402

app.include_router(ask_router)


# ─────────────────────────────────────────────────────────────────────────────
# `python -m app.main` runs the dev server
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.environ.get("TORCH_HOST", "0.0.0.0"),
        port=int(os.environ.get("TORCH_PORT", "8000")),
        reload=True,
    )
