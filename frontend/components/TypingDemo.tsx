"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { demo } from "@/lib/mock";
import { CitationChip } from "./CitationChip";

type Phase = "idle" | "typing" | "thinking" | "streaming" | "done";

export function TypingDemo() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "done" : "idle");
  const [typed, setTyped] = useState("");
  const [streamed, setStreamed] = useState("");

  const fullQ = demo.query;
  const fullA = demo.answer.join("");

  useEffect(() => {
    if (reduce) {
      setTyped(fullQ);
      setStreamed(fullA);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => setPhase("typing"), 700);
    return () => {
      clearTimeout(start);
      clearTimeout(t!);
    };
  }, [reduce, fullQ, fullA]);

  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(fullQ.slice(0, i));
      if (i >= fullQ.length) {
        clearInterval(id);
        setTimeout(() => setPhase("thinking"), 280);
      }
    }, 38);
    return () => clearInterval(id);
  }, [phase, fullQ]);

  useEffect(() => {
    if (phase !== "thinking") return;
    const t = setTimeout(() => setPhase("streaming"), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "streaming") return;
    let i = 0;
    const id = setInterval(() => {
      i += 4;
      setStreamed(fullA.slice(0, i));
      if (i >= fullA.length) {
        clearInterval(id);
        setPhase("done");
      }
    }, 22);
    return () => clearInterval(id);
  }, [phase, fullA]);

  // Render the streamed text with [n] tokens replaced by CitationChip
  const rendered = useMemo(() => {
    if (!streamed) return null;
    const parts: (string | { n: number })[] = [];
    let last = 0;
    const re = /\[(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(streamed)) !== null) {
      if (m.index > last) parts.push(streamed.slice(last, m.index));
      parts.push({ n: Number(m[1]) });
      last = m.index + m[0].length;
    }
    if (last < streamed.length) parts.push(streamed.slice(last));
    return parts.map((p, i) => {
      if (typeof p === "string") {
        return (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p}
          </span>
        );
      }
      const c = demo.citations.find((c) => c.n === p.n);
      if (!c) return <span key={i}>[{p.n}]</span>;
      return (
        <CitationChip
          key={i}
          n={c.n}
          kind={c.kind}
          title={c.title}
          url={c.url}
          score={c.score}
          snippet={c.snippet}
        />
      );
    });
  }, [streamed]);

  return (
    <div className="relative w-full">
      {/* Omnibox */}
      <div className="grain relative overflow-hidden rounded-lg border border-white/10 bg-ink-200/70 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
        {/* terminal chrome */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.015] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-torch-500/80" />
            <span className="mono ml-3 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              POST /ask
            </span>
          </div>
          <span className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-dot 2s infinite" }} />
            sse · grounded
          </span>
        </div>

        {/* question line */}
        <div className="flex items-start gap-3 px-5 py-4 md:px-7">
          <span className="mono mt-1 select-none text-[12px] text-torch-500">{">"}</span>
          <div className="min-w-0 flex-1 text-[18px] font-medium leading-snug text-zinc-100 md:text-[20px]">
            <span>{typed}</span>
            {phase === "typing" && <span className="cursor-bar" />}
            {phase === "idle" && <span className="cursor-bar" />}
          </div>
        </div>

        {/* thinking strip — always rendered, opacity-controlled to reserve layout */}
        <div
          className="border-t border-white/5 bg-black/30 transition-opacity duration-300"
          style={{
            opacity:
              phase === "thinking" || phase === "streaming" || phase === "done"
                ? 1
                : 0,
          }}
        >
          <div className="mono flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500 md:px-7">
            <span className="flex items-center gap-1.5">
              <span className="text-zinc-700">ROUTE</span>
              <span className="text-zinc-300">DOCS · CODE · ISSUES</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-zinc-700">FUSE</span>
              <span className="text-zinc-300">RRF K=60</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-zinc-700">RERANK</span>
              <span className="text-zinc-300">BGE-BASE</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-zinc-700">T</span>
              <span className="text-torch-300">0.84S</span>
            </span>
          </div>
        </div>

        {/* answer — always rendered with reserved min-height, opacity controlled */}
        <div
          className="mono border-t border-white/5 px-5 py-5 text-[13px] leading-relaxed tracking-[0.01em] text-zinc-200 transition-opacity duration-400 md:px-7 md:text-[13.5px]"
          style={{
            opacity: phase === "streaming" || phase === "done" ? 1 : 0,
          }}
        >
          <div className="mono mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            <span className="h-px w-6 bg-torch-500" />
            ANSWER
          </div>
          <div className="min-h-[180px]">
            {rendered}
            {phase === "streaming" && <span className="cursor-bar" />}
          </div>
        </div>
      </div>

      {/* citations strip — always rendered to reserve layout */}
      <motion.div
        initial={false}
        animate={{
          opacity: phase === "done" || phase === "streaming" ? 1 : 0,
        }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3"
      >
        {demo.citations.map((c) => (
          <a
            key={c.n}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-md border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-torch-500/30 hover:bg-white/[0.04]"
          >
            <div className="mono mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="grid h-4 min-w-[16px] place-items-center rounded-[3px] border border-torch-500/40 bg-torch-500/10 px-1 text-torch-300">
                  {c.n}
                </span>
                <span>{c.kind}</span>
              </span>
              <span className="text-zinc-600">{c.score.toFixed(2)}</span>
            </div>
            <div className="text-[12.5px] leading-snug text-zinc-300 transition-colors group-hover:text-zinc-100 line-clamp-2">
              {c.title}
            </div>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
