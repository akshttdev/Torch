import { SourcesTable } from "@/components/SourcesTable";
import { sources as mockSources, corpus } from "@/lib/mock";
import { fmtInt, fmtBytes, relTime } from "@/lib/utils";
import { getSources, type SourceRow } from "@/lib/api";

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

// fetch on the server side at request time
export const revalidate = 30;

type LiveStatus = { live: boolean; rows: SourceRow[] | null; error?: string };

async function loadLive(): Promise<LiveStatus> {
  try {
    const res = await getSources();
    return { live: true, rows: res.sources };
  } catch (e) {
    return { live: false, rows: null, error: (e as Error).message };
  }
}

export default async function SourcesPage() {
  const live = await loadLive();

  // Merge live data with mock metadata (chunker config, sample chunks).
  // The backend tells us count/freshness/status; the mock fills in the
  // descriptive metadata we haven't surfaced through `/sources` yet.
  const sources = live.rows
    ? mockSources.map((m) => {
        const hit = live.rows!.find((r) => r.kind === m.kind);
        if (!hit) return m;
        return {
          ...m,
          count: hit.count,
          last_synced_at: hit.last_synced_at ?? m.last_synced_at,
          status: hit.status === "empty" ? "stale" : hit.status,
        };
      })
    : mockSources;

  const totalChunks = sources.reduce((a, s) => a + s.count, 0);
  const totalBytes = corpus.totalBytes; // not yet surfaced from backend
  const freshest = sources.filter((s) => s.count > 0).sort((a, b) => b.last_synced_at - a.last_synced_at)[0];
  const oldest = sources.filter((s) => s.count > 0).sort((a, b) => a.last_synced_at - b.last_synced_at)[0];

  const cards = [
    { k: "Total chunks", v: fmtInt(totalChunks), sub: "across all corpora" },
    { k: "Total bytes", v: fmtBytes(totalBytes), sub: "raw stored payload" },
    {
      k: "Freshest",
      v: freshest ? relTime(freshest.last_synced_at) : "—",
      sub: freshest?.name ?? "",
    },
    {
      k: "Oldest",
      v: oldest ? relTime(oldest.last_synced_at) : "—",
      sub: oldest?.name ?? "",
    },
  ];

  return (
    <section className="relative min-h-screen w-full px-6 pt-10 md:px-12 md:pt-14 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-200/70 pb-6">
        <div>
          <div className="mono mb-3 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className={`h-1.5 w-1.5 rounded-full ${live.live ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span>{live.live ? "Corpus · live" : "Corpus · mock data (backend offline)"}</span>
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
            {!live.live && live.error && (
              <span className="mt-2 block text-rose-600">
                Backend error: {live.error.slice(0, 120)}
              </span>
            )}
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

      <SourcesTable sources={sources} />

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
              <span className="text-torch-600">&quot;kind&quot;</span>: docs |
              code | issues | forum,{"\n  "}
              <span className="text-torch-600">&quot;source_url&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;title&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;content&quot;</span>: str,
              {"\n  "}
              <span className="text-torch-600">&quot;anchor&quot;</span>: str |
              None,
              {"\n  "}
              <span className="text-torch-600">&quot;last_synced_at&quot;</span>: int,
              {"\n  "}
              <span className="text-torch-600">&quot;sha&quot;</span>: str |
              None,
              {"\n"}
              {"}"}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
