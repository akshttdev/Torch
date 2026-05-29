"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      lerp: 0.1,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Intercept anchor clicks so /#demo etc. glide through Lenis instead of jumping
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // left click only
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // accept "#section" and "/#section" and "/path#section" (same path)
      let hash = "";
      if (href.startsWith("#")) {
        hash = href.slice(1);
      } else if (href.includes("#")) {
        const [path, h] = href.split("#");
        // only intercept if same pathname (or root)
        const samePath =
          path === "" ||
          path === "/" ||
          path === window.location.pathname ||
          path === window.location.pathname.replace(/\/$/, "");
        if (!samePath) return;
        hash = h;
      } else {
        return;
      }

      if (!hash) return;
      const dest = document.getElementById(hash);
      if (!dest) return;

      e.preventDefault();
      lenis.scrollTo(dest, {
        duration: 1.4,
        offset: -32,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      // update URL hash without jumping
      if (history.replaceState) {
        history.replaceState(null, "", `#${hash}`);
      }
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
