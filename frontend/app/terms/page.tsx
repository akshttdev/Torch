import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Torch" };

const sections = [
  {
    h: "1. What Torch is",
    body: (
      <>
        Torch is an open-source, research-grade interface for grounded
        question-answering over the PyTorch documentation, source tree, and
        public GitHub issues. It is provided as-is, without warranty of any
        kind, and is not affiliated with the PyTorch Foundation or Meta
        Platforms, Inc.
      </>
    ),
  },
  {
    h: "2. License",
    body: (
      <>
        Source code is released under the MIT License. The accompanying
        eval/benchmark data is released under CC BY 4.0. Indexed third-party
        content (pytorch.org docs, pytorch/pytorch repository, GitHub issues,
        forum threads) remains the property of its respective copyright
        holders and is retrieved subject to their terms.
      </>
    ),
  },
  {
    h: "3. No guarantees",
    body: (
      <>
        Torch is a retrieval-augmented assistant. Cited sources are
        machine-selected and the generated answers, while grounded, may
        contain errors, omissions, or outdated information. Do not rely on
        Torch alone for decisions that carry safety, financial, legal, or
        production consequences. Verify each cited link before acting on a
        claim.
      </>
    ),
  },
  {
    h: "4. Rate limits and abuse",
    body: (
      <>
        The hosted instance applies token-bucket rate limiting per IP. Bulk
        scraping, attempts to bypass the rate limiter, or use of the service
        to generate synthetic training data without disclosure are not
        permitted. Operators reserve the right to revoke access without
        notice.
      </>
    ),
  },
  {
    h: "5. Data and telemetry",
    body: (
      <>
        Queries submitted via <code className="mono text-torch-600">/ask</code>{" "}
        are processed in-memory and not retained beyond the response window
        unless explicit feedback is submitted via{" "}
        <code className="mono text-torch-600">/feedback</code>. Eval runs and
        their inputs are logged in <code className="mono text-torch-600">eval/runs/</code>{" "}
        for reproducibility. No personal information is collected.
      </>
    ),
  },
  {
    h: "6. Third-party services",
    body: (
      <>
        Torch depends on Qdrant Cloud (vector storage), Anthropic or Google
        (LLM inference), and GitHub (issue ingestion). Use of these services
        is governed by their respective terms. Operators of self-hosted
        instances are responsible for their own credentials and quotas.
      </>
    ),
  },
  {
    h: "7. Changes",
    body: (
      <>
        These terms may change as the project matures. Material updates will
        be noted in the repository changelog. Continued use of the service
        after such changes constitutes acceptance.
      </>
    ),
  },
  {
    h: "8. Contact",
    body: (
      <>
        Issues, questions, and licensing inquiries can be filed on the project
        repository. There is no commercial support agreement for the
        open-source release.
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="canvas-cream relative w-full overflow-x-hidden">
      <Nav />

      <section className="mx-auto w-full max-w-[860px] px-6 pb-24 pt-32 md:px-10 md:pb-32 md:pt-44">
        <div className="mono mb-4 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
          <span className="text-zinc-400 tabular">v1</span>
          <span className="text-zinc-300">·</span>
          <span>Effective {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>

        <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.04] tracking-[-0.015em] text-zinc-900">
          Terms and conditions<span className="text-torch-500">.</span>
        </h1>
        <p className="mono mt-5 max-w-xl text-[12.5px] leading-relaxed tracking-[0.04em] text-zinc-600">
          The plain-English contract for using Torch — what it is, what it
          isn&apos;t, and what you should verify before trusting an answer.
        </p>

        <div className="mt-14 space-y-12">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-serif text-[clamp(1.3rem,2.3vw,1.8rem)] leading-tight tracking-[-0.005em] text-zinc-900">
                {s.h}
              </h2>
              <p className="mono mt-3 text-[13px] leading-relaxed tracking-[0.04em] text-zinc-700">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-200/70 pt-6">
          <Link
            href="/"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500 hover:text-zinc-900"
          >
            <span>←</span>
            <span>Back to landing</span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
