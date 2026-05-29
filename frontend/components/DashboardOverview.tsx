"use client";

import Link from "next/link";

const cards = [
  {
    label: "Indexed chunks",
    v: "28,420",
    sub: "+128 today",
    dot: "bg-pastel-purpleDeep",
    accent: "border-pastel-purpleDeep/40 text-pastel-purpleDeep",
  },
  {
    label: "p50 latency",
    v: "620ms",
    sub: "p99 · 1.92s",
    dot: "bg-instrument-400",
    accent: "border-instrument-400/40 text-instrument-500",
  },
  {
    label: "Queries (24h)",
    v: "4,219",
    sub: "+12% vs yesterday",
    dot: "bg-pastel-purpleDeep",
    accent: "border-pastel-purpleDeep/40 text-pastel-purpleDeep",
  },
  {
    label: "Storage",
    v: "12.4 GB",
    sub: "1M vec capacity",
    dot: "bg-emerald-500",
    accent: "border-emerald-500/40 text-emerald-600",
  },
] as const;

const activity = [
  { type: "search", color: "bg-pastel-blue text-zinc-900", text: '"dataloader hang macos" · k=50 · 28ms', when: "12s ago" },
  { type: "index",  color: "bg-pastel-purple text-zinc-900", text: "12 chunks written to docs",          when: "38s ago" },
  { type: "ingest", color: "bg-pastel-green text-zinc-900", text: "linear.py · code · 41ms",              when: "1m ago" },
  { type: "search", color: "bg-pastel-blue text-zinc-900", text: '"detach vs data" · k=25 · 22ms',        when: "2m ago" },
  { type: "ingest", color: "bg-pastel-green text-zinc-900", text: "issue #111873 · 64ms",                 when: "3m ago" },
  { type: "search", color: "bg-pastel-blue text-zinc-900", text: '"set_to_none zero_grad" · k=30 · 31ms', when: "5m ago" },
  { type: "index",  color: "bg-pastel-purple text-zinc-900", text: "issues · compacted",                  when: "7m ago" },
];

const system = [
  { k: "Encoder", v: "bge-base · jina-code · ready" },
  { k: "Vector index", v: "Qdrant · hnsw · int8" },
  { k: "Workers", v: "4 / 4 online" },
  { k: "Queue", v: "0 backlogged" },
  { k: "Cache hit", v: "94.2%" },
  { k: "Uptime", v: "4d 12h 38m" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function todayLine() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DashboardOverview() {
  return (
    <section className="relative w-full px-6 pt-10 md:px-12 md:pt-14 lg:px-16">
      {/* header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mono mb-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            Workspace · default
          </div>
          <h1 className="font-mono text-[clamp(2rem,4.4vw,3.4rem)] font-medium uppercase leading-[1.04] tracking-[-0.005em] text-zinc-900">
            {greeting()}, <span className="text-instrument-500">User</span>
            <span className="text-torch-500">.</span>
          </h1>
          <p className="mono mt-3 text-[11.5px] uppercase tracking-[0.18em] text-zinc-500">
            Here&apos;s what&apos;s happening · {todayLine()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-[12px] font-medium text-zinc-900 transition-colors hover:bg-cream-100"
          >
            <span>↑</span>
            <span>Ingest</span>
          </button>
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center gap-2 rounded-md bg-instrument-500 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-instrument-400"
          >
            <span>Run query</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* dashed stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative rounded-2xl border border-dashed bg-white/40 p-5 ${c.accent.split(" ")[0]}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {c.label}
              </div>
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
            </div>
            <div className="font-mono text-[34px] font-medium leading-none tracking-[-0.01em] text-zinc-900 tabular">
              {c.v}
            </div>
            <div className={`mono mt-4 text-[10.5px] uppercase tracking-[0.18em] ${c.accent.split(" ").slice(1).join(" ")}`}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      {/* live activity + system */}
      <div className="grid grid-cols-12 gap-4 pb-12">
        <div className="col-span-12 rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-7">
          <div className="mb-5 flex items-baseline justify-between">
            <div className="font-mono text-[15px] uppercase tracking-[0.06em] text-zinc-900">
              Live activity
            </div>
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              last 10 minutes
            </span>
          </div>
          <ul className="divide-y divide-zinc-100">
            {activity.map((a, i) => (
              <li
                key={i}
                className="mono grid grid-cols-[80px_1fr_auto] items-center gap-4 py-2.5 text-[12.5px]"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] ${a.color}`}
                >
                  {a.type}
                </span>
                <span className="truncate text-zinc-900">{a.text}</span>
                <span className="text-[10.5px] uppercase tracking-[0.2em] text-zinc-400">
                  {a.when}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-5">
          <div className="mb-5 flex items-baseline justify-between">
            <div className="font-mono text-[15px] uppercase tracking-[0.06em] text-zinc-900">
              System
            </div>
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-emerald-500">
              healthy
            </span>
          </div>
          <dl className="mono divide-y divide-zinc-100">
            {system.map((s) => (
              <div
                key={s.k}
                className="grid grid-cols-[110px_1fr] items-center gap-3 py-2.5 text-[12px]"
              >
                <dt className="uppercase tracking-[0.2em] text-zinc-500">{s.k}</dt>
                <dd className="text-right text-zinc-900">{s.v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/dashboard/ask"
            className="mono mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-instrument-500 hover:text-instrument-400"
          >
            <span>Open search</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
