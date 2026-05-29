"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does Torch avoid hallucinations?",
    a: (
      <>
        The prompt is explicit: <em>answer only from provided sources, or
        refuse</em>. Every claim must carry a <span className="text-torch-600">[n]</span> marker
        that points to one of the 8 retrieved chunks. A regex on the SSE stream
        extracts these and renders inline citation chips. If retrieval returns
        nothing relevant, the answer is &quot;I don&apos;t know based on the
        indexed sources&quot; — not a confident guess.
      </>
    ),
  },
  {
    q: "What does Torch actually search?",
    a: (
      <>
        Four corpora indexed into Qdrant: the pytorch.org/docs/stable tree
        (Sphinx HTML, section-aware), the torch/* source code (AST function and
        class chunks), and the pytorch/pytorch issues and PRs from the last 12
        months. discuss.pytorch.org is queued.
      </>
    ),
  },
  {
    q: "Why hybrid retrieval over dense-only?",
    a: (
      <>
        Dense embeddings are great at paraphrase but mediocre at <em>exact
        symbol matches</em> — ask about <code className="mono text-torch-600">set_to_none=True</code> and pure-dense
        may miss the literal token. BM25 catches those. RRF (k=60) fuses both
        rankings without needing score normalization.
      </>
    ),
  },
  {
    q: "How do you measure that it actually works?",
    a: (
      <>
        A 250-question benchmark — 200 sampled from closed pytorch/pytorch
        issues whose accepted answer links a doc or source file, plus 50
        hand-picked gotchas. CI runs the suite on every push. Numbers live at{" "}
        <a href="/dashboard/eval" className="text-torch-600 hover:underline">
          /dashboard/eval
        </a>
        .
      </>
    ),
  },
  {
    q: "Which LLM powers the answers?",
    a: (
      <>
        Claude Sonnet 4.6 (Anthropic) is the primary — best citation-following
        in head-to-head testing, plus first-class streaming and prompt caching.
        Gemini 2.0 Flash is wired as a fallback behind the{" "}
        <code className="mono text-torch-600">LLM_PROVIDER</code> env var.
      </>
    ),
  },
  {
    q: "Can I run this locally?",
    a: (
      <>
        Yes — frontend is{" "}
        <code className="mono text-torch-600">npm install &amp;&amp; npm run dev</code>; backend
        needs a Qdrant Cloud URL/key (free tier covers v1 corpus), an LLM key,
        and a GitHub token for ingestion. See the Docs block above.
      </>
    ),
  },
  {
    q: "What happens when the index is stale?",
    a: (
      <>
        Each source carries a <code className="mono text-torch-600">last_synced_at</code>{" "}
        in its Qdrant payload. The dashboard shows freshness per corpus; the
        landing banner lifts a warning when{" "}
        <code className="mono text-torch-600">now - max(last_synced_at) &gt; 7d</code>.
        Re-ingestion is idempotent — UUIDs are deterministic, so re-runs
        upsert rather than duplicate.
      </>
    ),
  },
  {
    q: "Why not LangChain or LlamaIndex?",
    a: (
      <>
        Both are great frameworks. Torch hand-rolls the retrieval logic on
        purpose: the routing, fusion, and citation injection are the
        differentiators we want to <em>show</em>, not hide. Less abstraction
        also means the dashboard can expose every internal score.
      </>
    ),
  },
  {
    q: "Is there a hosted version?",
    a: (
      <>
        Not yet — v1.0 is meant to run on Vercel (frontend) + Fly.io (backend)
        with a free-tier Qdrant Cloud cluster. A public demo deploy lands with
        the eval harness.
      </>
    ),
  },
];

export function FAQBlock() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-24">
          <div className="mono mb-4 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="text-zinc-400 tabular">05</span>
            <span className="text-zinc-300">·</span>
            <span>Frequently asked</span>
          </div>
          <h3 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.35] tracking-[-0.015em] text-zinc-900">
            Common{" "}
            <span
              className="bg-torch-500 px-2 py-0.5 text-white"
              style={{
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              doubts,
            </span>
            <br />
            <span
              className="bg-torch-500 px-2 py-0.5 text-white"
              style={{
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              answered
            </span>{" "}
            without
            <br />
            marketing speak<span className="text-torch-500">.</span>
          </h3>
          <p className="mono mt-5 text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-500">
            Still curious? Open an issue on GitHub.
          </p>
        </div>
      </div>

      <ul className="col-span-12 space-y-2 lg:col-span-8">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li
              key={f.q}
              className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                isOpen ? "border-zinc-900/20" : "border-zinc-200/80"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="mono mt-0.5 shrink-0 text-[10.5px] uppercase tracking-[0.22em] text-zinc-400 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] text-zinc-900">{f.q}</div>
                  </div>
                </div>
                <span
                  aria-hidden
                  className={`mono shrink-0 select-none text-[18px] leading-none text-zinc-500 transition-transform ${
                    isOpen ? "rotate-45 text-torch-500" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 0.65, 0.4, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mono border-t border-zinc-200/70 px-5 py-4 pl-[68px] text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
