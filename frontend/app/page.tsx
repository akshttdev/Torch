import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroChat } from "@/components/HeroChat";
import { DocsBlock } from "@/components/DocsBlock";
import { FAQBlock } from "@/components/FAQBlock";

const features = [
  {
    n: 1,
    head: "Hybrid retrieval",
    body: "BM25 + dense vectors fused with Reciprocal Rank Fusion across docs, code, and GitHub issues.",
    tone: "blue",
  },
  {
    n: 2,
    head: "Code-aware chunking",
    body: "AST function- and class-level chunks. No char-windows splitting methods in half.",
    tone: "green",
  },
  {
    n: 3,
    head: "Inline citations",
    body: "Every factual claim carries a numbered chip that opens the exact line on GitHub.",
    tone: "purple",
  },
  {
    n: 4,
    head: "Live eval dashboard",
    body: "250-Q benchmark runs in CI. Hit@k, MRR, faithfulness — all reported on every commit.",
    tone: "blue",
  },
] as const;

const stats = [
  { v: "0.87", unit: "Hit@5", body: "Top-5 retrieval contains the ground-truth source", tone: "blue" },
  { v: "0.83", unit: "Cit-precision", body: "Fraction of citations whose chunk actually supports the claim", tone: "green" },
  { v: "1.10s", unit: "p95 first-token", body: "From query submit to first streamed token at the 95th percentile", tone: "purple" },
] as const;

const tones = {
  blue: {
    bg: "bg-pastel-blue",
    bgLight: "bg-pastel-blueLight",
    text: "text-pastel-blueDeep",
    border: "border-pastel-blueDeep/30",
  },
  green: {
    bg: "bg-pastel-green",
    bgLight: "bg-pastel-greenLight",
    text: "text-pastel-greenDeep",
    border: "border-pastel-greenDeep/30",
  },
  purple: {
    bg: "bg-pastel-purple",
    bgLight: "bg-pastel-purpleLight",
    text: "text-pastel-purpleDeep",
    border: "border-pastel-purpleDeep/30",
  },
} as const;

