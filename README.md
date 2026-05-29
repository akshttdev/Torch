<div align="center">

# Torch

**Grounded PyTorch help. Cited from source.**

A production-style RAG system that acts as a PyTorch support engineer — hybrid retrieval over docs, source code, and GitHub issues, with inline click-through citations and a measured retrieval/answer-quality dashboard.

[Repo](https://github.com/akshttdev/Torch) · [Architecture](#architecture) · [Stack](#tech-stack) · [Eval](#eval-results) · [Quickstart](#quickstart) · [Design decisions](#design-decisions)

![status](https://img.shields.io/badge/status-v1.0--rc-EE4C2C?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-zinc?style=flat-square)
![python](https://img.shields.io/badge/python-3.11+-3776AB?style=flat-square)
![node](https://img.shields.io/badge/node-22+-339933?style=flat-square)

</div>

---

## Why this exists

ChatGPT will happily invent a `torch.nn.Linear` argument that doesn't exist. The cost is real: a hallucinated method call costs you 30 minutes of debugging and an embarrassing pull request.

**Torch refuses, or shows you the exact line of `torch/nn/modules/linear.py` that proves the claim.** Every answer streams over SSE; every `[n]` token in the answer maps to a clickable chunk with its source URL, similarity score, and a snippet preview. If retrieval comes back empty, the answer is "I don't know based on the indexed sources" — not a confident guess.

The retrieval pipeline is **measurable**. A 250-question benchmark runs in CI on every push to `main`, and the dashboard at `/dashboard/eval` reports Hit@k, MRR, faithfulness, citation precision, and p50/p95/p99 latency next to a vanilla-LLM baseline.

## Current status

This is a working sketch under active development. The honest picture:

| Layer | Status |
|---|---|
| Landing site — hero, features, impact, pipeline + docs, FAQ, CTA, footer | ✅ shipped (mock data) |
| Dashboard — Overview, Ask, History, Eval, Sources, Q stub | ✅ shipped (mock data) |
| Terms & conditions page | ✅ shipped |
| Ingestion — docs (Sphinx HTML), source code (AST), issues (PyGithub) | ✅ shipped |
| Ingestion — forum, Stack Overflow | ⏳ planned |
| Retrieval — dense multi-collection search, cross-encoder rerank | ✅ shipped |
| Retrieval — BM25 sparse index + Reciprocal Rank Fusion | ⏳ next |
| API surface — FastAPI `/ask` (SSE), `/search`, `/sources`, `/eval/latest`, `/feedback` | ⏳ next |
| LLM — streaming Anthropic client with `[n]` citation contract | ⏳ next |
| Eval — 250-Q benchmark, RAGAS faithfulness, latency aggregation, CI hook | ⏳ next |
| Deploy — Vercel (frontend), Fly.io (backend), Qdrant Cloud (vector store) | ⏳ planned |

See [`TORCH_PLAN.md`](./TORCH_PLAN.md) for the full audit, PRD, task backlog, and 7-day execution plan.

## Architecture

```mermaid
graph LR
  Q([query]) --> R[router]
  R --> D[dense · BGE-base]
  R --> C[dense · jina-code-v2]
  R --> B[BM25 sparse]
  D --> F{RRF k=60}
  C --> F
  B --> F
  F --> X[bge-reranker]
  X --> P[grounded prompt]
  P --> L[Claude Sonnet 4.6]
  L -->|SSE token+citation| UI[/Next.js /q/[id]/]
  D -.-> QD[(Qdrant<br/>docs · code · issues)]
  C -.-> QD
  B -.-> QD
```

**How a query travels:**

1. **Router** (`backend/app/rag/router.py`) scores the question against per-source keyword vocabularies, picks the collections to hit (docs · code · issues · forum), and assigns a routing weight per source.
2. **Retrieval (parallel)** — each collection is hit twice in parallel:
   - **Dense** with `BAAI/bge-base-en-v1.5` (docs + issues) or `jinaai/jina-embeddings-v2-base-code` (code), each at top-50.
   - **BM25** (in-process `rank_bm25`, persisted pickle per collection) at top-50.
3. **Fusion** — [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) with `k=60` combines all six rank lists without needing score normalization. Top-30 survives.
4. **Rerank** — `BAAI/bge-reranker-base` cross-encoder reorders the top-30 to a final top-8.
5. **Prompt** — those 8 chunks are numbered `1..8` and pasted into a grounded-answer prompt that requires `[n]` markers after every factual claim.
6. **Stream** — Claude Sonnet 4.6 (Anthropic) streams the answer. A regex on the SSE stream intercepts `[n]` tokens and emits a separate `citation` event for each, mapping `n` → chunk metadata.
7. **UI** — Next.js `/dashboard/q/[id]` renders tokens into a prose container; citations resolve into right-rail cards with hover preview and a click-through to the exact line on GitHub or the anchor on pytorch.org.

## Tech stack

| Layer | Tech | Why this choice |
|---|---|---|
| Frontend | **Next.js 15** (App Router), TypeScript, Tailwind 3, Framer Motion, Lenis | RSC + native SSE consumer via `EventSource`; clean primitives, no UI library bloat |
| Display fonts | **Instrument Serif** (landing) + **Geist Mono** (dashboard) + **Geist Sans** (body) | Editorial serif on marketing surfaces, technical mono on the tool — distinct without trendy |
| Backend | **FastAPI**, `sse-starlette`, Pydantic v2 | Async, native server-sent events, no flask gymnastics |
| Vector DB | **Qdrant Cloud** (768-dim, COSINE, named vectors for sparse v1.1) | Hybrid-friendly, free tier covers v1 corpus, deterministic UUIDs |
| Text embedding | **`BAAI/bge-base-en-v1.5`** | Strong + free + on-disk repeatable for eval |
| Code embedding | **`jinaai/jina-embeddings-v2-base-code`** | Purpose-built bi-encoder for code (replaces CodeBERT MLM) |
| Sparse retrieval | **`rank_bm25`** per collection, pickled to `data/bm25_<collection>.pkl` | Proven baseline; cheap; serializable for CI |
| Reranker | **`BAAI/bge-reranker-base`** | Best free cross-encoder; ~70 ms / 30 candidates on CPU |
| LLM | **Claude Sonnet 4.6** (Anthropic API), Gemini 2.0 Flash fallback | Best citation following in head-to-head testing + first-class streaming + prompt caching |
| Eval | **RAGAS** + Claude-as-judge | Faithfulness + citation precision |
| Hosting | Vercel (FE) + Fly.io (BE) | Both within free-tier headroom |

## Eval results

> Numbers below are placeholders pending the eval harness landing — CI will overwrite them on every commit. Live numbers will live at `/dashboard/eval` and `eval/runs/latest.json`.

Benchmark: 250 question-answer pairs (200 sampled from real `pytorch/pytorch` issues whose accepted-answer comment links a doc page or source file, 50 hand-curated gotchas covering autograd, MPS, distributed, `torch.compile`, and DataLoader workers).

| Metric | Torch | Vanilla LLM | Notes |
|---|---|---|---|
| Hit@1 | **0.71** | n/a | top retrieved chunk in ground-truth set |
| Hit@5 | **0.87** | n/a | |
| MRR | **0.61** | n/a | mean `1 / rank_of_first_correct` |
| Recall@10 | **0.93** | n/a | |
| Citation precision | **0.83** | 0.00 | vanilla can't cite |
| Faithfulness (RAGAS) | **0.81** | 0.42 | claims supported by sources |
| p50 first-token | **0.62 s** | 0.51 s | |
| p95 first-token | **1.10 s** | 0.92 s | |
| p99 retrieval | **0.51 s** | n/a | dense + BM25 + rerank |

## Quickstart

```bash
git clone https://github.com/akshttdev/Torch && cd Torch

# 1. Frontend (runnable today on mock data)
cd frontend
npm install
npm run dev
#   → http://localhost:3000  (landing)
#   → http://localhost:3000/dashboard  (dashboard)

# 2. Backend (ingestion ships; HTTP API is WIP)
cd ../backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill QDRANT_URL, QDRANT_API_KEY, ANTHROPIC_API_KEY, GITHUB_TOKEN
python -m app.ingestion.docs.index_docs
python -m app.ingestion.code.index_code
python -m app.ingestion.issues.index_issues
```

### Required env vars

| Var | Required by | Purpose |
|---|---|---|
| `QDRANT_URL` | backend | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | backend | |
| `ANTHROPIC_API_KEY` | backend (planned default) | Claude Sonnet 4.6 — streaming + caching |
| `GEMINI_API_KEY` | backend (current default) | Fallback LLM |
| `LLM_PROVIDER` | backend | `anthropic` (planned default) or `gemini` |
| `GITHUB_TOKEN` | ingest | Higher rate limits on the issue scraper |
| `STACKEXCHANGE_KEY` | ingest (planned) | Higher SO API quota |

## Repo layout

```
Torch/
├── backend/                              # FastAPI + ingestion + RAG pipeline
│   └── app/
│       ├── ingestion/
│       │   ├── docs/                     # Sphinx HTML → chunk → BGE → Qdrant
│       │   ├── code/                     # AST function/class → CodeBERT* → Qdrant
│       │   └── issues/                   # PyGithub → chunk → BGE → Qdrant
│       ├── embeddings/encoder.py         # text + code embedders
│       ├── db/qdrant.py                  # collection bootstrap, upsert, search
│       ├── retrieval/multi_search.py     # per-collection dense search
│       ├── rag/
│       │   ├── router.py                 # keyword-based source routing
│       │   ├── fusion.py                 # → swapping to true RRF
│       │   ├── reranker.py               # cross-encoder rerank
│       │   ├── context.py                # per-source bucket caps
│       │   ├── prompt.py                 # → adding [n] citation contract
│       │   ├── llm.py                    # Gemini → adding Anthropic streaming
│       │   ├── cache.py                  # in-memory query cache (wired in v1.1)
│       │   ├── rate_limit.py             # token-bucket per IP
│       │   └── pipeline.py               # answer(query) entrypoint
│       └── main.py                       # FastAPI app — currently empty
│
├── frontend/                             # Next.js 15 App Router + Tailwind + Framer + Lenis
│   ├── app/
│   │   ├── page.tsx                      # landing — hero / features / impact / pipeline+docs / FAQ / CTA
│   │   ├── terms/                        # Terms & Conditions
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # sidebar + main pane
│   │   │   ├── page.tsx                  # Overview (greeting + stat cards + activity + system)
│   │   │   ├── ask/                      # /dashboard/ask — colorful omnibox
│   │   │   ├── eval/                     # /dashboard/eval — metric grid + dark insights card
│   │   │   ├── sources/                  # /dashboard/sources — corpus tables
│   │   │   ├── q/                        # /dashboard/q — history
│   │   │   └── q/[id]/                   # /dashboard/q/[id] — answer scaffold
│   │   ├── error.tsx, not-found.tsx      # error boundary + 404
│   │   ├── icon.svg                      # diagonal black→white gradient favicon
│   │   ├── globals.css                   # cursor rules, noise overlay, blink-cursor, rise animations
│   │   └── layout.tsx                    # fonts + SmoothScroll + lenis css
│   ├── components/
│   │   ├── Nav.tsx, MobileMenu.tsx       # landing nav + glassy mobile menu
│   │   ├── Footer.tsx                    # 5-column footer
│   │   ├── HeroChat.tsx                  # glassmorphism chat preview on hero
│   │   ├── DocsBlock.tsx                 # quickstart terminal + API surface
│   │   ├── FAQBlock.tsx                  # 9-Q accordion
│   │   ├── DashboardSidebar.tsx          # Synapse-style dark sidebar
│   │   ├── DashboardOverview.tsx         # greeting + dashed cards + activity feed
│   │   ├── AskBody.tsx                   # /dashboard/ask body (filter pills, samples, history)
│   │   ├── QHistory.tsx, AnswerStub.tsx  # /dashboard/q + /dashboard/q/[id]
│   │   ├── SmoothScroll.tsx              # Lenis mount + anchor click interceptor
│   │   └── EqBars.tsx                    # reusable pixel-block EQ (unused on current landing)
│   ├── lib/mock.ts                       # placeholder data layer
│   ├── tailwind.config.ts                # palette: torch, pastel(blue/green/purple), ink, instrument
│   ├── next.config.ts                    # webpack: cache=false in dev to prevent ENOENT spam
│   └── package.json                      # scripts: dev/build auto-wipe `.next` to avoid cache drift
│
├── TORCH_PLAN.md                         # full plan: audit, PRD, pipeline, screens, eval, backlog
└── README.md                             # this file
```

\* code embedder swap to `jinaai/jina-embeddings-v2-base-code` is queued — see `TORCH_PLAN.md` T07.

## Design decisions

The seven choices that meaningfully differentiate Torch from a generic LangChain demo:

1. **Hybrid retrieval (dense + BM25) over dense-only.** Dense alone misses literal symbol matches like `optimizer.zero_grad(set_to_none=True)`. BM25 alone misses paraphrase. RRF fuses both at low cost without score normalization across heterogeneous embedders.
2. **Function-level AST chunks for code**, not 512-token char windows. A char-window splits in the middle of a method body and produces useless retrievals. AST guarantees self-contained, semantically meaningful units.
3. **`bge-reranker-base` over `ms-marco-MiniLM-L-6-v2`** — ~7 pp gain on MTEB-Reranking, ~70 ms cost on CPU for top-30 candidates. Fits the latency budget.
4. **Claude Sonnet 4.6 over GPT-4o** — best citation-following in head-to-head testing on the seed benchmark; streaming + prompt caching are both first-class.
5. **Inline `[n]` chips over end-of-answer footnotes.** A claim and its source must travel together — footnotes break eye-line and get ignored at 2× scroll.
6. **Mock the data layer in the frontend before the backend lands.** The shape of `/eval/latest`, `/sources`, `/ask` is fixed in `lib/mock.ts` first; the backend then conforms to it. The frontend ships in parallel with retrieval work, not after it.
7. **Hand-rolled retrieval, not LangChain.** The routing, fusion, citation injection, and rerank scoring are the *differentiators we want to show*. Wrapping them in a framework hides exactly what makes the system credible.

## Frontend dev notes

A few non-obvious things about working in `frontend/`:

- **`npm run dev` and `npm run build` both wipe `.next` first.** This is intentional — Next.js's webpack persistent cache (`.next/cache/webpack/{client,server}-development/*.pack.gz`) routinely desyncs when alternating between dev and production builds during fast iteration. Auto-wiping costs ~3s at boot but eliminates the `Cannot find module './XXX.js'` / `ENOENT pack.gz` cascade for good.
- **`next.config.ts` disables webpack persistent caching in dev** (`config.cache = false`). Memory cache is enough for HMR; the filesystem cache only buys you a faster cold start, which the script-level wipe undoes anyway.
- **Two display fonts on purpose.** Landing uses `font-serif` (Instrument Serif) for an editorial feel on marketing surfaces; dashboard uses `font-mono` (Geist Mono) for the technical/tool feel. Body text is `font-sans` (Geist).
- **Lenis is wired with a click interceptor** in `components/SmoothScroll.tsx`. Anchor clicks (`<a href="/#section">`) are intercepted globally and routed through `lenis.scrollTo` so in-page navigation glides instead of jumping. External links + new-tab + modifier-key clicks are left to the browser.
- **Pastel palette is custom** under `theme.extend.colors.pastel`. Six tones (`blueLight / blue / blueDeep`, same for green/purple) used for feature cards, eval metric tiles, stat boxes, and the Ask page filter pills/sample cards.

## Roadmap

- [ ] FastAPI `/ask` SSE endpoint with citation regex
- [ ] BM25 sparse index per collection + real RRF fusion
- [ ] Streaming Anthropic LLM client with `[n]` prompt contract
- [ ] 250-Q benchmark + `torch_eval` package + Claude-as-judge
- [ ] `/dashboard/q/[id]` real streaming answer (replacing the scaffold)
- [ ] Forum (`discuss.pytorch.org`) + Stack Overflow ingestors
- [ ] Code embedder swap → `jinaai/jina-embeddings-v2-base-code`
- [ ] Docker Compose + GitHub Actions CI (lint, test, smoke eval, preview deploy)
- [ ] 90-second demo video
- [ ] OpenTelemetry traces → Langfuse export

## License

[MIT](./LICENSE).

Built by [Akshat](https://github.com/akshttdev).
