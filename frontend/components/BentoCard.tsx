import { type ReactNode } from "react";

export function BentoCard({
  index,
  title,
  body,
  stat,
  visual,
  span = "default",
}: {
  index: number;
  title: string;
  body: string;
  stat: string;
  visual: ReactNode;
  span?: "default" | "wide";
}) {
  return (
    <div
      className={`group grain relative isolate overflow-hidden rounded-lg border border-white/8 bg-ink-100/60 p-6 transition-all hover:border-torch-500/30 hover:bg-ink-100 md:p-7 ${
        span === "wide" ? "md:col-span-2" : ""
      }`}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-px bg-torch-500/0 transition-all duration-500 group-hover:bg-torch-500 group-hover:shadow-[0_0_12px_rgba(238,76,44,0.5)]"
      />
      <div className="mono mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        <span>/{String(index + 1).padStart(2, "0")}</span>
        <span className="text-zinc-700 transition-colors group-hover:text-torch-300">
          {stat}
        </span>
      </div>

      <div className="mb-6 h-20">{visual}</div>

      <div className="space-y-2">
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-zinc-100">
          {title}
        </h3>
        <p className="mono text-[12px] leading-relaxed tracking-[0.01em] text-zinc-400">{body}</p>
      </div>
    </div>
  );
}
