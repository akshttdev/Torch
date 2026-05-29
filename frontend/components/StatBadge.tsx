import { cn } from "@/lib/utils";

export function StatBadge({
  status,
  className,
}: {
  status: "healthy" | "stale" | "failed";
  className?: string;
}) {
  const map = {
    healthy: { dot: "bg-emerald-400", text: "text-emerald-300", label: "Healthy" },
    stale: { dot: "bg-amber-400", text: "text-amber-300", label: "Stale" },
    failed: { dot: "bg-rose-400", text: "text-rose-300", label: "Failed" },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]",
        s.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} style={{ animation: status === "healthy" ? "pulse-dot 2.4s infinite" : undefined }} />
      {s.label}
    </span>
  );
}
