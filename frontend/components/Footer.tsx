import Link from "next/link";

const columns: { head: string; items: { href: string; label: string }[] }[] = [
  {
    head: "Product",
    items: [
      { href: "/#features", label: "Overview" },
      { href: "/#architecture", label: "Pipeline" },
      { href: "/#impact", label: "Eval" },
      { href: "/#docs", label: "Docs" },
    ],
  },
  {
    head: "Torch For",
    items: [
      { href: "/dashboard/ask", label: "ML Engineers" },
      { href: "/dashboard/ask", label: "Researchers" },
      { href: "/dashboard/ask", label: "Open-source maintainers" },
    ],
  },
  {
    head: "Use Cases",
    items: [
      { href: "/dashboard/ask", label: "Debug stack traces" },
      { href: "/dashboard/ask", label: "Source-cited answers" },
      { href: "/dashboard/eval", label: "Benchmark a RAG" },
      { href: "/dashboard/sources", label: "Inspect corpus" },
    ],
  },
  {
    head: "Resources",
    items: [
      { href: "/dashboard/eval", label: "Eval dashboard" },
      { href: "/dashboard/sources", label: "Sources" },
      { href: "https://github.com/akshttdev/Torch", label: "GitHub" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="canvas-cream relative w-full border-t border-zinc-200/70">
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-16 md:px-12 md:pb-12 md:pt-20 lg:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="md:pr-6">
            <Link
              href="/"
              className="font-serif text-[24px] leading-none text-zinc-900"
            >
              Torch
            </Link>
            <p className="mono mt-5 max-w-xs text-[12px] leading-relaxed tracking-[0.04em] text-zinc-600">
              Grounded PyTorch help. Hybrid retrieval over docs, code, and
              issues — with inline citations and a public eval.
            </p>
            <form className="mt-6 flex items-center gap-2">
              <input
                type="email"
                placeholder="example@gmail.com"
                className="h-10 w-full max-w-[200px] rounded-md border border-zinc-300 bg-white px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-md bg-zinc-900 px-4 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Subscribe
              </button>
            </form>
          </div>

          {columns.map((col) => (
            <div key={col.head}>
              <div className="text-[13px] font-medium text-zinc-900">
                {col.head}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link
                      href={it.href}
                      className="text-[12.5px] text-zinc-600 transition-colors hover:text-zinc-900"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/70 pt-6 text-[12px] text-zinc-500">
          <div>
            Torch © {new Date().getFullYear()} · Built by{" "}
            <span className="text-zinc-900">Akshat</span>
          </div>
          <Link href="/terms" className="hover:text-zinc-900">
            Terms and conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
