// Hand-rolled SVG of the retrieval pipeline.
// Query → Router → [Dense + BM25] → RRF → Rerank → LLM → Stream → UI
// with Qdrant cylinder branching off the dense path.

type NodeProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: "torch" | "instrument" | "none";
};

function Node({ x, y, w, h, label, sub, accent = "none" }: NodeProps) {
  const bg =
    accent === "torch"
      ? "rgba(238,76,44,0.07)"
      : accent === "instrument"
      ? "rgba(91,195,229,0.06)"
      : "rgba(255,255,255,0.025)";
  const stroke =
    accent === "torch"
      ? "rgba(238,76,44,0.55)"
      : accent === "instrument"
      ? "rgba(91,195,229,0.45)"
      : "rgba(255,255,255,0.12)";
  const labelFill =
    accent === "torch" ? "#FFC79A" : accent === "instrument" ? "#BCEAF8" : "#e4e4e7";

  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width={w} height={h} rx="6" fill={bg} stroke={stroke} />
      {accent === "torch" && (
        <rect
          x="0"
          y="0"
          width="3"
          height={h}
          rx="1.5"
          fill="#EE4C2C"
          opacity="0.7"
        />
      )}
      <text
        x={w / 2}
        y={sub ? h / 2 - 2 : h / 2 + 4}
        textAnchor="middle"
        fill={labelFill}
        style={{
          fontFamily: "var(--font-plex-mono), monospace",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={w / 2}
          y={h / 2 + 13}
          textAnchor="middle"
          fill="rgba(161,161,170,0.7)"
          style={{
            fontFamily: "var(--font-plex-mono), monospace",
            fontSize: 9.5,
            letterSpacing: "0.1em",
          }}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  accent = false,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  accent?: boolean;
  dashed?: boolean;
}) {
  const color = accent ? "#EE4C2C" : "rgba(255,255,255,0.28)";
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2 - 5}
        y2={y2}
        stroke={color}
        strokeWidth="1"
        strokeDasharray={dashed ? "3 3" : undefined}
      />
      <polygon
        points={`${x2},${y2} ${x2 - 6},${y2 - 3.5} ${x2 - 6},${y2 + 3.5}`}
        fill={color}
      />
    </g>
  );
}

