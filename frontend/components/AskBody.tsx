"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const FILTERS = [
  { label: "All", tone: "neutral" },
  { label: "Docs", tone: "blue" },
  { label: "Code", tone: "green" },
  { label: "Issues", tone: "purple" },
] as const;
type Filter = (typeof FILTERS)[number]["label"];
type Tone = (typeof FILTERS)[number]["tone"];

const filterStyles: Record<
  Tone,
  { on: string; off: string }
> = {
  neutral: {
    on: "border-zinc-900 bg-zinc-900 text-white",
    off: "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-900",
  },
  blue: {
    on: "border-pastel-blueDeep bg-pastel-blue text-zinc-900",
    off: "border-pastel-blueDeep/30 bg-pastel-blueLight text-zinc-700 hover:border-pastel-blueDeep/60 hover:text-zinc-900",
  },
  green: {
    on: "border-pastel-greenDeep bg-pastel-green text-zinc-900",
    off: "border-pastel-greenDeep/30 bg-pastel-greenLight text-zinc-700 hover:border-pastel-greenDeep/60 hover:text-zinc-900",
  },
  purple: {
    on: "border-pastel-purpleDeep bg-pastel-purple text-zinc-900",
    off: "border-pastel-purpleDeep/30 bg-pastel-purpleLight text-zinc-700 hover:border-pastel-purpleDeep/60 hover:text-zinc-900",
  },
};

const SAMPLES = [
  { q: "Why does my DataLoader hang with num_workers>0 on macOS?", tag: "DataLoader", tone: "blue" },
  { q: "What's the difference between .detach() and .data?", tag: "Autograd", tone: "purple" },
  { q: "How does torch.compile handle dynamic shapes?", tag: "Compile", tone: "green" },
  { q: "Why does set_to_none=True exist on zero_grad?", tag: "Optim", tone: "blue" },
  { q: "Open issues about MPS backend NaN gradients", tag: "MPS", tone: "purple" },
  { q: "How does torch.utils.checkpoint interact with autograd?", tag: "Checkpoint", tone: "green" },
] as const;

const sampleTone: Record<
  "blue" | "green" | "purple",
  { tag: string; rail: string }
> = {
  blue: { tag: "bg-pastel-blue text-pastel-blueDeep", rail: "bg-pastel-blueDeep" },
  green: { tag: "bg-pastel-green text-pastel-greenDeep", rail: "bg-pastel-greenDeep" },
  purple: { tag: "bg-pastel-purple text-pastel-purpleDeep", rail: "bg-pastel-purpleDeep" },
};

type RecentItem = { id: string; q: string; ts: number };
const LS_KEY = "torch.recent";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AskBody() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setRecent(JSON.parse(raw).slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 320);
      return;
    }
    const id = makeId();
    const next: RecentItem[] = [
      { id, q: trimmed, ts: Date.now() },
      ...recent.filter((r) => r.q !== trimmed),
    ].slice(0, 5);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      sessionStorage.setItem(
        `torch.pending.${id}`,
        JSON.stringify({ q: trimmed, filter })
      );
    } catch {}
    setRecent(next);
    router.push(`/dashboard/q/${id}`);
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 md:px-10">
      {/* soft pastel halo behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 480px at 20% 30%, rgba(185,201,232,0.45), transparent 60%), radial-gradient(900px 500px at 80% 70%, rgba(200,180,216,0.5), transparent 60%), radial-gradient(600px 380px at 50% 90%, rgba(183,219,190,0.4), transparent 65%)",
        }}
      />

      <h1 className="rise rise-d0 text-[clamp(2rem,4.4vw,3.2rem)] font-medium uppercase leading-[1.06] tracking-[-0.005em] text-zinc-900">
        Ask anything about PyTorch<span className="text-torch-500">.</span>
      </h1>
      <p className="rise rise-d1 mono mt-4 max-w-xl text-center text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
        Every answer streams with inline citations. No hallucinations.
      </p>

      {/* colored filter pills */}
      <div className="rise rise-d2 mt-8 flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((f) => {
          const on = filter === f.label;
          const sty = filterStyles[f.tone];
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.label)}
              className={`rounded-md border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                on ? sty.on : sty.off
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* omnibox with gradient glow */}
      <motion.form
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.32 }}
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="rise rise-d3 relative mt-5 w-full max-w-2xl"
      >
        {/* gradient halo behind input */}
        <div
          aria-hidden
          className="absolute -inset-1 rounded-2xl opacity-70 blur-xl"
          style={{
            background:
              "linear-gradient(120deg, rgba(185,201,232,0.6), rgba(200,180,216,0.6), rgba(183,219,190,0.5))",
          }}
        />
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] transition-colors focus-within:border-zinc-900">
          <div className="flex items-center gap-3 px-5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-400" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <line x1="10.6" y1="10.6" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about PyTorch…"
              className="h-14 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              spellCheck={false}
              autoComplete="off"
            />
            <kbd className="mono hidden shrink-0 items-center gap-1 rounded-sm border border-zinc-300 bg-cream-50 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:inline-flex">
              ⌘K
            </kbd>
            <button
              type="submit"
              disabled={!query.trim()}
              className="shrink-0 rounded-md bg-zinc-900 px-4 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-30"
            >
              Ask
            </button>
          </div>
        </div>
        <div className="mono mt-2.5 flex items-center justify-between px-1 text-[10.5px] tracking-[0.04em] text-zinc-500">
          <span>Powered by hybrid retrieval · 28k chunks · last sync 2h ago</span>
          <span className="hidden sm:inline">⌘+Enter to submit</span>
        </div>
      </motion.form>

      {/* TRY row — tone-coded sample cards */}
      <div className="rise rise-d4 mt-12 w-full max-w-3xl">
        <div className="mono mb-3 flex items-baseline justify-between text-[10px] uppercase tracking-[0.22em]">
          <span className="text-zinc-500">Try one of these</span>
          <span className="text-zinc-400">6 samples</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAMPLES.map((s, i) => {
            const t = sampleTone[s.tone];
            return (
              <button
                key={s.q}
                type="button"
                onClick={() => {
                  setQuery(s.q);
                  inputRef.current?.focus();
                }}
                className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-left transition-all hover:border-zinc-400 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
              >
                {/* color rail */}
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 h-full w-1 ${t.rail}`}
                />
                <span className="mono mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.2em] text-zinc-400 tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span
                    className={`mono mb-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.2em] ${t.tag}`}
                  >
                    {s.tag}
                  </span>
                  <span className="block text-[13px] text-zinc-900">
                    {s.q}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECENT row */}
      <div className="rise rise-d5 mt-8 w-full max-w-3xl">
        <div className="mono mb-3 flex items-baseline justify-between text-[10px] uppercase tracking-[0.22em]">
          <span className="text-zinc-500">Recent</span>
          <span className="text-zinc-400">local · {recent.length}/5</span>
        </div>
        {recent.length === 0 ? (
          <div className="mono rounded-xl border border-dashed border-zinc-300 bg-white/60 px-5 py-6 text-center text-[11.5px] tracking-[0.04em] text-zinc-400 backdrop-blur">
            No queries yet · your last 5 will live here
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white/90 backdrop-blur">
            {recent.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(r.q);
                    inputRef.current?.focus();
                  }}
                  className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-50"
                >
                  <span className="truncate text-[13px] text-zinc-900">
                    {r.q}
                  </span>
                  <span className="mono shrink-0 text-[10px] uppercase tracking-[0.2em] text-zinc-400 group-hover:text-torch-500">
                    Replay
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
