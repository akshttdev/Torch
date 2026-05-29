"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; q: string; ts: number };

function relTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function QHistory() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("torch.recent");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <section className="relative min-h-screen w-full px-6 pt-10 md:px-12 md:pt-14 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-200/70 pb-6">
        <div>
          <div className="mono mb-3 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-torch-500" />
            <span>History · local</span>
            <span className="text-zinc-300">|</span>
            <span>last 5 · not synced</span>
          </div>
          <h1 className="text-[clamp(2rem,4.2vw,3.2rem)] font-medium leading-[1.04] tracking-[-0.015em] text-zinc-900">
            Your recent queries<span className="text-torch-500">.</span>
          </h1>
          <p className="mono mt-4 max-w-md text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-500">
            Stored in browser localStorage. Cleared when you clear site data.
          </p>
        </div>
        <Link
          href="/dashboard/ask"
          className="inline-flex items-center rounded-md bg-zinc-900 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800"
        >
          New ask
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mono rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center text-[12px] tracking-[0.04em] text-zinc-400">
          No history yet · ask a question to start
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          {items.map((it, i) => (
            <li key={it.id} className="border-b border-zinc-100 last:border-b-0">
              <Link
                href={`/dashboard/q/${it.id}`}
                className="group grid grid-cols-[40px_1fr_120px_80px] items-center gap-4 px-5 py-4 transition-colors hover:bg-cream-50"
              >
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[14px] text-zinc-900">
                  {it.q}
                </span>
                <span className="mono text-[11px] tracking-[0.04em] text-zinc-500">
                  {relTime(it.ts)}
                </span>
                <span className="mono justify-self-end text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-torch-500">
                  Replay
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
