import { latency } from "@/lib/mock";

const W = 720;
const H = 280;
const PAD = { l: 44, r: 16, t: 16, b: 28 };

function path(data: number[], min: number, max: number) {
  const span = max - min || 1;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const stepX = innerW / (data.length - 1);
  return data
    .map((v, i) => {
      const x = PAD.l + i * stepX;
      const y = PAD.t + innerH - ((v - min) / span) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LatencyChart() {
  const all = [...latency.p50, ...latency.p95, ...latency.p99];
  const max = Math.ceil(Math.max(...all) / 100) * 100;
  const min = 0;

  const lines = [
    { d: path(latency.p50, min, max), color: "#5BC3E5", label: "p50" },
    { d: path(latency.p95, min, max), color: "#FFA46E", label: "p95" },
    { d: path(latency.p99, min, max), color: "#EE4C2C", label: "p99" },
  ];

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round((min + (max - min) * t) / 100) * 100);

  return (
    <div className="rounded-md border border-white/8 bg-ink-100/40 p-5">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            /// latency · last 50 runs (ms)
          </div>
          <div className="mt-1 font-display text-[20px] font-light tracking-tight text-zinc-100">
            First-token latency
          </div>
        </div>
        <div className="mono flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {lines.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span
                className="h-px w-4"
                style={{ background: l.color, boxShadow: `0 0 6px ${l.color}80` }}
              />
              <span>{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        {/* grid */}
        {ticks.map((t, i) => {
          const y = PAD.t + (H - PAD.t - PAD.b) * (1 - i / (ticks.length - 1));
          return (
            <g key={t}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <text
                x={PAD.l - 8}
                y={y + 3}
                textAnchor="end"
                className="mono fill-zinc-600 text-[9px]"
                style={{ letterSpacing: "0.12em" }}
              >
                {t}
              </text>
            </g>
          );
        })}
        {/* x-axis ticks */}
        {[0, 10, 20, 30, 40, 49].map((i) => {
          const innerW = W - PAD.l - PAD.r;
          const x = PAD.l + (i / 49) * innerW;
          return (
            <text
              key={i}
              x={x}
              y={H - 10}
              textAnchor="middle"
              className="mono fill-zinc-600 text-[9px]"
              style={{ letterSpacing: "0.12em" }}
            >
              {i === 49 ? "now" : `-${49 - i}`}
            </text>
          );
        })}

        {/* lines */}
        {lines.map((l) => (
          <path
            key={l.label}
            d={l.d}
            fill="none"
            stroke={l.color}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${l.color}60)` }}
          />
        ))}

        {/* SLO marker at 1200ms */}
        {(() => {
          const innerH = H - PAD.t - PAD.b;
          const y = PAD.t + innerH - (1200 / max) * innerH;
          return (
            <g>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="rgba(238,76,44,0.3)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={W - PAD.r - 4}
                y={y - 4}
                textAnchor="end"
                className="mono fill-torch-400/80 text-[9px]"
                style={{ letterSpacing: "0.14em" }}
              >
                SLO 1200ms
              </text>
            </g>
          );
        })()}
      </svg>

      <div className="mono mt-1 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-zinc-600">
        <span>p50 0.62s · p95 1.10s · p99 1.92s</span>
        <span className="text-emerald-300">within SLO</span>
      </div>
    </div>
  );
}
