"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AnswerStub({ id }: { id: string }) {
  const [pending, setPending] = useState<{ q: string; filter: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`torch.pending.${id}`);
      if (raw) setPending(JSON.parse(raw));
    } catch {}
  }, [id]);

  return (
    <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 md:px-10">
      <div className="mono mb-6 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span>Query · {id}</span>
        <span className="text-zinc-300">|</span>
        <span>filter · {pending?.filter ?? "All"}</span>
      </div>

      <h1 className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.015em] text-zinc-900">
        {pending?.q ?? "Query not found."}
      </h1>

      <div className="mt-10 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6">
            <div className="mono mb-4 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
              <span>Answer stream</span>
              <span className="text-amber-600">Pending · API not yet wired</span>
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-3 rounded-sm bg-cream-100"
                  style={{
                    width: `${[100, 92, 96, 78, 64][i]}%`,
                    animation: `pulse-dot 2.4s ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="mono mt-6 border-t border-zinc-200/70 pt-4 text-[11.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
              This is a scaffold. Once the FastAPI{" "}
              <span className="text-torch-600">POST /ask</span> SSE endpoint
              lands, tokens will stream into this container with inline{" "}
              <span className="text-torch-600">[n]</span> citation chips that
              resolve to the right-rail cards.
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="mono mb-3 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
            Citations
          </div>
          <div className="space-y-3">
            {(["blue", "green", "purple"] as const).map((tone, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/80 bg-white p-4"
              >
                <div className="mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`grid h-5 min-w-[20px] place-items-center rounded-md px-1 text-zinc-900 ${
                        tone === "blue"
                          ? "bg-pastel-blue"
                          : tone === "green"
                          ? "bg-pastel-green"
                          : "bg-pastel-purple"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>Pending</span>
                  </span>
                  <span className="text-zinc-400">—</span>
                </div>
                <div className="h-2 w-3/4 rounded-sm bg-cream-100" />
                <div className="mt-1.5 h-2 w-1/2 rounded-sm bg-cream-100" />
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/ask"
            className="mt-6 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-[12px] font-medium text-zinc-900 transition-colors hover:bg-cream-50"
          >
            Ask another
          </Link>
        </div>
      </div>
    </section>
  );
}
