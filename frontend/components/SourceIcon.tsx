import type { SourceKind } from "@/lib/mock";

const colorByKind: Record<SourceKind, string> = {
  docs: "text-instrument-400",
  code: "text-torch-300",
  issues: "text-amber-300",
  forum: "text-violet-300",
  so: "text-emerald-300",
};

export function SourceIcon({
  kind,
  className = "",
}: {
  kind: SourceKind;
  className?: string;
}) {
  const cls = `${colorByKind[kind]} ${className}`;
  if (kind === "docs") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={cls} aria-hidden>
        <rect x="2.5" y="1.5" width="11" height="13" rx="1" stroke="currentColor" />
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "code") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={cls} aria-hidden>
        <path
          d="M6 4 2.5 8 6 12M10 4l3.5 4-3.5 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "issues") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" />
        <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "forum") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={cls} aria-hidden>
        <path
          d="M2.5 4h11v6.5H6L3 13v-2.5h-.5z"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cls} aria-hidden>
      <path d="M3 11l5 3 5-3M3 8l5 3 5-3M3 5l5-3 5 3-5 3-5-3z" stroke="currentColor" strokeLinejoin="round" />
    </svg>
  );
}
