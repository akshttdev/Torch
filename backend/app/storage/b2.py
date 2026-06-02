"""
Backblaze B2 storage layer (S3-compatible API via boto3).

Why this module exists:
    Qdrant Cloud's free tier can purge collections at any time. B2 holds the
    durable source of truth — every chunk we ingest is written here as
    JSONL.gz first, then pushed to Qdrant. If Qdrant gets wiped, we can
    rebuild every collection from B2 without re-crawling pytorch.org.

Bucket layout:
    <bucket>/
      docs/
        chunks/<isoformat-utc>.jsonl.gz      ← versioned, immutable batch
        latest.jsonl.gz                       ← pointer to most recent
      code/  same shape
      issues/ same shape
      bm25/<collection>.pkl                  ← serialized BM25 index
      eval/runs/<ts>.json                    ← eval run results

JSONL chunk record shape (one chunk per line):
    {
      "id": "<deterministic-uuid5-string>",
      "kind": "docs|code|issues|forum|so",
      "source_url": "...",
      "title": "...",
      "section": "...",
      "content": "...",          ← raw chunk text
      "anchor": "L120-L155",
      "labels": [...],
      "state": "open|closed",
      "score": null,
      "last_synced_at": 1717350000,
      "sha": null,
      "vector": [0.123, ...]    ← OPTIONAL; if present, restore skips re-embed
    }
"""
from __future__ import annotations

import gzip
import io
import json
import os
import pickle
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, Iterator, Optional

import boto3
from botocore.client import BaseClient
from botocore.config import Config
from botocore.exceptions import ClientError

# ─────────────────────────────────────────────────────────────────────────────
# client + bucket
# ─────────────────────────────────────────────────────────────────────────────

_client: Optional[BaseClient] = None


def _bucket() -> str:
    name = os.environ.get("B2_BUCKET")
    if not name:
        raise RuntimeError("B2_BUCKET env var is not set")
    return name


def client() -> BaseClient:
    """Lazy boto3 S3 client pointed at the B2 endpoint."""
    global _client
    if _client is not None:
        return _client
    endpoint = os.environ.get("B2_S3_ENDPOINT_URL")
    if not endpoint:
        raise RuntimeError(
            "B2_S3_ENDPOINT_URL is not set. "
            "Copy it from B2 Buckets → your bucket → 'Endpoint'."
        )
    _client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        # AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY picked up from env
        config=Config(
            retries={"max_attempts": 5, "mode": "standard"},
            s3={"addressing_style": "virtual"},
        ),
    )
    return _client


def ping() -> bool:
    """Verify creds + endpoint by listing one object. Returns True if OK."""
    try:
        client().list_objects_v2(Bucket=_bucket(), MaxKeys=1)
        return True
    except ClientError:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# generic put/get
# ─────────────────────────────────────────────────────────────────────────────


def put_bytes(key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
    client().put_object(
        Bucket=_bucket(),
        Key=key,
        Body=data,
        ContentType=content_type,
    )


def get_bytes(key: str) -> bytes:
    resp = client().get_object(Bucket=_bucket(), Key=key)
    return resp["Body"].read()


def exists(key: str) -> bool:
    try:
        client().head_object(Bucket=_bucket(), Key=key)
        return True
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


def list_keys(prefix: str) -> list[str]:
    paginator = client().get_paginator("list_objects_v2")
    out: list[str] = []
    for page in paginator.paginate(Bucket=_bucket(), Prefix=prefix):
        for obj in page.get("Contents", []) or []:
            out.append(obj["Key"])
    return out


# ─────────────────────────────────────────────────────────────────────────────
# chunk dual-write helpers
# ─────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class CollectionLayout:
    name: str  # "docs" | "code" | "issues" | ...

    @property
    def chunks_prefix(self) -> str:
        return f"{self.name}/chunks/"

    def batch_key(self, ts: Optional[datetime] = None) -> str:
        ts = ts or datetime.now(timezone.utc)
        stamp = ts.strftime("%Y-%m-%dT%H-%M-%SZ")
        return f"{self.name}/chunks/{stamp}.jsonl.gz"

    @property
    def latest_key(self) -> str:
        return f"{self.name}/latest.jsonl.gz"

    @property
    def bm25_key(self) -> str:
        return f"bm25/{self.name}.pkl"


def write_chunks_batch(
    layout: CollectionLayout,
    records: Iterable[dict],
    *,
    update_latest: bool = True,
    ts: Optional[datetime] = None,
) -> tuple[str, int]:
    """
    Gzip the chunk records as JSONL and write them under
        <kind>/chunks/<ts>.jsonl.gz
    Also (optionally) update the <kind>/latest.jsonl.gz pointer to the same blob.

    Returns (batch_key, n_records).
    """
    buf = io.BytesIO()
    n = 0
    with gzip.GzipFile(fileobj=buf, mode="wb", mtime=0) as gz:
        for r in records:
            gz.write((json.dumps(r, separators=(",", ":")) + "\n").encode("utf-8"))
            n += 1
    blob = buf.getvalue()
    bkey = layout.batch_key(ts)
    put_bytes(bkey, blob, content_type="application/gzip")
    if update_latest:
        # Cheap to re-upload; B2 has no server-side copy that preserves ETag here
        # without extra ceremony, and the blob is small (< a few MB).
        put_bytes(layout.latest_key, blob, content_type="application/gzip")
    return bkey, n


def read_chunks(key: str) -> Iterator[dict]:
    """Stream-parse a JSONL.gz chunk file."""
    raw = get_bytes(key)
    with gzip.GzipFile(fileobj=io.BytesIO(raw), mode="rb") as gz:
        for line in gz:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def read_latest(layout: CollectionLayout) -> Iterator[dict]:
    """Convenience: stream-parse the most recent batch."""
    yield from read_chunks(layout.latest_key)


# ─────────────────────────────────────────────────────────────────────────────
# BM25 pickle dual-write
# ─────────────────────────────────────────────────────────────────────────────


def write_bm25(layout: CollectionLayout, payload: dict) -> str:
    """Pickle the BM25 index payload to <bm25>/<collection>.pkl."""
    data = pickle.dumps(payload, protocol=pickle.HIGHEST_PROTOCOL)
    put_bytes(layout.bm25_key, data, content_type="application/octet-stream")
    return layout.bm25_key


def read_bm25(layout: CollectionLayout) -> Optional[dict]:
    """Load the pickled BM25 index, or None if it doesn't exist yet."""
    if not exists(layout.bm25_key):
        return None
    return pickle.loads(get_bytes(layout.bm25_key))


# ─────────────────────────────────────────────────────────────────────────────
# named layouts (single source of truth — import these, don't construct)
# ─────────────────────────────────────────────────────────────────────────────

DOCS = CollectionLayout("docs")
CODE = CollectionLayout("code")
ISSUES = CollectionLayout("issues")
FORUM = CollectionLayout("forum")
SO = CollectionLayout("so")

ALL = (DOCS, CODE, ISSUES, FORUM, SO)
