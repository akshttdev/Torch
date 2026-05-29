export function SectionDivider({
  num,
  label,
  rightHint,
}: {
  num: string;
  label: string;
  rightHint?: string;
}) {
  return (
    <div
      aria-hidden
      className="relative w-full px-6 py-10 md:px-12 md:py-14 lg:px-20 xl:px-28"
    >
      <div className="relative flex items-center gap-5">
        {/* left corner tick */}
        <span className="block h-2 w-2 shrink-0 border-l border-t border-zinc-600" />
        <span className="h-px flex-1 bg-zinc-700" />

        {/* center label */}
        <span className="mono relative inline-flex shrink-0 items-center gap-2.5 rounded-md border border-zinc-700 bg-ink-0 px-3.5 py-2 text-[10.5px] uppercase tracking-[0.24em]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-torch-500"
            style={{ boxShadow: "0 0 8px rgba(238,76,44,0.7)" }}
          />
          <span className="text-torch-300 tabular">{num}</span>
          <span className="text-zinc-600">—</span>
          <span className="text-zinc-100">{label}</span>
          {rightHint && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500">{rightHint}</span>
            </>
          )}
        </span>

        {/* right line + corner tick */}
        <span className="h-px flex-1 bg-zinc-700" />
        <span className="block h-2 w-2 shrink-0 border-r border-t border-zinc-600" />
      </div>
    </div>
  );
}
