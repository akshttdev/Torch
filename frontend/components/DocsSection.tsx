const quickstart = [
  { c: "$", t: "git clone https://github.com/akshttdev/Torch && cd Torch" },
  { c: "$", t: "cd frontend && npm install && npm run dev", note: "serves http://localhost:3000" },
  { c: "$", t: "cd ../backend && python -m venv .venv && source .venv/bin/activate" },
  { c: "$", t: "pip install -r requirements.txt && cp .env.example .env" },
  { c: "$", t: "python -m app.ingestion.docs.index_docs", note: "1 of 3 ingestors" },
];

const endpoints = [
  { method: "POST", path: "/ask", body: "{query, sources?, top_k?}", out: "SSE · token · citation · done", status: "wip" as const },
  { method: "POST", path: "/search", body: "{query, sources?, top_k?}", out: "JSON · ranked chunks", status: "wip" as const },
  { method: "GET",  path: "/sources", body: "—", out: "JSON · per-source freshness", status: "wip" as const },
  { method: "GET",  path: "/eval/latest", body: "—", out: "JSON · metrics object", status: "wip" as const },
  { method: "POST", path: "/feedback", body: "{query_id, rating}", out: "{ok:true}", status: "wip" as const },
  { method: "GET",  path: "/healthz", body: "—", out: "{ok, qdrant, llm}", status: "wip" as const },
];

const envVars = [
  { k: "QDRANT_URL", req: "required", purpose: "Qdrant Cloud cluster" },
  { k: "QDRANT_API_KEY", req: "required", purpose: "" },
  { k: "ANTHROPIC_API_KEY", req: "primary", purpose: "Claude Sonnet 4.6 streaming + caching" },
  { k: "GEMINI_API_KEY", req: "fallback", purpose: "When LLM_PROVIDER=gemini" },
  { k: "LLM_PROVIDER", req: "optional", purpose: "anthropic (default) · gemini" },
  { k: "GITHUB_TOKEN", req: "ingest", purpose: "Higher rate limits on issue scraper" },
];

export function DocsSection() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* QUICKSTART ===================================================== */}
      <div className="col-span-12 lg:col-span-7">
        <SubHead label="quickstart" hint="under 60 seconds to a running frontend" />
        <div className="overflow-hidden rounded-lg border border-white/8 bg-black/40 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.015] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span className="h-2 w-2 rounded-full bg-torch-500/80" />
              <span className="mono ml-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                bash · 5 commands
              </span>
            </div>
            <button
              type="button"
              className="mono rounded-sm border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-100"
            >
              copy
            </button>
          </div>
          <pre className="mono overflow-x-auto px-5 py-5 text-[12.5px] leading-[1.8] text-zinc-200">
            <code>
              {quickstart.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="select-none text-torch-500/80 w-3">
                    {q.c}
                  </span>
                  <span className="flex-1">
                    <span className="text-zinc-100">{q.t}</span>
                    {q.note && (
                      <span className="ml-3 text-zinc-600">// {q.note}</span>
                    )}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* ENV VARS ======================================================= */}
      <div className="col-span-12 lg:col-span-5">
        <SubHead label="env" hint="copy from .env.example" />
        <div className="overflow-hidden rounded-lg border border-white/8">
          <div className="mono grid grid-cols-[1.4fr_0.7fr] border-b border-white/8 bg-white/[0.015] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <span>variable</span>
            <span className="text-right">required</span>
          </div>
          <ul className="divide-y divide-white/5">
            {envVars.map((e) => (
              <li
                key={e.k}
                className="mono grid grid-cols-[1.4fr_0.7fr] items-center gap-2 px-4 py-2.5"
              >
                <span>
                  <span className="text-torch-300 text-[12px]">{e.k}</span>
                  {e.purpose && (
                    <span className="block text-[10px] text-zinc-500">
                      {e.purpose}
                    </span>
                  )}
                </span>
                <span
                  className={`justify-self-end rounded-sm border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.18em] ${
                    e.req === "required"
                      ? "border-torch-500/40 bg-torch-500/10 text-torch-200"
                      : e.req === "primary"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : e.req === "fallback"
                      ? "border-instrument-400/40 bg-instrument-400/10 text-instrument-300"
                      : "border-white/10 bg-white/5 text-zinc-400"
                  }`}
                >
                  {e.req}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* API ============================================================ */}
      <div className="col-span-12">
        <SubHead label="api surface" hint="HTTP / SSE — landing once `app/main.py` ships" />
        <div className="overflow-hidden rounded-lg border border-white/8">
          <div className="mono grid grid-cols-[0.5fr_1fr_1.4fr_1.4fr_0.4fr] gap-3 border-b border-white/8 bg-white/[0.015] px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <span>method</span>
            <span>path</span>
            <span>body</span>
            <span>response</span>
            <span className="text-right">status</span>
          </div>
          <ul className="divide-y divide-white/5">
            {endpoints.map((e) => (
              <li
                key={e.method + e.path}
                className="mono grid grid-cols-[0.5fr_1fr_1.4fr_1.4fr_0.4fr] items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className={`text-[11px] tracking-[0.18em] ${
                    e.method === "GET" ? "text-instrument-300" : "text-torch-300"
                  }`}
                >
                  {e.method}
                </span>
                <span className="text-[13px] text-zinc-100">{e.path}</span>
                <span className="truncate text-[11.5px] text-zinc-500">
                  {e.body}
                </span>
                <span className="truncate text-[11.5px] text-zinc-400">
                  {e.out}
                </span>
                <span className="justify-self-end mono rounded-sm border border-amber-400/30 bg-amber-400/5 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.18em] text-amber-300">
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SubHead({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <div className="mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
        /// {label}
      </div>
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        {hint}
      </div>
    </div>
  );
}
