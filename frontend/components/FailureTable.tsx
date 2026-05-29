import { failureModes } from "@/lib/mock";

export function FailureTable() {
  return (
    <div className="overflow-hidden">
      <div className="mono grid grid-cols-[64px_1fr_88px_64px] gap-3 border-b border-white/8 px-1 pb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        <span>id</span>
        <span>question</span>
        <span>category</span>
        <span className="text-right">score</span>
      </div>
      <ul className="divide-y divide-white/5">
        {failureModes.map((f) => (
          <li
            key={f.id}
            className="group grid grid-cols-[64px_1fr_88px_64px] items-center gap-3 px-1 py-2.5 transition-colors hover:bg-white/[0.02]"
          >
            <span className="mono text-[11px] text-torch-400">{f.id}</span>
            <span className="truncate text-[13px] text-zinc-300 group-hover:text-zinc-100">
              {f.q}
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {f.category}
            </span>
            <span className="mono text-right text-[12.5px] tabular text-rose-300">
              {f.score.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mono mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        <span>lowest 8 / 250</span>
        <span>view all</span>
      </div>
    </div>
  );
}
