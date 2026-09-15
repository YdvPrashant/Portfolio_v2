"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/content";

/* One nav for every page. `tone` is the ink colour, since each page sets its
   own ground. Clicks stop propagating because the landing treats a click on its
   own field as a recompose.

   The wordmark on the left is the way home. There was no route back to the
   landing from anywhere before this, which is the one link a nav must have. */
export default function SiteNav({ tone = "#0b0b0b" }: { tone?: string }) {
  const pathname = usePathname();
  const home = pathname === "/";
  // Only dim the others once one of them is actually the page you are on. On
  // the landing nothing in the list is current, so nothing should look off.
  const anyCurrent = home || nav.some((item) => item.href === pathname);

  /* The padding is a finger, not a look: set at 9.5px these links are about
     twelve pixels tall, and a thumb wants forty. The negative margin gives the
     tap area back to the layout so the nav still sits where it is drawn. Kept
     at every width rather than below sm, because a tablet is a touchscreen at
     768px and a wider hit area costs a mouse nothing. */
  const dim = (active: boolean) =>
    "-my-3 py-3 transition-opacity duration-200 hover:opacity-100 " +
    (anyCurrent && !active ? "opacity-45" : "opacity-100");

  return (
    <nav
      /* Six links plus the wordmark do not fit a phone at desktop size: they
         wrapped onto a second line and, on the pages where the nav floats over
         the content, landed on top of it. Set smaller and tighter below sm they
         stay on one line down to about 360px, which is the narrowest phone
         still worth designing for. The wrap is left in as the fallback rather
         than a menu button: six links are not enough to hide behind one. */
      className="relative z-10 flex items-baseline justify-between gap-x-3 gap-y-2 px-[5.5vw] pt-7 font-mono text-[9.5px] uppercase tracking-[0.07em] sm:gap-x-6 sm:pt-10 sm:text-[11px] sm:tracking-[0.18em]"
      style={{ color: tone }}
    >
      <Link
        href="/"
        onClick={(e) => e.stopPropagation()}
        aria-current={home ? "page" : undefined}
        aria-label="Home"
        className={
          "shrink-0 font-[family-name:var(--font-archivo)] text-[13px] font-black tracking-[-0.02em] sm:text-[15px] " +
          dim(home)
        }
      >
        PY
      </Link>

      <div className="flex flex-wrap justify-end gap-x-3 gap-y-2 sm:gap-x-6">
        {nav.map((item) => {
          const here = item.href === pathname;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => e.stopPropagation()}
              aria-current={here ? "page" : undefined}
              className={dim(here)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
