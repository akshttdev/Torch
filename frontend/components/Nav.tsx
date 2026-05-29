import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#architecture", label: "Pipeline" },
  { href: "/#impact", label: "Eval" },
  { href: "/#docs", label: "Docs" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 w-full">
      <nav className="mx-auto grid w-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-6 py-6 md:px-12 lg:px-16">
        {/* left — brand */}
        <Link
          href="/"
          className="justify-self-start font-serif text-[22px] leading-none text-zinc-100"
        >
          Torch
        </Link>

        {/* center */}
        <div className="hidden items-center gap-8 justify-self-center md:flex">
          {links.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-[13px] text-zinc-300 transition-colors hover:text-white"
            >
              {it.label}
            </Link>
          ))}
        </div>

        {/* right */}
        <div className="justify-self-end flex items-center gap-3">
          <a
            href="https://github.com/akshttdev/Torch"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 w-9 items-center justify-center text-zinc-300 transition-colors hover:text-white md:inline-flex"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.7 7.7 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.08-1.87 3.76-3.66 3.96.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
