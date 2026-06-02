# Runbook — bringing Torch live

How to take the local code you've been iterating on, push it to GitHub,
clone it on the 80-core / 500 GB / RTX-2060 box, run the embedding
notebook, boot the FastAPI app, and point your Vercel-hosted dashboard
at it.

---

## 0 · Pre-flight, do this once

You already have:
- [x] **Qdrant Cloud** cluster (the same one running `media` for Synapse)
- [x] **Backblaze B2** bucket reserved for Torch's chunk backups
- [x] **GEMINI_API_KEY** set (LLM)
- [x] **GITHUB_TOKEN** set (issue ingestion rate-limit)

Confirm the Qdrant cluster has the existing collection (`media`, 1024-dim) — that's the **shared** cluster. Torch's collections will live next to it under the prefix `torch_` so they never collide:

```
cluster:  qdrant.io/<your-cluster>
  media          ← Synapse, 1024-d, untouched
  torch_docs     ← created by ingestion
  torch_code
  torch_issues
```

Change the prefix per env with `TORCH_COLLECTION_PREFIX=<whatever_>` if you ever need a sandbox.

---

## 1 · Push the working code up

From this laptop, the repo root:

```bash
git add -A
git commit -m "feat: backend live — FastAPI + hybrid (BM25+dense+RRF) + SSE /ask + B2 dual-write"
git push origin main
```

Confirm on github.com/akshttdev/Torch that `backend/app/main.py` is non-empty, `backend/app/api/ask.py` exists, `backend/notebooks/01_reembed_and_index.ipynb` is there.

---

## 2 · Clone on the box

```bash
# SSH into the 80-core box, then:
cd ~
git clone https://github.com/akshttdev/Torch.git
cd Torch/backend
```

The chunk corpus you cached earlier on this laptop (`backend/data/pytorch/`) is **not** in the repo (gitignored). On the box you have two options:

- **Re-crawl from scratch** — the docs ingestor does this anyway, and `git clone` of pytorch/pytorch for the code corpus is easy:
  ```bash
  mkdir -p data
  git clone --depth=1 https://github.com/pytorch/pytorch.git data/pytorch
  ```
- **Rsync from this laptop** if you don't want to redownload:
  ```bash
  # from this laptop:
  rsync -avz --progress backend/data/pytorch <box>:~/Torch/backend/data/
  ```

`git clone --depth=1` is fastest — about 250 MB and you don't need history.

---

## 3 · Env setup on the box

```bash
cd ~/Torch/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

That's about a 4–6 GB install (PyTorch + transformers + sentence-transformers + qdrant + boto3). Takes ~3 minutes on a fast network.

```bash
cp .env.example .env
nano .env   # fill QDRANT_URL, QDRANT_API_KEY,
            #      B2_S3_ENDPOINT_URL, B2_BUCKET,
            #      AWS_ACCESS_KEY_ID (= B2 keyID),
            #      AWS_SECRET_ACCESS_KEY (= B2 applicationKey),
            #      GEMINI_API_KEY, GITHUB_TOKEN
            #      TORCH_COLLECTION_PREFIX=torch_      (default, fine to keep)
            #      TORCH_CORS_ORIGINS=https://<your-vercel-deploy>.vercel.app,http://localhost:3000
```

Sanity check the GPU is visible:

```bash
python -c "import torch; print('cuda:', torch.cuda.is_available(), '|', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'no GPU')"
# should print:  cuda: True | NVIDIA GeForce RTX 2060
```

---

## 4 · Run the ingest notebook

```bash
pip install jupyterlab psutil          # if jupyter isn't there
jupyter lab --no-browser --ip 0.0.0.0 --port 8888 \
            --NotebookApp.token=<set-something>
```

Open `http://<box-ip>:8888/lab/tree/notebooks/01_reembed_and_index.ipynb` from this laptop.

Run cells top-to-bottom:

| Section | Time on 2060 | What lands |
|---|---|---|
| 0. Setup + env probe | <30s | confirms cuda + B2 + Qdrant reachable |
| 1. Helpers | instant | `embed_batched`, `to_record`, B2/Qdrant writers in scope |
| 2. Docs ingest | ~3 min | ~8k chunks → B2 `docs/latest.jsonl.gz` + Qdrant `torch_docs` |
| 3. Code ingest | ~8 min | ~12k chunks → B2 `code/latest.jsonl.gz` + Qdrant `torch_code` |
| 4. Issues ingest | ~5 min | ~5k chunks → B2 `issues/latest.jsonl.gz` + Qdrant `torch_issues` |
| 5. BM25 build | ~30s | three pickles → local `data/bm25/*.pkl` + B2 `bm25/*.pkl` |
| 6. Smoke test | ~2s | three sample queries through the hybrid pipeline, prints top hits |

If a cell fails mid-batch, just re-run it. UUIDs are deterministic so Qdrant upserts are idempotent; B2 batches are timestamped (versioned), and `latest.jsonl.gz` gets overwritten only on the final write.

---

## 5 · Boot the FastAPI server

```bash
cd ~/Torch/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

Smoke from the same box first:

```bash
curl http://localhost:8000/healthz
# { "ok": true, "qdrant": true, "b2": true, "bm25": {"docs":8214,"code":12480,"issues":5126}, ... }

