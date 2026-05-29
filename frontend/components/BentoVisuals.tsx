import { Sparkline } from "./Sparkline";

// Hybrid retrieval: two streams converging
export function VHybrid() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full">
      <g stroke="currentColor" fill="none" strokeWidth="1" className="text-zinc-700">
        <path d="M10 20 Q 90 20 110 40 T 190 40" />
        <path d="M10 60 Q 90 60 110 40 T 190 40" />
      </g>
      <g className="text-torch-500" stroke="currentColor" fill="none" strokeWidth="1.5">
        <path d="M110 40 L 190 40" />
      </g>
      <g className="mono fill-zinc-500 text-[8px]" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>
        <text x="6" y="16">BM25</text>
        <text x="6" y="74">DENSE</text>
        <text x="148" y="34" className="fill-torch-400">FUSED</text>
      </g>
      <circle cx="110" cy="40" r="3" className="fill-torch-500" />
      <circle cx="110" cy="40" r="6" className="fill-torch-500/0 stroke-torch-500" strokeOpacity="0.4" />
    </svg>
  );
}

// AST chunking: a tree
export function VAst() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full">
      <g stroke="currentColor" strokeWidth="1" fill="none" className="text-zinc-700">
        <path d="M100 12 L 60 36 M100 12 L 140 36" />
        <path d="M60 36 L 36 60 M60 36 L 84 60 M140 36 L 116 60 M140 36 L 164 60" />
      </g>
      <g className="text-torch-400 fill-current">
        <rect x="84" y="4" width="32" height="16" rx="2" className="fill-torch-500/20 stroke-torch-500/60" stroke="currentColor" />
      </g>
      <g className="fill-zinc-300">
        <rect x="46" y="28" width="28" height="14" rx="2" className="fill-white/5 stroke-white/10" stroke="currentColor" strokeWidth="1" />
        <rect x="126" y="28" width="28" height="14" rx="2" className="fill-white/5 stroke-white/10" stroke="currentColor" strokeWidth="1" />
      </g>
      <g className="fill-zinc-500">
        <rect x="22" y="52" width="28" height="14" rx="2" className="fill-white/3 stroke-white/8" stroke="currentColor" strokeWidth="1" />
        <rect x="70" y="52" width="28" height="14" rx="2" className="fill-white/3 stroke-white/8" stroke="currentColor" strokeWidth="1" />
        <rect x="102" y="52" width="28" height="14" rx="2" className="fill-white/3 stroke-white/8" stroke="currentColor" strokeWidth="1" />
        <rect x="150" y="52" width="28" height="14" rx="2" className="fill-white/3 stroke-white/8" stroke="currentColor" strokeWidth="1" />
      </g>
      <g className="mono fill-torch-300 text-[7px]" style={{ letterSpacing: "0.2em" }}>
        <text x="86" y="16">class</text>
      </g>
    </svg>
  );
}

// Citations: paragraph + chips
export function VCite() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full">
      <g stroke="currentColor" strokeWidth="1" className="text-zinc-700">
        <line x1="10" y1="14" x2="190" y2="14" />
        <line x1="10" y1="28" x2="160" y2="28" />
        <line x1="10" y1="42" x2="180" y2="42" />
        <line x1="10" y1="56" x2="140" y2="56" />
      </g>
      {[
        { x: 168, y: 14, n: 1 },
        { x: 138, y: 28, n: 2 },
        { x: 158, y: 42, n: 3 },
      ].map((c) => (
        <g key={c.n}>
          <rect x={c.x} y={c.y - 7} width="16" height="14" rx="3" className="fill-torch-500/15 stroke-torch-500/60" stroke="currentColor" />
          <text x={c.x + 8} y={c.y + 3.5} textAnchor="middle" className="mono fill-torch-300 text-[8px]">{c.n}</text>
        </g>
      ))}
      <line x1="10" y1="70" x2="100" y2="70" stroke="currentColor" strokeWidth="1" className="text-zinc-800" />
    </svg>
  );
}

// Live eval: a sparkline
export function VEval() {
  return (
    <div className="flex h-full items-end gap-3 px-1">
      <div className="flex-1">
        <Sparkline data={[0.74, 0.76, 0.78, 0.79, 0.82, 0.83, 0.85, 0.86, 0.87, 0.87]} width={160} height={64} />
      </div>
      <div className="mono shrink-0 text-right leading-tight">
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">hit@5</div>
        <div className="text-torch-300 text-[18px] tabular">0.87</div>
      </div>
    </div>
  );
}

// Source filter: pills
export function VFilter() {
  return (
    <div className="flex h-full flex-wrap items-center gap-2 px-1">
      {[
        { l: "all", on: true },
        { l: "docs", on: false },
        { l: "code", on: true },
        { l: "issues", on: false },
      ].map((p) => (
        <span
          key={p.l}
          className={`mono inline-flex items-center rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
            p.on
              ? "border-torch-500/60 bg-torch-500/10 text-torch-200"
              : "border-white/10 bg-white/2 text-zinc-500"
          }`}
        >
          {p.l}
        </span>
      ))}
    </div>
  );
}

// Streaming: animated dots
export function VStream() {
  return (
    <div className="flex h-full items-center gap-1.5 px-1">
      <div className="flex items-center gap-1">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">tok</span>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span
            key={i}
            className="h-2 rounded-sm bg-torch-500"
            style={{
              width: `${[14, 22, 8, 18, 26, 10, 20, 16][i]}px`,
              opacity: 1 - i * 0.1,
              animation: `pulse-dot 1.4s infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
