import { evalRunMeta, metrics } from "@/lib/mock";

export const metadata = {
  title: "Torch",
  description: "250-Q benchmark · hit@k · MRR · faithfulness · latency p50/p95/p99.",
};

const toneCycle = ["blue", "green", "purple", "blue", "green", "purple"] as const;
const toneBg = {
  blue: "bg-pastel-blue",
  green: "bg-pastel-green",
  purple: "bg-pastel-purple",
} as const;

export default function EvalPage() {
  return (
    <section className="relative min-h-screen w-full px-6 pt-10 md:px-12 md:pt-14 lg:px-16">
      {/* breadcrumb meta */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-200/70 pb-6">
        <div>
          <div className="mono mb-3 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-torch-500" />
            <span>Eval · 250-Q bench</span>
            <span className="text-zinc-300">|</span>
            <span>nightly + on push</span>
          </div>
          <h1 className="text-[clamp(2rem,4.2vw,3.2rem)] font-medium uppercase leading-[1.04] tracking-[-0.015em] text-zinc-900">
            Measure first.
            <br />
            Claim second<span className="text-torch-500">.</span>
          </h1>
          <p className="mono mt-4 max-w-md text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-500">
            CI runs the full 250-Q suite on every push to main. Numbers below
            are placeholders until the harness lands.
          </p>
        </div>
        {/* Zentra-style pastel insights tile */}
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl p-5 md:w-[320px]"
          style={{
            background:
              "linear-gradient(135deg, #FFD3B6 0%, #D5C3E8 50%, #B9C9E8 100%)",
          }}
        >
          <div className="mono mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-zinc-800">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5l1.8 4 4.4.6-3.2 3.1.8 4.4L8 11.5l-3.8 2.1.8-4.4L1.8 6.1l4.4-.6L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Insights
          </div>
          <div className="font-serif text-[26px] leading-tight tracking-[-0.015em] text-zinc-900">
            +0.42 vs vanilla LLM on faithfulness
          </div>
          <div className="mono mt-3 text-[10.5px] uppercase tracking-[0.18em] text-zinc-700">
            run · {evalRunMeta.ts}
          </div>
        </div>
      </div>

      {/* light metric grid — all cards share the same vertical rhythm */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m, i) => {
          const tone = toneCycle[i];
          return (
            <div
              key={m.key}
              className={`relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl ${toneBg[tone]} p-5`}
            >
              <div className="mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-700">
                {m.label}
              </div>
              <div className="font-serif text-[44px] leading-none tracking-[-0.02em] text-zinc-900 tabular">
                {m.value.toFixed(2)}
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-zinc-700/80">
                {m.vanilla !== null ? `vanilla ${m.vanilla.toFixed(2)}` : " "}
              </div>
            </div>
          );
        })}
      </div>

      {/* contained dark insight card */}
      <div className="mt-10 mb-12 rounded-3xl bg-ink-0 px-6 py-10 text-zinc-200 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] md:px-10 md:py-14">
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-500 md:col-span-4">
            Latency
            <div className="mt-1 inline-flex items-center gap-1 text-zinc-700">
              <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
            </div>
          </div>
          <h2 className="col-span-12 font-serif text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.04] tracking-[-0.015em] text-white md:col-span-8">
            Sub-second retrieval, p95 under SLO.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <DarkStat tone="blue" v="0.62s" k="p50 first-token" />
          <DarkStat tone="green" v="1.10s" k="p95 first-token" />
          <DarkStat tone="purple" v="0.51s" k="p99 retrieval" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
          <div className="mono text-[11px] tracking-[0.04em] text-zinc-400">
            torch_eval.run · CI runs full suite on every push to main
          </div>
          <a
            href="https://github.com/akshttdev/Torch"
            className="inline-flex items-center rounded-md border border-white/20 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.08]"
          >
            Open last run.json
          </a>
        </div>
      </div>
    </section>
  );
}

function Row({
  k,
  v,
  valueClass = "text-zinc-900",
}: {
  k: string;
  v: string;
  valueClass?: string;
}) {
  return (
    <>
      <dt className="text-zinc-400">{k}</dt>
      <dd className={`text-right ${valueClass} normal-case tracking-tight`}>{v}</dd>
    </>
  );
}

function DarkStat({
  tone,
  v,
  k,
}: {
  tone: "blue" | "green" | "purple";
  v: string;
  k: string;
}) {
  return (
    <div className={`rounded-2xl ${toneBg[tone]} p-6`}>
      <div className="font-serif text-[56px] leading-none tracking-[-0.03em] text-zinc-900 tabular">
        {v}
      </div>
      <div className="mt-4 text-[13px] font-medium text-zinc-900">{k}</div>
    </div>
  );
}
