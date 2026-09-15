"use client";

import { useState } from "react";
import ScrollCue from "@/components/ScrollCue";
import SectionTitle from "@/components/SectionTitle";
import { concepts, skillRows } from "@/lib/skills";

/* The technical skills, as logos rather than a list of adjectives.

   Deliberately not a grid of cards. It is a Swiss table: one full width row per
   category, a marginal label at the far right, and the logos flowing along a
   shared baseline with a hairline between rows.

   The logos carry no names, so pointing at one writes its name into the display
   line at the top, in the accent. That line is also the page's heading, the
   word the Home index carries across when you arrive. The logos stay in the
   ink colour: twenty five brand colours at once is the single most templated
   thing a skills page can do, and it would fight the ground besides.

   Sized against the window's height as well as its width, so on a laptop the
   whole table and the scroll cue under it fit the first screen. */

export default function SkillWall() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col px-[5.5vw] pb-7 pt-[3vh]">
      <div className="mb-[2.5vh] flex items-start gap-4">
        <span className="pt-[0.8vw] font-mono text-[11px] tabular-nums text-muted">02</span>
        <SectionTitle slug="skills">
          <p
            aria-hidden
            className={
              "font-display text-[clamp(2.4rem,min(9vw,13vh),7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-colors duration-200 " +
              (active ? "text-accent" : "text-ink")
            }
          >
            {active ?? "Skills"}
          </p>
        </SectionTitle>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {skillRows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-3 border-t border-rule py-[1.8vh] sm:flex-row sm:items-center sm:gap-[4vw]"
          >
            <ul className="flex flex-wrap items-center gap-x-[3.6vw] gap-y-4">
              {row.items.map((item) => (
                <li
                  key={item.name}
                  onPointerEnter={() => setActive(item.name)}
                  onPointerLeave={() => setActive(null)}
                  className="cursor-default"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    fill="currentColor"
                    className={
                      "size-[clamp(28px,min(3.8vw,6vh),58px)] transition-colors duration-200 " +
                      (active === item.name ? "text-accent" : "text-ink")
                    }
                  >
                    <path d={item.path} />
                  </svg>
                  <span className="sr-only">{item.name}</span>
                </li>
              ))}
            </ul>

            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:ml-auto sm:text-right">
              {row.label}
            </span>
          </div>
        ))}

        {/* The techniques with no logo. Set in type on purpose, so the one row
            that cannot be drawn is not pretending to be. */}
        <div className="flex flex-col gap-3 border-t border-rule py-[1.8vh] sm:flex-row sm:items-baseline sm:gap-[4vw]">
          <p className="flex flex-wrap gap-x-[2.4vw] gap-y-1 text-[clamp(0.95rem,1.4vw,1.3rem)]">
            {concepts.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </p>

          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:ml-auto sm:text-right">
            Also
          </span>
        </div>
      </div>

      <ScrollCue className="mt-[3vh]" />
    </div>
  );
}
