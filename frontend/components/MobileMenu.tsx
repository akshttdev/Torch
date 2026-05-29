"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/#features", label: "FEATURES", hint: "01" },
  { href: "/#impact", label: "EVAL", hint: "02" },
  { href: "/#architecture", label: "PIPELINE", hint: "03" },
  { href: "/#docs", label: "DOCS", hint: "04" },
  { href: "/#faq", label: "FAQ", hint: "05" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* burger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="justify-self-end inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] text-zinc-200 transition-colors hover:bg-white/[0.08] md:hidden"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink-0/95 backdrop-blur-md md:hidden"
          >
            {/* top bar mirrors the nav */}
            <div className="flex items-center justify-between px-6 py-5">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-[18px] font-semibold uppercase tracking-[0.04em] text-zinc-100"
              >
                TORCH<span className="text-torch-500">.</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] text-zinc-200 transition-colors hover:bg-white/[0.08]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* link stack */}
            <nav className="flex flex-1 flex-col items-stretch justify-center gap-1 px-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.05,
                    duration: 0.32,
                    ease: [0.22, 0.65, 0.4, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-end justify-between border-b border-white/8 py-5 transition-colors hover:text-torch-100"
                  >
                    <span className="text-[clamp(2rem,9vw,3.2rem)] font-medium uppercase leading-none tracking-[-0.015em] text-zinc-100 group-hover:text-zinc-50">
                      {link.label}
                    </span>
                    <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-zinc-600 tabular">
                      /{link.hint}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* bottom CTA + github */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.32 }}
              className="border-t border-white/8 px-6 py-6"
            >
              <Link
                href="/dashboard/ask"
                onClick={() => setOpen(false)}
                className="mb-3 flex w-full items-center justify-between rounded-md bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black"
              >
                <span>GET STARTED</span>
                <span className="mono text-[10px] tracking-[0.22em] text-black/60">
                  /DASHBOARD
                </span>
              </Link>
              <a
                href="https://github.com/akshttdev/Torch"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md border border-white/12 bg-white/[0.04] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/[0.08]"
              >
                <span className="inline-flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.7 7.7 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.08-1.87 3.76-3.66 3.96.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  GITHUB
                </span>
                <span className="mono text-[10px] tracking-[0.22em] text-zinc-500">
                  REPO
                </span>
              </a>
              <div className="mono mt-4 text-center text-[9.5px] uppercase tracking-[0.24em] text-zinc-600">
                BUILT BY <span className="text-torch-400">AKSHAT</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
