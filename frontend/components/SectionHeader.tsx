"use client";

import { motion } from "framer-motion";

export function SectionHeader({
  num: _num,
  eyebrow: _eyebrow,
  title,
  meta,
}: {
  num?: string;
  eyebrow?: string;
  title: string;
  meta?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 0.65, 0.4, 1] }}
      className="mb-10 flex flex-wrap items-end justify-between gap-6 pb-2"
    >
      <h2 className="text-[clamp(1.8rem,3.6vw,2.8rem)] font-medium uppercase leading-[1.02] tracking-[-0.01em] text-zinc-50">
        {title}
      </h2>
      {meta && (
        <div className="mono whitespace-pre-line text-right text-[10px] uppercase leading-relaxed tracking-[0.22em] text-zinc-600">
          {meta}
        </div>
      )}
    </motion.div>
  );
}
