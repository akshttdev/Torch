import { perSourceHit5 } from "@/lib/mock";
import { SourceIcon } from "./SourceIcon";

export function PerSourceBars() {
  const max = Math.max(...perSourceHit5.map((p) => p.value));
  return (
    <div className="space-y-5">
      {perSourceHit5.map((p) => {
        const w = (p.value / 1) * 100;
        return (
          <div key={p.kind}>
            <div className="mono mb-1.5 flex items-center justify-between text-[10.5px] uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-zinc-400">
                <SourceIcon kind={p.kind} className="h-3 w-3" />
                <span>{p.kind}</span>
              </span>
              <span className="font-display text-[15px] tabular text-zinc-100 normal-case tracking-tight">
                {p.value.toFixed(2)}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-sm bg-white/[0.04]">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-torch-700 via-torch-500 to-torch-300"
                style={{ width: `${w}%` }}
              />
              {p.value === max && (
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${w}%`,
                    boxShadow: "0 0 12px rgba(238,76,44,0.55)",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
      <div className="mono mt-2 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        <span>hit@5 by source</span>
        <span>n = 250</span>
      </div>
    </div>
  );
}