function ElbowArrow({
  x1,
  y1,
  x2,
  y2,
  accent = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  accent?: boolean;
}) {
  const color = accent ? "#EE4C2C" : "rgba(255,255,255,0.28)";
  const midX = x1 + (x2 - x1) / 2;
  return (
    <g>
      <path
        d={`M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2 - 5},${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      <polygon
        points={`${x2},${y2} ${x2 - 6},${y2 - 3.5} ${x2 - 6},${y2 + 3.5}`}
        fill={color}
      />
    </g>
  );
}

export function ArchitectureDiagram() {
  // y baseline for the main horizontal track
  const ROW = 178;
  const BOX_W = 122;
  const BOX_H = 52;

  // node x positions (left edges) along the row
  const X = {
    query: 16,
    router: 168,
    splitL: 316,
    rrf: 468,
    rerank: 620,
    llm: 772,
    ui: 924,
  };

  const DENSE_Y = 118;
  const BM25_Y = 238;

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/8 bg-ink-100/40 p-4 md:p-6">
      {/* corner ornaments */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <svg
        viewBox="0 0 1060 340"
        className="block h-auto w-full"
        role="img"
        aria-label="Torch retrieval pipeline architecture"
      >
        <defs>
          <linearGradient id="hot-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#EE4C2C" stopOpacity="0" />
            <stop offset="50%" stopColor="#EE4C2C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EE4C2C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid hairline */}
        <line
          x1="0"
          x2="1060"
          y1={ROW + BOX_H / 2}
          y2={ROW + BOX_H / 2}
          stroke="rgba(255,255,255,0.03)"
          strokeDasharray="2 4"
        />

        {/* Qdrant cylinder */}
        <g transform={`translate(${X.splitL},10)`}>
          <ellipse
            cx={BOX_W / 2}
            cy="8"
            rx={BOX_W / 2 - 2}
            ry="7"
            fill="#0a0a0b"
            stroke="rgba(255,255,255,0.18)"
          />
          <rect
            x="2"
            y="8"
            width={BOX_W - 4}
            height="48"
            fill="#0a0a0b"
            stroke="rgba(255,255,255,0.18)"
          />
          <line
            x1="2"
            x2={BOX_W - 2}
            y1="8"
            y2="8"
            stroke="rgba(255,255,255,0)"
          />
          <ellipse
            cx={BOX_W / 2}
            cy="56"
            rx={BOX_W / 2 - 2}
            ry="7"
            fill="#0a0a0b"
            stroke="rgba(255,255,255,0.18)"
          />
          <text
            x={BOX_W / 2}
            y="34"
            textAnchor="middle"
            fill="#e4e4e7"
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.18em",
            }}
          >
            QDRANT
          </text>
          <text
            x={BOX_W / 2}
            y="46"
            textAnchor="middle"
            fill="rgba(161,161,170,0.7)"
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: 9,
              letterSpacing: "0.12em",
            }}
          >
            docs · code · issues
          </text>
        </g>
        {/* dotted line: Qdrant → Dense */}
        <line
          x1={X.splitL + BOX_W / 2}
          y1="76"
          x2={X.splitL + BOX_W / 2}
          y2={DENSE_Y - 4}
          stroke="rgba(255,255,255,0.25)"
          strokeDasharray="3 3"
        />

        {/* Query → Router */}
        <Node x={X.query} y={ROW} w={BOX_W} h={BOX_H} label="Query" sub="user input" />
        <Arrow
          x1={X.query + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.router}
          y2={ROW + BOX_H / 2}
        />

        {/* Router */}
        <Node
          x={X.router}
          y={ROW}
          w={BOX_W}
          h={BOX_H}
          label="Router"
          sub="kw weights"
        />

        {/* Router → Dense (top) */}
        <ElbowArrow
          x1={X.router + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.splitL}
          y2={DENSE_Y + BOX_H / 2}
        />
        {/* Router → BM25 (bottom) */}
        <ElbowArrow
          x1={X.router + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.splitL}
          y2={BM25_Y + BOX_H / 2}
        />

        {/* Dense */}
        <Node
          x={X.splitL}
          y={DENSE_Y}
          w={BOX_W}
          h={BOX_H}
          label="Dense"
          sub="bge · jina-code"
          accent="instrument"
        />

        {/* BM25 */}
        <Node
          x={X.splitL}
          y={BM25_Y}
          w={BOX_W}
          h={BOX_H}
          label="BM25"
          sub="sparse · rank_bm25"
          accent="instrument"
        />

        {/* Dense → RRF */}
        <ElbowArrow
          x1={X.splitL + BOX_W}
          y1={DENSE_Y + BOX_H / 2}
          x2={X.rrf}
          y2={ROW + BOX_H / 2}
        />
        {/* BM25 → RRF */}
        <ElbowArrow
          x1={X.splitL + BOX_W}
          y1={BM25_Y + BOX_H / 2}
          x2={X.rrf}
          y2={ROW + BOX_H / 2}
        />

        {/* RRF */}
        <Node
          x={X.rrf}
          y={ROW}
          w={BOX_W}
          h={BOX_H}
          label="RRF"
          sub="k=60 · fuse"
          accent="torch"
        />
        <Arrow
          x1={X.rrf + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.rerank}
          y2={ROW + BOX_H / 2}
        />

        {/* Rerank */}
        <Node
          x={X.rerank}
          y={ROW}
          w={BOX_W}
          h={BOX_H}
          label="Rerank"
          sub="bge-reranker"
          accent="torch"
        />
        <Arrow
          x1={X.rerank + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.llm}
          y2={ROW + BOX_H / 2}
        />

        {/* LLM */}
        <Node
          x={X.llm}
          y={ROW}
          w={BOX_W}
          h={BOX_H}
          label="LLM"
          sub="Sonnet 4.6"
        />
        <Arrow
          x1={X.llm + BOX_W}
          y1={ROW + BOX_H / 2}
          x2={X.ui}
          y2={ROW + BOX_H / 2}
          accent
        />

        {/* UI */}
        <Node
          x={X.ui}
          y={ROW}
          w={BOX_W}
          h={BOX_H}
          label="UI"
          sub="SSE · cite"
          accent="torch"
        />

        {/* footer note on arrow */}
        <text
          x={(X.llm + BOX_W + X.ui) / 2}
          y={ROW - 10}
          textAnchor="middle"
          fill="#FFC79A"
          style={{
            fontFamily: "var(--font-plex-mono), monospace",
            fontSize: 9.5,
            letterSpacing: "0.18em",
          }}
        >
          token + [n]
        </text>

        {/* hot bottom edge */}
        <rect x="0" y="335" width="1060" height="1" fill="url(#hot-edge)" />
      </svg>

      {/* legend */}
      <div className="mono mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/5 pt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        <Legend swatch="#FFFFFF22" label="stage" />
        <Legend swatch="#5BC3E5" label="retrieve · parallel" />
        <Legend swatch="#EE4C2C" label="differentiator" />
        <span className="ml-auto text-zinc-600">
          p95 first-token · 1.10s · 250-Q bench
        </span>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2 w-3 rounded-sm"
        style={{ background: swatch, boxShadow: `0 0 6px ${swatch}88` }}
      />
      <span>{label}</span>
    </span>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-2 left-2",
    tr: "top-2 right-2 rotate-90",
    bl: "bottom-2 left-2 -rotate-90",
    br: "bottom-2 right-2 rotate-180",
  } as const;
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute ${map[pos]} text-torch-500/50`}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path d="M0 3V0H3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
