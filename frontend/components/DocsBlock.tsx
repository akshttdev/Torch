// Light-mode quickstart + API surface card row for the landing Docs section.

const quickstart = [
  "git clone github.com/akshttdev/Torch && cd Torch",
  "cd frontend && npm install && npm run dev",
  "cd ../backend && pip install -r requirements.txt",
  "cp .env.example .env  # add QDRANT_*, LLM key",
  "python -m app.ingestion.docs.index_docs",
];

const endpoints = [
  { method: "POST", path: "/ask", out: "SSE · token · citation · done", tone: "blue" },
  { method: "POST", path: "/search", out: "JSON · ranked chunks", tone: "green" },
  { method: "GET", path: "/sources", out: "JSON · per-source freshness", tone: "purple" },
  { method: "GET", path: "/eval/latest", out: "JSON · metrics object", tone: "blue" },
  { method: "POST", path: "/feedback", out: "{ok:true}", tone: "green" },
  { method: "GET", path: "/healthz", out: "{ok, qdrant, llm}", tone: "purple" },
] as const;

const toneBg = {
  blue: "bg-pastel-blue",
  green: "bg-pastel-green",
  purple: "bg-pastel-purple",
} as const;

export function DocsBlock() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* quickstart terminal card — white themed, dark text */}
      <div className="col-span-12 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-7">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-torch-500" />
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            bash · 5 commands
          </span>
        </div>
        <pre className="mono overflow-x-auto text-[12px] leading-[1.95] text-zinc-800">
          <code>
            {quickstart.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="select-none text-torch-500">$</span>
                <span>{q}</span>
              </div>
            ))}
          </code>
        </pre>
        <div className="mono mt-6 flex items-center justify-between border-t border-zinc-200/70 pt-4 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
          <span>copy → paste → ship</span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ready
          </span>
        </div>
      </div>

      {/* API surface card */}
      <div className="col-span-12 rounded-2xl border border-zinc-200/80 bg-white p-6 lg:col-span-5">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="font-serif text-[20px] tracking-[-0.005em] text-zinc-900">
            API surface
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            6 endpoints · wip
          </span>
        </div>
        <ul className="divide-y divide-zinc-100">
          {endpoints.map((e) => (
            <li
              key={e.path}
              className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-3"
            >
              <span
                className={`mono inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                  toneBg[e.tone]
                } text-zinc-900`}
              >
                {e.method}
              </span>
              <span className="mono text-[12.5px] text-zinc-900">{e.path}</span>
              <span className="mono text-right text-[10.5px] tracking-[0.04em] text-zinc-500">
                {e.out}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
