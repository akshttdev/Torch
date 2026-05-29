"use client";

import { useState } from "react";
import type { SourceKind } from "@/lib/mock";
import { SourceIcon } from "./SourceIcon";

export function CitationChip({
  n,
  kind,
  title,
  url,
  snippet,
  score,
}: {
  n: number;
  kind: SourceKind;
  title: string;
  url: string;
  snippet: string;
  score: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="mono inline-flex h-[18px] min-w-[20px] -translate-y-px items-center justify-center rounded-[3px] border border-torch-500/50 bg-torch-500/10 px-1 text-[10px] font-medium leading-none text-torch-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_8px_rgba(238,76,44,0.25)] transition-all hover:border-torch-500 hover:bg-torch-500/20 hover:text-torch-100"
        aria-describedby={`cite-${n}`}
      >
        {n}
      </a>
      {open && (
        <span
          id={`cite-${n}`}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-md border border-white/10 bg-ink-200/95 p-3 text-left shadow-2xl backdrop-blur-sm"
        >
          <span className="mb-1.5 flex items-center gap-1.5">
            <SourceIcon kind={kind} className="h-3 w-3" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {kind} · score {score.toFixed(2)}
            </span>
          </span>
          <span className="block text-[13px] leading-snug text-zinc-100">
            {title}
          </span>
          <span className="mt-1.5 block text-[12px] leading-relaxed text-zinc-400 line-clamp-3">
            {snippet}
          </span>
        </span>
      )}
    </span>
  );
}
