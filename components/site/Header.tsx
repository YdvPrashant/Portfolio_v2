"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { person } from "@/lib/content";
import { pageTop, subscribe } from "@/lib/scroll";

/* The header takes its colour from whichever section is under it, tucks away
   while you scroll down and comes back the moment you scroll up. On the home
   page the wordmark stays hidden while the hero is on screen, because the hero
   already is the name. */

export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let sections: { top: number; bottom: number; theme: string }[] = [];
    let heroEnd = 0;
    let lastY = window.scrollY;
    let theme = "";
    let hidden = false;
    let mark = "";
    let scrolled = false;

    return subscribe({
      measure() {
        sections = [...document.querySelectorAll<HTMLElement>("[data-theme]")]
          .filter((el) => el !== document.documentElement)
          .map((el) => {
            const top = pageTop(el);
            return { top, bottom: top + el.offsetHeight, theme: el.dataset.theme ?? "paper" };
          });
        const hero = document.getElementById("hero");
        heroEnd = hero ? pageTop(hero) + hero.offsetHeight * 0.72 : 0;
      },
      update(y) {
        const probe = y + 28;
        // Sections can nest, so the last one that contains the probe wins.
        let next = "paper";
        for (const s of sections) if (probe >= s.top && probe < s.bottom) next = s.theme;
        if (next !== theme) {
          theme = next;
          header.dataset.on = next;
        }

        const dy = y - lastY;
        lastY = y;
        const hide = y > 160 && dy > 0 ? true : dy < 0 || y <= 160 ? false : hidden;
        if (hide !== hidden) {
          hidden = hide;
          header.dataset.hidden = String(hide);
        }

        // Once the page has moved, the header takes the ground of the section
        // under it, so text scrolling beneath never collides with the links.
        const moved = y > 8;
        if (moved !== scrolled) {
          scrolled = moved;
          header.dataset.scrolled = String(moved);
        }

        const show = home ? (y > heroEnd ? "show" : "hide") : "show";
        if (show !== mark) {
          mark = show;
          header.dataset.mark = show;
        }
      },
    });
  }, [home, pathname]);

  const work = home ? "#work" : "/#work";
  // The photograph field has no footer, so Contact goes home for it.
  const contact = pathname === "/photography" ? "/#contact" : "#contact";

  return (
    <header
      ref={ref}
      data-on="paper"
      data-hidden="false"
      data-mark={home ? "hide" : "show"}
      style={{ viewTransitionName: "site-header" }}
      className="site-header fixed inset-x-0 top-0 z-50 flex h-[var(--header)] items-center justify-between px-pad"
    >
      <a
        href="#main"
        className="sr-only-focusable t-small absolute left-2 top-2 bg-paper px-3 py-2 text-ink"
      >
        Skip to content
      </a>

      <Link
        href="/"
        transitionTypes={home ? undefined : ["nav-back"]}
        className="wordmark hit text-[15px] font-[620] tracking-[-0.02em]"
        aria-label={`${person.name}, home`}
      >
        {person.name}
      </Link>

      <nav aria-label="Main">
        <ul className="flex items-center gap-[clamp(14px,2.2vw,32px)] text-[13px] font-[520] tracking-[-0.005em] sm:text-[14px]">
          <li>
            <Link href={work} className="hit link-line">
              Work
            </Link>
          </li>
          <li>
            <Link
              href="/photography"
              transitionTypes={["nav-forward"]}
              aria-current={pathname === "/photography" ? "page" : undefined}
              className="hit link-line aria-[current=page]:bg-[length:100%_1px]"
            >
              <span className="hidden min-[480px]:inline">Photography</span>
              <span className="min-[480px]:hidden">Photos</span>
            </Link>
          </li>
          <li>
            <a href={person.cv.href} target="_blank" rel="noopener" className="hit link-line">
              CV
            </a>
          </li>
          <li>
            <Link href={contact} className="hit link-line">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
