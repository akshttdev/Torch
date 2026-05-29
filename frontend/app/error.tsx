"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-ink-0 px-6 py-24 text-center">
      <div className="mono mb-4 inline-flex items-center gap-2 rounded-md border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        SYSTEM FAULT
      </div>
      <h1 className="text-[clamp(2rem,4.5vw,3.6rem)] font-medium uppercase leading-[1.02] tracking-[-0.015em] text-zinc-50">
        SOMETHING BROKE<span className="text-torch-500">.</span>
      </h1>
      <p className="mono mt-5 max-w-md text-[11.5px] uppercase tracking-[0.18em] text-zinc-500">
        {error.digest
          ? `TRACE ${error.digest}`
          : "AN UNCAUGHT EXCEPTION REACHED THE ROOT BOUNDARY."}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-black transition-transform hover:scale-[1.02]"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/[0.08]"
        >
          BACK TO LANDING
        </Link>
      </div>
    </main>
  );
}
