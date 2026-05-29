"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Sparkline } from "./Sparkline";
import type { Metric } from "@/lib/mock";

function format(v: number, fmt: Metric["fmt"]) {
  if (fmt === "pct") return `${(v * 100).toFixed(1)}%`;
  if (fmt === "ms") return `${v.toFixed(0)}`;
  return v.toFixed(2);
}

export function MetricCard({
  metric,
  mode,
  index,
}: {
  metric: Metric;
  mode: "torch" | "vanilla";
  index: number;
}) {
  const reduce = useReducedMotion();
  const target =
    mode === "vanilla"
      ? metric.vanilla === null
        ? null
        : metric.vanilla
      : metric.value;
  const [display, setDisplay] = useState(target ?? 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (target === null) return;
    if (reduce) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 0.9,
      ease: [0.22, 0.65, 0.4, 1],
      delay: index * 0.04,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, reduce, index]);

  const delta =
    metric.vanilla !== null && mode === "torch"
      ? metric.value - metric.vanilla
      : null;

  const isNa = target === null;
  const color = mode === "torch" ? "#EE4C2C" : "#5BC3E5";

  return (
    <div
      ref={ref}
      className="relative flex flex-col justify-between overflow-hidden rounded-md border border-white/8 bg-ink-100/60 p-5 transition-colors hover:border-white/15"
    >
      {/* index marker */}
      <div className="mono mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        <span>/{String(index + 1).padStart(2, "0")}</span>
        <span>{metric.label}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          {isNa ? (
            <div className="font-display text-[44px] leading-none text-zinc-700">
              n/a
            </div>
          ) : (
            <div
              className="font-display text-[44px] font-light leading-none tabular tracking-tight"
              style={{ color: mode === "torch" ? "#FFCEB5" : "#BCEAF8" }}
            >
              {format(display, metric.fmt)}
            </div>
          )}
          {delta !== null && !isNa ? (
            <div
              className={`mono mt-2 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] ${
                delta >= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              <span>{delta >= 0 ? "▲" : "▼"}</span>
              <span>{delta >= 0 ? "+" : ""}{format(delta, metric.fmt)}</span>
              <span className="text-zinc-600">vs vanilla</span>
            </div>
          ) : !isNa ? (
            <div className="mono mt-2 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] text-zinc-600">
              <span className="text-zinc-400">retrieval-only</span>
            </div>
          ) : (
            <div className="mono mt-2 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] text-zinc-700">
              <span>—</span>
              <span>no retrieval</span>
            </div>
          )}
        </div>
        {!isNa && metric.history.length > 1 && (
          <Sparkline
            data={mode === "vanilla" ? metric.history.map(() => metric.vanilla ?? 0) : metric.history}
            color={color}
            width={84}
            height={36}
          />
        )}
      </div>
    </div>
  );
}
