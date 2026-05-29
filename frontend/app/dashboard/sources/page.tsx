import { sources, corpus } from "@/lib/mock";
import { fmtInt, fmtBytes, relTime } from "@/lib/utils";

export const metadata = {
  title: "Torch",
  description: "Sources, freshness, chunker config, and sample chunks.",
};

const toneCycle = ["blue", "green", "purple", "blue"] as const;
const toneBg = {
  blue: "bg-pastel-blue",
  green: "bg-pastel-green",
  purple: "bg-pastel-purple",
} as const;

export default function SourcesPage() {
  const cards = [
    { k: "Total chunks", v: fmtInt(corpus.totalChunks), sub: "across all corpora" },
    { k: "Total bytes", v: fmtBytes(corpus.totalBytes), sub: "raw stored payload" },
    {
      k: "Freshest",
      v: corpus.fresh ? relTime(corpus.fresh.last_synced_at) : "—",
      sub: corpus.fresh?.name ?? "",
    },
    {
      k: "Oldest",
      v: corpus.oldest ? relTime(corpus.oldest.last_synced_at) : "—",
      sub: corpus.oldest?.name ?? "",
    },
  ];

  return (
    <section className="relative min-h-screen w-full px-6 pt-10 md:px-12 md:pt-14 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-200/70 pb-6">
        <div>
          <div className="mono mb-3 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-torch-500" />
            <span>Corpus</span>
            <span className="text-zinc-300">|</span>
            <span>4 sources · 768-d cosine · Qdrant Cloud</span>
          </div>
          <h1 className="text-[clamp(2rem,4.2vw,3.2rem)] font-medium uppercase leading-[1.04] tracking-[-0.015em] text-zinc-900">
            The ground truth Torch
            <br />
            answers from<span className="text-torch-500">.</span>
          </h1>
          <p className="mono mt-4 max-w-md text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-500">
            Each source is indexed independently with its own chunker and
            embedder. The pipeline routes per query and fuses with RRF.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="mono cursor-not-allowed rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400"
        >
          Re-sync all · v1.1
        </button>
      </div>

      {/* pastel stat cards */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c, i) => {
          const tone = toneCycle[i];
          return (
            <div
              key={c.k}
              className={`relative overflow-hidden rounded-2xl ${toneBg[tone]} p-5`}
            >
              <div className="mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-700">
                {c.k}
              </div>
              <div className="mt-3 font-serif text-[32px] leading-none tracking-[-0.02em] text-zinc-900 tabular">
                {c.v}
              </div>
              {c.sub && (
                <div className="mono mt-3 truncate text-[10px] uppercase tracking-[0.18em] text-zinc-700">
                  {c.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* sources table — light */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
        <div className="mono grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] items-center gap-4 border-b border-zinc-200/70 bg-cream-50 px-5 py-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
          <span>Source</span>
          <span className="text-right">Chunks</span>
          <span>Synced</span>
          <span>Status</span>
        </div>
        <ul>
          {sources.map((s, i) => (
            <li
              key={s.kind}
              className="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0 transition-colors hover:bg-cream-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${toneBg[toneCycle[i % toneCycle.length]]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] text-zinc-900">
                    {s.name}
                  </div>
                  <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {s.kind} · {s.embedder.split("/").pop()}
                  </div>
                </div>
              </div>
              <div className="mono text-right text-[13.5px] tabular text-zinc-900">
                {s.count > 0 ? fmtInt(s.count) : <span className="text-zinc-400">—</span>}
              </div>
              <div className="mono text-[11.5px] tracking-[0.04em] text-zinc-600">
                {relTime(s.last_synced_at)}
              </div>
              <div>
                <span
                  className={`mono inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                    s.status === "healthy"
                      ? "bg-pastel-green text-zinc-900"
                      : s.status === "stale"
                      ? "bg-pastel-purple text-zinc-900"
                      : "bg-pastel-pink text-zinc-900"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      s.status === "healthy"
                        ? "bg-emerald-600"
                        : s.status === "stale"
                        ? "bg-amber-600"
                        : "bg-rose-600"
                    }`}
                  />
                  {s.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* payload schema card */}
      <div className="mt-10 mb-12 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-5">
          <div className="mono mb-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            Payload schema
          </div>
          <div className="font-serif text-[22px] leading-snug tracking-[-0.005em] text-zinc-900">
            Every chunk carries enough metadata to render a citation chip and
            an audit trail.
          </div>
          <p className="mono mt-4 text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-500">
            All sources share one Qdrant payload shape — kind, URL, content,
            anchor, freshness, optional git SHA.
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          <pre className="mono overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white p-5 text-[12px] leading-relaxed text-zinc-700">
            <code>
              <span className="text-zinc-400">{"# qdrant payload"}</span>
              {"\n"}
              <span className="text-instrument-500">payload</span>
              {" = {"}
              {"\n  "}
              <span className="text-torch-600">&quot;kind&quot;</span>: docs | code | issues | forum,
              {"\n  "}
              <span className="text-torch-600">&quot;source_url&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;title&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;content&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;anchor&quot;</span>: str | None,
              {"\n  "}
              <span className="text-torch-600">&quot;last_synced_at&quot;</span>: int,
              {"\n  "}
              <span className="text-torch-600">&quot;sha&quot;</span>: str | None,
              {"\n"}
              {"}"}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
