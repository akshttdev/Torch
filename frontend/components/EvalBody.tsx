"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { metrics } from "@/lib/mock";
import { MetricCard } from "./MetricCard";
import { LatencyChart } from "./LatencyChart";
import { PerSourceBars } from "./PerSourceBars";
import { FailureTable } from "./FailureTable";

type Tab = "source" | "fail";
type Mode = "torch" | "vanilla";

export function EvalBody() {
  const [mode, setMode] = useState<Mode>("torch");
  const [tab, setTab] = useState<Tab>("source");

  return (
    <>
      {/* MODE TOGGLE */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          /// metrics · {mode === "torch" ? "torch.v1" : "vanilla.llm"}
        </div>
        <div className="relative inline-flex items-center gap-0 rounded-sm border border-white/8 bg-ink-100 p-1">
          {(["torch", "vanilla"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`mono relative z-10 px-3.5 py-1.5 text-[10.5px] uppercase tracking-[0.22em] transition-colors ${
                  on ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="modePill"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-sm ${
                      m === "torch" ? "bg-torch-500" : "bg-instrument-400"
                    }`}
                    style={{ zIndex: -1 }}
                  />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC GRID */}
      <div key={mode} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <MetricCard key={m.key + mode} metric={m} mode={mode} index={i} />
        ))}
      </div>

      {/* ROW 2 */}
      <div className="mt-10 grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <LatencyChart />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-md border border-white/8 bg-ink-100/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                /// breakdown
              </div>
              <div className="flex items-center gap-1 rounded-sm border border-white/8 bg-black/30 p-0.5">
                {(
                  [
                    ["source", "per source"],
                    ["fail", "failure modes"],
                  ] as const
                ).map(([k, l]) => {
                  const on = tab === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTab(k)}
                      className={`mono px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                        on
                          ? "bg-white/8 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "source" ? <PerSourceBars /> : <FailureTable />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
