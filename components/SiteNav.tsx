"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemePicker from "@/components/ThemePicker";
import { SECTIONS, currentSection, directionTo, pageFor, toneFor } from "@/lib/sections";

/* One nav for every page, mounted once in the root layout so it survives
   navigation and holds still while pages change underneath it. The colour theme
   picker lives at its end.

   Fixed rather than in the flow, because on a long page it used to be hundreds
   of pixels behind you. Scrolling down tucks it away and any scroll back up
   brings it straight back. Once the page has moved it takes the ground behind
   it, or the type would run through it. It carries the page's tone and page key,
   so in a theme where a page has its own ground the nav matches it.

   It shows on Home as well, where the landing's blocks keep clear of its
   corner. The archive keeps the navs it was built with.

   The padding on the links is for a finger, not a look: at 9.5px they are
   about twelve pixels tall and a thumb wants forty. The negative margin hands
   the space back so the row sits where it is drawn. */

const TUCK_AFTER = 120;

type Scroll = { path: string; hidden: boolean; lifted: boolean };

export default function SiteNav() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState<Scroll>({ path: "", hidden: false, lifted: false });

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // A trackpad settling moves a pixel or two; that is not a direction.
      if (Math.abs(y - last) < 4) return;
      const down = y > last;
      last = y;
      setScroll((prev) => {
        const next = { path: window.location.pathname, hidden: down && y > TUCK_AFTER, lifted: y > 8 };
        return prev.path === next.path && prev.hidden === next.hidden && prev.lifted === next.lifted ? prev : next;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/archive")) return null;

  /* Scroll state belongs to the page it was recorded on, so a page you have
     just arrived at always starts with the nav showing. */
  const here = scroll.path === pathname;
  const hidden = here && scroll.hidden;
  const lifted = here && scroll.lifted;
  const section = currentSection(pathname);

  return (
    <header
      data-tone={toneFor(pathname)}
      data-page={pageFor(pathname) ?? undefined}
      style={{ viewTransitionName: "site-nav" }}
      className={
        "fixed inset-x-0 top-0 z-50 border-b transition-[translate,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
        (hidden ? "-translate-y-full " : "translate-y-0 ") +
        (lifted ? "border-rule bg-ground" : "border-transparent bg-transparent")
      }
    >
      {/* Seven links, the wordmark and the colour swatch have to hold one line
          down to 360px, so below sm the gaps and the tracking are tighter. */}
      <nav className="flex h-(--nav-h) items-center justify-between gap-x-2 px-[5.5vw] font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink sm:gap-x-6 sm:text-[11px] sm:tracking-[0.18em]">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-label="Home"
          aria-current={pathname === "/" ? "page" : undefined}
          className="-my-3 shrink-0 py-3 font-display text-[13px] font-black tracking-[-0.02em] sm:text-[15px]"
        >
          PY
        </Link>

        <div className="flex items-center gap-x-2 sm:gap-x-8">
          <div className="flex flex-wrap justify-end gap-x-2 gap-y-2 sm:gap-x-6">
            {SECTIONS.map((s) => {
              // A gallery is part of Work, so Work stays marked inside one.
              const active = section?.href === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  transitionTypes={[directionTo(pathname, s.href)]}
                  aria-current={pathname === s.href ? "page" : active ? "true" : undefined}
                  className={
                    "-my-3 py-3 underline-offset-[6px] transition-colors duration-200 hover:text-ink " +
                    (active ? "text-ink underline decoration-accent decoration-1" : "text-muted")
                  }
                >
                  {s.short ?? s.label}
                </Link>
              );
            })}
          </div>

          <ThemePicker />
        </div>
      </nav>
    </header>
  );
}
