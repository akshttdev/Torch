import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-ink-0 px-6 py-24 text-center">
      <div className="mono mb-4 inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        404 · NOT INDEXED
      </div>
      <h1 className="text-[clamp(2.4rem,6vw,4.4rem)] font-medium uppercase leading-[1.02] tracking-[-0.015em] text-zinc-50">
        ROUTE NOT FOUND<span className="text-torch-500">.</span>
      </h1>
      <p className="mono mt-5 max-w-md text-[11.5px] uppercase tracking-[0.18em] text-zinc-500">
        THIS PATH ISN&apos;T IN THE CORPUS YET. CHECK THE URL OR HEAD BACK HOME.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-black transition-transform hover:scale-[1.02]"
        >
          BACK TO LANDING
        </Link>
        <Link
          href="/dashboard/ask"
          className="inline-flex items-center rounded-md border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/[0.08]"
        >
          OPEN DASHBOARD
        </Link>
      </div>
    </main>
  );
}
