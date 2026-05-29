// Square pixel-block EQ silhouette. Blocks use a translucent purple-ink fill so
// they multiply over whatever bg sits behind: pure white → faint lavender,
// gradient lavender → deeper purple, near-black → almost invisible.
export function EqBars({
  className = "",
  tone = "dark",
  density = 90,
}: {
  className?: string;
  tone?: "light" | "dark";
  density?: number;
}) {
  // `dark` (default) = blocks read purple-ink on light bg.
  // `light` = blocks read white on dark bg (legacy use).
  const baseFill =
    tone === "dark" ? "rgba(80,68,150,0.65)" : "rgba(255,255,255,0.9)";

  const seedHeights = (n: number) => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env = 0.32 + Math.sin(t * Math.PI) * 0.55;
      const noise = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
      const h = env * (0.55 + 0.45 * noise);
      out.push(Math.max(0.06, Math.min(1, h)));
    }
    return out;
  };

  const heights = seedHeights(density);
  const W = density * 6;
  const COL_GAP = 6;       // horizontal step
  const ROW_STEP = 6;      // vertical step
  const SQ = 4;            // square side

  return (
    <svg
      viewBox={`0 0 ${W} 80`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      aria-hidden
      style={{ mixBlendMode: tone === "dark" ? "multiply" : "screen" }}
    >
      {heights.map((h, i) => {
        const x = i * COL_GAP + 1;
        const barH = h * 76;
        const yTop = 80 - barH;
        const rows = Math.max(2, Math.floor(barH / ROW_STEP));
        return Array.from({ length: rows }).map((_, k) => {
          const dy = yTop + k * ROW_STEP + 1;
          // bottom-of-column squares brighter, top fades out
          const op = 0.25 + (k / rows) * 0.75;
          return (
            <rect
              key={`${i}-${k}`}
              x={x}
              y={dy}
              width={SQ}
              height={SQ}
              fill={baseFill}
              opacity={op}
            />
          );
        });
      })}
    </svg>
  );
}
