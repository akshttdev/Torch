"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type SourceRow } from "@/lib/mock";
import { SourceIcon } from "./SourceIcon";
import { StatBadge } from "./StatBadge";
import { Histogram } from "./Histogram";
import { fmtInt, fmtBytes, relTime } from "@/lib/utils";

export function SourceSheet({
  source,
  onClose,
}: {
  source: SourceRow | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {source && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 0.65, 0.4, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-ink-50 shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.8)]"
            data-lenis-prevent
          >
            <div className="filament absolute inset-x-0 top-0 h-px" aria-hidden />
            {/* header */}
            <div className="sticky top-0 z-10 border-b border-white/5 bg-ink-50/95 px-6 py-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <SourceIcon kind={source.kind} className="mt-1 h-5 w-5" />
                  <div>
                    <div className="mono mb-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      corpus · {source.kind}
                    </div>
                    <div className="font-display text-[22px] leading-tight text-zinc-100">
                      {source.name}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mono rounded-sm border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
                  aria-label="Close"
                >
                  esc ✕
                </button>
              </div>
            </div>

            <div className="space-y-8 px-6 py-6">
              {/* stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["chunks", fmtInt(source.count)],
                  ["bytes", fmtBytes(source.bytes)],
                  ["synced", relTime(source.last_synced_at)],
                  ["status", ""],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className="rounded-sm border border-white/8 bg-white/[0.015] p-3"
                  >
                    <div className="mono mb-1 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                      {k}
                    </div>
                    {i === 3 ? (
                      <StatBadge status={source.status} className="mt-1" />
                    ) : (
                      <div className="font-display text-[15px] tabular tracking-tight text-zinc-100">
                        {v}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* config */}
              <div>
                <div className="mono mb-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  /// pipeline config
                </div>
                <dl className="mono divide-y divide-white/5 rounded-sm border border-white/8 bg-white/[0.015] text-[12px]">
                  <Row k="embedder" v={source.embedder} />
                  <Row
                    k="chunker"
                    v={
                      source.chunker.size > 0
                        ? `${source.chunker.strategy} · size ${source.chunker.size} · overlap ${source.chunker.overlap}`
                        : source.chunker.strategy
                    }
                  />
                  <Row k="vector dim" v="768 · cosine · normalized" />
                  <Row k="upsert id" v="uuid5(NAMESPACE_URL, key)" />
                </dl>
              </div>

              {/* histogram */}
              <div>
                <div className="mono mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  <span>/// chunk length distribution</span>
                  <span>tokens · 12 buckets</span>
                </div>
                <div className="rounded-sm border border-white/8 bg-white/[0.015] p-4">
                  <Histogram data={source.histogram} />
                  <div className="mono mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                    <span>32</span>
                    <span>128</span>
                    <span>512</span>
                    <span>2048+</span>
                  </div>
                </div>
              </div>

              {/* samples */}
              <div>
                <div className="mono mb-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  /// sample chunks (n=5 random)
                </div>
                {source.sampleChunks.length ? (
                  <ul className="space-y-3">
                    {source.sampleChunks.map((c, i) => (
                      <li
                        key={i}
                        className="rounded-sm border border-white/8 bg-white/[0.015] p-4 transition-colors hover:border-torch-500/30"
                      >
                        <div className="mono mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                          <span>chunk · {String(i + 1).padStart(3, "0")}</span>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-torch-400 hover:text-torch-200"
                          >
                            open
                          </a>
                        </div>
                        <div className="text-[13px] leading-snug text-zinc-200">
                          {c.title}
                        </div>
                        <div className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400 line-clamp-3">
                          {c.snippet}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mono rounded-sm border border-dashed border-white/10 bg-white/[0.01] p-6 text-center text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                    no chunks ingested · run `make ingest`
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 px-3 py-2.5">
      <dt className="uppercase tracking-[0.18em] text-[10px] text-zinc-600">{k}</dt>
      <dd className="text-zinc-200">{v}</dd>
    </div>
  );
}
