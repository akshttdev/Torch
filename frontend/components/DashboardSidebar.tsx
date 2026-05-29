"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  soon?: boolean;
};
type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/ask", label: "Ask" },
      { href: "/dashboard/q", label: "History" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/eval", label: "Eval" },
      { href: "/dashboard/sources", label: "Sources" },
      { href: "#", label: "Collections", soon: true },
      { href: "#", label: "Activity", soon: true },
      { href: "#", label: "Settings", soon: true },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-ink-0 md:flex">
      {/* brand block */}
      <div className="px-6 pb-5 pt-7">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-grid h-7 w-7 place-items-center rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0b 0%, #0a0a0b 48%, #ffffff 100%)",
            }}
            aria-hidden
          />
          <span className="font-serif text-[22px] leading-none text-white">
            Torch
          </span>
        </div>
        <div className="mono mt-3 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-zinc-500">
          <span>Dashboard</span>
          <span className="text-zinc-700">·</span>
          <span>v1.0</span>
        </div>
      </div>

      {/* nav sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {sections.map((s) => (
          <div key={s.label} className="mb-6 last:mb-0">
            <div className="mono mb-2 px-3 text-[10px] uppercase tracking-[0.26em] text-zinc-500">
              {s.label}
            </div>
            <ul className="space-y-0.5">
              {s.items.map((it) => {
                const active =
                  !it.soon &&
                  (pathname === it.href ||
                    (it.href !== "/dashboard" && pathname.startsWith(`${it.href}/`)));
                const isSoon = !!it.soon;
                return (
                  <li key={it.label}>
                    {isSoon ? (
                      <div className="relative flex items-center justify-between px-3 py-2 text-[12.5px] uppercase tracking-[0.16em] text-zinc-700">
                        <span>{it.label}</span>
                        <span className="mono inline-flex items-center rounded-md bg-white/[0.04] px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                          Soon
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={it.href}
                        className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-[12.5px] uppercase tracking-[0.16em] transition-colors ${
                          active
                            ? "bg-white/[0.06] text-white"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute -left-px top-1.5 h-5 w-[3px] rounded-r bg-instrument-400"
                            style={{
                              boxShadow:
                                "0 0 12px rgba(91,195,229,0.7)",
                            }}
                          />
                        )}
                        <span>{it.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* user + back to site */}
      <div className="px-3 pb-5">
        <div className="mb-3 flex items-center gap-3 rounded-md px-3 py-2">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white"
            style={{ background: "#3b82f6" }}
            aria-hidden
          >
            U
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white">User</div>
            <div className="mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-500">
              Default workspace
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="mono flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.02] px-3 py-2.5 text-[10.5px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <span>←</span>
          <span>Back to site</span>
        </Link>
      </div>
    </aside>
  );
}

export function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-5 py-3 backdrop-blur md:hidden">
      <Link
        href="/dashboard"
        className="font-serif text-[18px] leading-none text-zinc-900"
      >
        Torch
      </Link>
      <nav className="flex items-center gap-1">
        {[
          { href: "/dashboard", l: "Overview" },
          { href: "/dashboard/ask", l: "Ask" },
          { href: "/dashboard/eval", l: "Eval" },
        ].map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-sm px-2 py-1 text-[12px] text-zinc-600 hover:text-zinc-900"
          >
            {it.l}
          </Link>
        ))}
      </nav>
    </div>
  );
}
