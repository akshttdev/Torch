"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type SourceRow } from "@/lib/mock";
import { SourceIcon } from "./SourceIcon";
import { StatBadge } from "./StatBadge";
import { SourceSheet } from "./SourceSheet";
import { fmtInt, relTime } from "@/lib/utils";

export function SourcesTable({ sources }: { sources: SourceRow[] }) {
  const [open, setOpen] = useState<SourceRow | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-md border border-white/8">
        {/* header */}
        <div className="mono grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_0.4fr] items-center gap-4 border-b border-white/8 bg-white/[0.015] px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <span>source</span>
          <span className="text-right">chunks</span>
          <span>synced</span>
          <span>status</span>
          <span className="text-right">action</span>
        </div>

        <ul>
          {sources.map((s, i) => (
            <motion.li
              key={s.kind}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="group cursor-pointer border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
              onClick={() => setOpen(s)}
            >
              <div className="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_0.4fr] items-center gap-4 px-5 py-4">
                {/* source */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-white/8 bg-white/[0.02]">
                    <SourceIcon kind={s.kind} className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] text-zinc-100 group-hover:text-white">
                      {s.name}
                    </div>
                    <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                      {s.kind} · {s.embedder.split("/").pop()}
                    </div>
                  </div>
                </div>
                {/* chunks */}
                <div className="mono text-right text-[14px] tabular text-zinc-200">
                  {s.count > 0 ? fmtInt(s.count) : <span className="text-zinc-700">—</span>}
                </div>
                {/* synced */}
                <div className="mono text-[11.5px] uppercase tracking-[0.18em] text-zinc-400">
                  {relTime(s.last_synced_at)}
                </div>
                {/* status */}
                <div>
                  <StatBadge status={s.status} />
                </div>
                {/* action */}
                <div className="mono flex justify-end text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors group-hover:text-torch-300">
                  view
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <SourceSheet source={open} onClose={() => setOpen(null)} />
    </>
  );
}
