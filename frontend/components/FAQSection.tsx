"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs: { q: string; a: React.ReactNode; tag: string }[] = [
  {
    tag: "grounding",
    q: "How does Torch avoid hallucinations?",
    a: (
      <>
        The prompt is explicit: <em>answer only from the provided sources, or refuse</em>.
        Every factual claim must carry a <span className="text-torch-300">[n]</span> marker
        that points to one of the eight retrieved chunks. A regex on the SSE stream extracts
        the markers and renders them as inline citation chips. If retrieval returns nothing
        relevant, the answer is &quot;I don&apos;t know based on the indexed sources&quot;
        — not a confident guess.
      </>
    ),
  },
  {
    tag: "sources",
    q: "What does Torch actually search?",
    a: (
      <>
        Four corpora indexed into Qdrant: the entire <span className="text-zinc-200">pytorch.org/docs/stable</span> tree
        (Sphinx HTML, section-aware), the <span className="text-zinc-200">torch/*</span> source code (AST-level
        function and class chunks), the <span className="text-zinc-200">pytorch/pytorch</span> GitHub
        issues and PRs from the last 12 months, and (queued) the discuss.pytorch.org forum +
        Stack Overflow <code className="mono text-torch-300">[pytorch]</code> tag.
      </>
    ),
  },
  {
    tag: "retrieval",
    q: "Why hybrid retrieval over dense-only?",
    a: (
      <>
        Dense embeddings are great at paraphrase but mediocre at <em>exact symbol matches</em> —
        ask about <code className="mono text-torch-300">set_to_none=True</code> and a pure-dense
        query may return only thematically related chunks. BM25 over the same payloads catches
        the literal token. Reciprocal Rank Fusion (k=60) combines both rankings without needing
        score normalization across heterogeneous embedders. The reranker then takes the top 30
        and re-orders with a cross-encoder.
      </>
    ),
  },
  {
    tag: "eval",
    q: "How do you measure that it actually works?",
    a: (
      <>
        A 250-question benchmark — 200 sampled from closed <span className="text-zinc-200">pytorch/pytorch</span>
        issues whose accepted answer links a doc or source file, plus 50 hand-picked gotchas. CI
        runs the suite on every push to main. We report Hit@1 / Hit@5 / MRR / Recall@10 for retrieval,
        plus citation precision and RAGAS faithfulness for generation, and p50/p95/p99 first-token
        latency. The numbers live at <a href="/dashboard/eval" className="text-torch-300 underline-offset-2 hover:underline">/dashboard/eval</a>.
      </>
    ),
  },
  {
    tag: "model",
    q: "Which LLM powers the answers?",
    a: (
      <>
        Claude Sonnet 4.6 (Anthropic) is the primary — best citation-following in head-to-head
        testing, plus first-class streaming and prompt caching (cache the 8-chunk SOURCES list so
        only the question rebuilds the prompt). Gemini 2.0 Flash is wired as a fallback behind the
        <code className="mono text-torch-300"> LLM_PROVIDER</code> env var.
      </>
    ),
  },
  {
    tag: "self-host",
    q: "Can I run this locally?",
    a: (
      <>
        Yes — frontend is <code className="mono text-torch-300">npm install && npm run dev</code>;
        backend needs a Qdrant Cloud URL/key (free tier covers v1 corpus), an Anthropic or Gemini
        key, and a GitHub token for ingestion. The full <code className="mono text-torch-300">docker compose up</code> wiring
        ships with v1. See the <a href="#docs" className="text-torch-300 underline-offset-2 hover:underline">docs section</a> above.
      </>
    ),
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-24">
          <div className="mono mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            /// FREQUENTLY ASKED
          </div>
          <h3 className="text-[clamp(1.6rem,3vw,2.2rem)] font-medium uppercase leading-[1.02] tracking-[-0.01em] text-zinc-50">
            COMMON DOUBTS,
            <br />
            ANSWERED WITHOUT
            <br />
            MARKETING SPEAK<span className="text-torch-500">.</span>
          </h3>
          <p className="mono mt-5 text-[11.5px] uppercase leading-relaxed tracking-[0.14em] text-zinc-500">
            STILL CURIOUS? OPEN AN ISSUE ON GITHUB OR READ THE
            FULL AUDIT IN{" "}
            <code className="text-torch-300">TORCH_PLAN.MD</code>.
          </p>
        </div>
      </div>

      <ul className="col-span-12 space-y-2 lg:col-span-8">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <li
              key={f.q}
              className={`overflow-hidden rounded-md border transition-colors ${
                isOpen
                  ? "border-torch-500/40 bg-torch-500/[0.04]"
                  : "border-white/8 bg-ink-100/30 hover:bg-white/[0.02]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="mono shrink-0 text-[10px] uppercase tracking-[0.22em] text-zinc-600 tabular pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="mono mb-1 text-[9.5px] uppercase tracking-[0.22em] text-torch-400">
                      {f.tag}
                    </div>
                    <div className="text-[13px] font-semibold uppercase leading-snug tracking-[0.06em] text-zinc-100">
                      {f.q}
                    </div>
                  </div>
                </div>
                <span
                  aria-hidden
                  className={`mono shrink-0 select-none text-[18px] leading-none text-zinc-500 transition-transform ${
                    isOpen ? "rotate-45 text-torch-300" : ""
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
                    <div className="mono border-t border-white/5 px-5 py-4 pl-[68px] text-[11.5px] leading-relaxed tracking-[0.04em] text-zinc-300">
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