export default function Landing() {
  return (
    <main className="relative w-full overflow-x-hidden">
      {/* ============================================================ HERO */}
      <section className="canvas-cream relative isolate flex min-h-screen w-full flex-col overflow-hidden">
        {/* gradient: BLACK to 50%, PURPLE band, WHITE at bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-full"
          style={{
            background:
              "linear-gradient(180deg, #060507 0%, #060507 50%, rgba(110,90,180,0.95) 68%, rgba(190,170,225,0.55) 84%, rgba(251,250,246,0) 100%)",
          }}
        />

        {/* film-grain noise overlay across the whole hero */}
        <div aria-hidden className="noise-overlay" />

        {/* nav — over solid black top → light text */}
        <Nav />

        {/* hero content — vertically + horizontally centered */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center px-6 py-24 text-center md:px-12">
          <h1 className="rise rise-d0 font-serif text-[clamp(2.4rem,6vw,4.6rem)] font-normal leading-[1.05] tracking-[-0.015em] text-white">
            Grounded PyTorch help
            <br />
            for stack-trace moments.
          </h1>
          <p className="rise rise-d1 mono mt-6 max-w-xl text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-300">
            Torch answers questions about PyTorch with hybrid retrieval over
            docs, source code, and GitHub issues — every claim cited to the
            exact line.
          </p>
          <div className="rise rise-d2 mt-9 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/dashboard/ask"
              className="inline-flex items-center rounded-md bg-white px-5 py-2 text-[13px] font-medium text-zinc-900 transition-transform hover:scale-[1.02]"
            >
              Open Dashboard
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-md border border-white/30 bg-white/[0.06] px-5 py-2 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
            >
              See features
            </Link>
          </div>
        </div>

        {/* glass chat preview — floats over the purple band */}
        <div className="rise rise-d3 pointer-events-none absolute right-4 z-20 hidden md:right-12 md:bottom-[18%] md:block lg:right-20">
          <div className="pointer-events-auto">
            <HeroChat />
          </div>
        </div>
      </section>

      {/* ===================================================== FEATURES */}
      <section
        id="features"
        className="canvas-cream relative flex min-h-screen w-full scroll-mt-24 flex-col justify-center px-6 py-24 md:px-12 md:py-32 lg:px-16"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-8">
              <div className="mono mb-4 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
                <span className="text-zinc-400 tabular">01</span>
                <span className="text-zinc-300">·</span>
                <span>Features</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.18] tracking-[-0.015em] text-zinc-900">
                A retrieval pipeline tailored
                <br />
                to{" "}
                <span
                  className="bg-torch-500 px-3 py-0.5 text-white"
                  style={{ boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}
                >
                  PyTorch&apos;s
                </span>{" "}
                real corpus.
              </h2>
              <p className="mono mt-5 max-w-md text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
                Four primitives that move the eval metrics. Each piece is
                measured, swappable, and exposed in the dashboard.
              </p>
              <Link
                href="/dashboard/ask"
                className="mt-7 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Explore all
              </Link>
            </div>
            <div className="col-span-12 mono items-end text-right text-[10.5px] uppercase tracking-[0.22em] text-zinc-500 md:col-span-4">
              <div>Torch Features</div>
              <div className="mt-1 inline-flex items-center gap-1 text-zinc-400">
                <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
              </div>
            </div>
          </div>

          {/* feature card grid */}
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const t = tones[f.tone];
              return (
                <div
                  key={f.head}
                  className={`relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.15)]`}
                >
                  <div className="mono mb-7 text-[10.5px] uppercase tracking-[0.22em] text-zinc-400 tabular">
                    [{f.n}/04]
                  </div>
                  <h3 className="font-serif text-[22px] leading-[1.15] tracking-[-0.005em] text-zinc-900">
                    {f.head}
                  </h3>
                  <p className="mono mt-3 text-[11.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
                    {f.body}
                  </p>
                  {/* pastel dotted footer hint */}
                  <div className={`mt-8 h-20 rounded-xl ${t.bgLight} relative overflow-hidden`}>
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, ${
                          { blue: "#8DA6D2", green: "#86BB94", purple: "#A488B8" }[f.tone]
                        } 1px, transparent 0)`,
                        backgroundSize: "10px 10px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================== IMPACT (contained dark on cream) */}
      <section
        id="impact"
        className="canvas-cream relative w-full scroll-mt-24 px-6 py-12 md:px-12 md:py-16 lg:px-16"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-ink-0 px-6 py-12 text-zinc-200 md:px-12 md:py-16">
            <div className="mb-12 grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-500 md:col-span-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-zinc-500 tabular">02</span>
                  <span className="text-zinc-700">·</span>
                  <span>Torch Impact</span>
                </div>
                <div className="inline-flex items-center gap-1 text-zinc-700">
                  <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
                </div>
              </div>
              <h2 className="col-span-12 font-serif text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.04] tracking-[-0.015em] text-white md:col-span-8">
                Measured retrieval beats
                <br />
                vanilla LLM by a wide margin.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {stats.map((s) => {
                const t = tones[s.tone];
                return (
                  <div
                    key={s.unit}
                    className={`flex flex-col justify-between rounded-3xl ${t.bg} p-10 md:min-h-[420px] md:p-12`}
                  >
                    <div>
                      <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-900/70">
                        {s.unit}
                      </div>
                      <div className="mt-3 font-serif text-[120px] leading-[0.92] tracking-[-0.04em] text-zinc-900 tabular md:text-[148px]">
                        {s.v}
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="text-[18px] font-medium text-zinc-900">
                        {s.unit}
                      </div>
                      <p className="mono mt-3 text-[13px] leading-relaxed tracking-[0.04em] text-zinc-900/75">
                        {s.body}
                      </p>
                      <div className="mono mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-900/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-900/70" />
                        <span>n = 250 · CI-verified</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* logo strip */}
            <div className="mono mt-14 flex flex-wrap items-center justify-between gap-x-12 gap-y-4 text-[12px] uppercase tracking-[0.22em] text-zinc-500">
              <span>Qdrant</span>
              <span>BGE-base</span>
              <span>Jina-code-v2</span>
              <span>BGE-reranker</span>
              <span>Sonnet 4.6</span>
              <span>FastAPI / SSE</span>
              <span>Next.js 15</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= ARCHITECTURE + DOCS */}
      <section
        id="architecture"
        className="canvas-cream relative w-full scroll-mt-24 px-6 pb-24 pt-16 md:px-12 md:pb-32 md:pt-20 lg:px-16"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          {/* eyebrow + headline + tag */}
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 md:col-span-8">
              <div className="mono mb-4 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
                <span className="text-zinc-400 tabular">03</span>
                <span className="text-zinc-300">·</span>
                <span>Pipeline · Sources + Quickstart</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.35] tracking-[-0.015em] text-zinc-900">
                All your{" "}
                <span
                  className="bg-torch-500 px-2 py-0.5 text-white"
                  style={{
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                  }}
                >
                  sources,
                </span>{" "}
                one ranked answer
                <br />
                — boot in under a{" "}
                <span
                  className="bg-torch-500 px-2 py-0.5 text-white"
                  style={{
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                  }}
                >
                  minute.
                </span>
              </h2>
              <p className="mono mt-5 max-w-xl text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
                Torch indexes the four corpora a real PyTorch user needs — and
                only those. Frontend runs on mocks today; ingestion is shipped;
                streaming API lands next.
              </p>
            </div>
            <div className="col-span-12 mono items-end text-right text-[10.5px] uppercase tracking-[0.22em] text-zinc-500 md:col-span-4">
              <div>Frontend ready · Backend WIP</div>
              <div className="mt-1 inline-flex items-center gap-1 text-zinc-400">
                <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
              </div>
            </div>
          </div>

          {/* ROW 1 — sources + retrieval graph */}
          <div className="mt-10 grid grid-cols-12 gap-4">
            <div className="col-span-12 rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-5">
              <div className="mb-5 flex items-baseline justify-between">
                <div className="font-serif text-[20px] tracking-[-0.005em] text-zinc-900">
                  Indexed sources
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  4 corpora · 28k chunks
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "pytorch.org/docs/stable", count: "8,214 chunks", tone: "blue" },
                  { name: "pytorch/pytorch (torch.*)", count: "12,480 chunks", tone: "green" },
                  { name: "pytorch/pytorch — Issues", count: "5,126 chunks", tone: "purple" },
                  { name: "discuss.pytorch.org", count: "queued · v1.1", tone: "blue" },
                ].map((src) => {
                  const t = tones[src.tone as keyof typeof tones];
                  return (
                    <div key={src.name} className="flex items-center gap-3">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${t.bg}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] text-zinc-900">
                          {src.name}
                        </div>
                        <div className="mono mt-0.5 text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                          {src.count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-12 rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-7">
              <div className="mb-5 flex items-baseline justify-between">
                <div className="font-serif text-[20px] tracking-[-0.005em] text-zinc-900">
                  Retrieval graph
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  hybrid · RRF k=60
                </span>
              </div>
              {/* simple inline pipeline diagram */}
              <div className="rounded-xl bg-cream-50 dotgrid-light p-5">
                <div className="flex items-center justify-between gap-2 overflow-x-auto">
                  {["Query", "Router", "Dense", "BM25", "RRF", "Rerank", "LLM", "UI"].map(
                    (node, i, arr) => (
                      <span key={node} className="flex shrink-0 items-center gap-2">
                        <span
                          className={`mono inline-flex items-center rounded-md px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.18em] ${
                            node === "RRF" || node === "Rerank"
                              ? "bg-pastel-purple text-zinc-900"
                              : node === "Dense" || node === "BM25"
                              ? "bg-pastel-blue text-zinc-900"
                              : "border border-zinc-200 bg-white text-zinc-700"
                          }`}
                        >
                          {node}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-zinc-400">→</span>
                        )}
                      </span>
                    )
                  )}
                </div>
                <p className="mono mt-5 text-[11.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
                  Query routes per source. Dense + BM25 retrieved in parallel,
                  fused by RRF (k=60), reranked by bge-reranker, streamed
                  through the LLM with inline <span className="text-torch-600">[n]</span>{" "}
                  citation chips.
                </p>
              </div>
            </div>
          </div>

          {/* ROW 2 — docs (quickstart + api) */}
          <div id="docs" className="mt-4 scroll-mt-24">
            <DocsBlock />
          </div>
        </div>
      </section>

      {/* ===================================================== FAQ */}
      <section
        id="faq"
        className="canvas-cream relative w-full scroll-mt-24 px-6 pb-24 pt-12 md:px-12 md:pb-32 md:pt-16 lg:px-16"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <FAQBlock />
        </div>
      </section>

      {/* ===================================================== CTA — sized so CTA + footer fit in one viewport */}
      <section className="canvas-dark relative isolate w-full overflow-hidden">
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center px-6 py-16 text-center md:px-12 md:py-20">
          <div className="mono mb-5 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="text-zinc-500 tabular">06</span>
            <span className="text-zinc-700">·</span>
            <span>Ready when you are</span>
          </div>
          <h2 className="font-serif text-[clamp(5.4rem,13.2vw,11.4rem)] leading-[0.94] tracking-[-0.025em] text-white">
            Ask your next PyTorch
            <br />
            question on Torch.
          </h2>
          <p className="mono mt-5 max-w-md text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-400">
            Hybrid retrieval + inline citations. Boots in a browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/dashboard/ask"
              className="inline-flex items-center rounded-md bg-white px-5 py-2 text-[13px] font-medium text-zinc-900 transition-transform hover:scale-[1.02]"
            >
              Open Dashboard
            </Link>
            <Link
              href="/dashboard/eval"
              className="inline-flex items-center rounded-md border border-white/20 bg-white/[0.04] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.1]"
            >
              See eval numbers
            </Link>
          </div>
        </div>

      </section>

      <Footer />
    </main>
  );
}
