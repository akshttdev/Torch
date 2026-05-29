export function Histogram({ data }: { data: number[] }) {
  if (!data.length) {
    return (
      <div className="mono flex h-24 items-center justify-center text-[10px] uppercase tracking-[0.22em] text-zinc-700">
        no data
      </div>
    );
  }
  const max = Math.max(...data);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-t-[2px] bg-gradient-to-t from-torch-700/40 via-torch-500/50 to-torch-300/80 transition-colors hover:from-torch-600 hover:via-torch-400 hover:to-torch-200"
            style={{ height: `${h}%`, minHeight: "2px" }}
            title={`${v}`}
          >
            <span className="mono absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[9px] text-torch-300 group-hover:block">
              {v}
            </span>
          </div>
        );
      })}
    </div>
  );
}