curl http://localhost:8000/sources
# { "sources": [...four rows with live counts...] }

curl -X POST http://localhost:8000/search \
  -H 'content-type: application/json' \
  -d '{"query":"num_workers macOS hang","top_k":5}'
# returns the top-5 hybrid+rerank hits with scores
```

Streaming sanity:

```bash
curl -N -X POST http://localhost:8000/ask \
  -H 'content-type: application/json' \
  -d '{"query":"why does DataLoader hang on macOS with num_workers>0?"}'
# data: {"type":"sources", "sources":[...]}
# data: {"type":"token", "text":"On macOS, "}
# ...
# data: {"type":"citation", "id":1, "source":{...}}
# ...
# data: {"type":"done", "latency_ms":1820, "n_tokens":612}
```

---

## 6 · Expose the box to your Vercel frontend

You need a public URL that the Vercel-hosted dashboard can call. Pick one:

### Option A · **Tailscale Funnel** (free, simplest)
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
sudo tailscale serve --bg --https=443 http://localhost:8000
sudo tailscale funnel --bg 443
# prints  https://<your-tailnet-name>.ts.net  → that's your public URL
```

### Option B · **Cloudflare tunnel** (free)
```bash
# install cloudflared, then:
cloudflared tunnel --url http://localhost:8000
# prints a public https://*.trycloudflare.com URL
```

### Option C · **ngrok** (auth required, simplest UX)
```bash
ngrok http 8000
# prints https://*.ngrok-free.app
```

Whichever URL you get, in Vercel:

```
Project → Settings → Environment Variables → Add:
  Key:    NEXT_PUBLIC_API_URL
  Value:  https://<your-tunnel-url-without-trailing-slash>
  Env:    Production, Preview, Development
```

Redeploy (Deployments → ⋯ → Redeploy). The dashboard is now hitting your box.

Locally on this laptop you can also test it:

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://<your-tunnel-url>" >> .env.local
npm run dev
# http://localhost:3000/dashboard/sources   ← shows live counts from Qdrant
# http://localhost:3000/dashboard/ask       ← submit → /dashboard/q/<id> streams from box
```

---

## 7 · If Qdrant ever wipes the collections

Free-tier Qdrant Cloud will drop collections after long inactivity, or you might intentionally reset. From the box:

```bash
cd ~/Torch/backend
source .venv/bin/activate
python -m app.scripts.restore_from_b2 --all
# rebuilds torch_docs, torch_code, torch_issues from B2 in ~3 min
# (vectors are already in JSONL — no re-embed pass needed)
```

If the JSONL didn't carry vectors (older backups), the script transparently re-embeds.

---

## 8 · Day-to-day operations

**Re-ingest after a major release in pytorch.org:**
- Open the notebook, run cells 2–5 again. B2 batches are timestamped so nothing gets overwritten; `latest.jsonl.gz` updates atomically; Qdrant upserts are idempotent (deterministic UUIDs).

**Read feedback:**
- `backend/data/feedback.jsonl` accumulates one line per `/feedback` POST. Tail it with `tail -F backend/data/feedback.jsonl | jq -c`.

**Watch the server:**
```bash
# minimal request log goes to stdout; for structured logs:
LOGURU_LEVEL=INFO uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Stop the server cleanly:**
```bash
# Ctrl-C; or if in a tmux:
pkill -f 'uvicorn app.main:app'
```

---

## Common gotchas

- **`cuda: False` in the notebook** — the system PyTorch wheel isn't the CUDA build. Fix:
  ```bash
  pip uninstall -y torch
  pip install torch --index-url https://download.pytorch.org/whl/cu121
  ```
- **`401` from Qdrant** — `QDRANT_API_KEY` is the *cluster* API key from Qdrant Cloud → Cluster details → API keys, not your account password.
- **`403` from B2** — make sure the application key has `read+write` on the bucket; the master account key works but is overkill.
- **CORS in the browser** — add your Vercel domain to `TORCH_CORS_ORIGINS` (comma-separated) and restart uvicorn.
- **`/ask` returns instantly with `[Gemini disabled — set GEMINI_API_KEY…]`** — the env var isn't being read; check `.env` is in `backend/` and you started uvicorn from `backend/`.

---

## Frontend ↔ backend status

| Page | Backend wired? | Notes |
|---|---|---|
| `/dashboard/sources` | ✅ via `getSources()` | falls back to mock if backend unreachable, banner shows "mock data" |
| `/dashboard/ask` | ✅ submits to `/dashboard/q/<id>` with sessionStorage handoff | filter pills map to backend `sources` array |
| `/dashboard/q/[id]` | ✅ via `streamAsk()` | SSE consumer with citation chips + right-rail cards |
| `/dashboard/eval` | mock data | wired once the eval harness lands |
| `/dashboard/q` (history) | localStorage only | no backend persistence yet (intentional) |
| `/dashboard/` (overview) | mock data | the 4 dashed stat cards stay mocked for now |

That's everything to get a live demo running. From the box, expose, point Vercel at it, and you can ask real PyTorch questions through the dashboard with grounded citations within the hour.
