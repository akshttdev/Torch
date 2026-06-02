"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { streamAsk, type AskEvent, type AskSource } from "@/lib/api";

type Pending = { q: string; filter: string };

const toneByKind: Record<string, { tag: string; rail: string }> = {
  docs:   { tag: "bg-pastel-blue text-pastel-blueDeep",     rail: "bg-pastel-blueDeep" },
  code:   { tag: "bg-pastel-green text-pastel-greenDeep",   rail: "bg-pastel-greenDeep" },
  issues: { tag: "bg-pastel-purple text-pastel-purpleDeep", rail: "bg-pastel-purpleDeep" },
  forum:  { tag: "bg-pastel-blue text-pastel-blueDeep",     rail: "bg-pastel-blueDeep" },
  so:     { tag: "bg-pastel-green text-pastel-greenDeep",   rail: "bg-pastel-greenDeep" },
};

function getTone(kind: string) {
  return toneByKind[kind] ?? toneByKind.docs;
}

const CITE_RE = /\[(\d+)\]/g;

export function AnswerStub({ id }: { id: string }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [text, setText] = useState("");
  const [sources, setSources] = useState<AskSource[]>([]);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "streaming" | "done" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const startedRef = useRef(false);

  // hydrate query + filter from sessionStorage, then open the stream
  useEffect(() => {
    let p: Pending = { q: "", filter: "All" };
    try {
      const raw = sessionStorage.getItem(`torch.pending.${id}`);
      if (raw) p = JSON.parse(raw);
    } catch {}
    setPending(p);

    if (!p.q || startedRef.current) return;
    startedRef.current = true;

    setStatus("streaming");
    const filterToSources: Record<string, string[] | undefined> = {
      All: undefined,
      Docs: ["docs"],
      Code: ["code"],
      Issues: ["issues"],
      Forum: ["forum"],
    };
    const sourcesFilter = filterToSources[p.filter];

    const h = streamAsk(
      { query: p.q, sources: sourcesFilter, top_k: 8 },
      (ev: AskEvent) => {
        switch (ev.type) {
          case "sources":
            setSources(ev.sources);
            break;
          case "token":
            setText((prev) => prev + ev.text);
            break;
          case "citation":
            setActiveCitation(ev.id);
            if (ev.source) {
              setSources((prev) => {
                const exists = prev.find((s) => s.n === ev.source!.n);
                return exists ? prev : [...prev, ev.source!];
              });
            }
            break;
          case "done":
            setLatencyMs(ev.latency_ms);
            setStatus("done");
            break;
          case "error":
            setError(ev.message);
            setStatus("error");
            break;
        }
      },
      (e) => {
        setError(e.message);
        setStatus("error");
      }
    );

    return () => h.abort();
  }, [id]);

  // Render the streamed text with [n] tokens replaced by citation chips.
  const rendered = useMemo(() => {
    if (!text) return null;
    const parts: (string | { n: number })[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(CITE_RE.source, "g");
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push({ n: Number(m[1]) });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));

    return parts.map((p, i) => {
      if (typeof p === "string") {
        return (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p}
          </span>
        );
      }
      const src = sources.find((s) => s.n === p.n);
      const tone = src ? getTone(src.kind) : toneByKind.docs;
      return (
        <a
          key={i}
          href={src?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setActiveCitation(p.n)}
          className={`mono mx-0.5 inline-flex h-[18px] min-w-[20px] -translate-y-px items-center justify-center rounded-[3px] px-1 align-middle text-[10px] font-semibold text-zinc-900 ${tone.tag}`}
          title={src?.title || ""}
        >
          {p.n}
        </a>
      );
    });
  }, [text, sources]);

  return (
    <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 md:px-10">
      <div className="mono mb-6 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === "done"
              ? "bg-emerald-500"
              : status === "error"
              ? "bg-rose-500"
              : status === "streaming"
              ? "bg-amber-500"
              : "bg-zinc-400"
          }`}
        />
        <span>
          Query · {id} · {status}
        </span>
        <span className="text-zinc-300">|</span>
        <span>filter · {pending?.filter ?? "All"}</span>
        {latencyMs !== null && (
          <>
            <span className="text-zinc-300">|</span>
            <span>{(latencyMs / 1000).toFixed(2)}s</span>
          </>
        )}
      </div>

      <h1 className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.015em] text-zinc-900">
        {pending?.q ?? "Query not found."}
      </h1>

      <div className="mt-10 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6">
            <div className="mono mb-4 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
              <span>Answer stream</span>
              <span
                className={
                  status === "done"
                    ? "text-emerald-600"
                    : status === "error"
                    ? "text-rose-600"
                    : "text-amber-600"
                }
              >
                {status === "loading" && "Connecting…"}
                {status === "streaming" && "Streaming · grounded"}
                {status === "done" && "Done"}
                {status === "error" && (error || "Stream error")}
              </span>
            </div>

            {text ? (
              <div className="text-[14px] leading-relaxed text-zinc-800">
                {rendered}
                {status === "streaming" && <span className="cursor-bar" />}
              </div>
            ) : (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-3 rounded-sm bg-cream-100"
                    style={{
                      width: `${[100, 92, 96, 78, 64][i]}%`,
                      animation: `pulse-dot 2.4s ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}

            {status === "error" && error && (
              <div className="mono mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="mono mb-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span>Citations</span>
            <span className="text-zinc-400">{sources.length}</span>
          </div>
          <div className="space-y-3">
            {sources.length === 0 ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-zinc-200/80 bg-white p-4">
                  <div className="mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <span>Pending</span>
                  </div>
                  <div className="h-2 w-3/4 rounded-sm bg-cream-100" />
                  <div className="mt-1.5 h-2 w-1/2 rounded-sm bg-cream-100" />
                </div>
              ))
            ) : (
              sources.map((s) => {
                const tone = getTone(s.kind);
                const isActive = activeCitation === s.n;
                return (
                  <a
                    key={s.n}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-2xl border bg-white p-4 transition-colors ${
                      isActive ? "border-zinc-900/40" : "border-zinc-200/80"
                    }`}
                  >
                    <div className="mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`grid h-5 min-w-[20px] place-items-center rounded-md px-1 text-zinc-900 ${tone.tag}`}
                        >
                          {s.n}
                        </span>
                        <span>{s.kind}</span>
                      </span>
                      <span className="text-zinc-400">{s.score.toFixed(2)}</span>
                    </div>
                    <div className="text-[12.5px] leading-snug text-zinc-900 line-clamp-2">
                      {s.title}
                    </div>
                    <div className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-3">
                      {s.snippet}
                    </div>
                  </a>
                );
              })
            )}
          </div>

          <Link
            href="/dashboard/ask"
            className="mono mt-6 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-[12px] font-medium text-zinc-900 transition-colors hover:bg-cream-50"
          >
            Ask another
          </Link>
        </div>
      </div>
    </section>
  );
}
