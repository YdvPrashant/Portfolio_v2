"use client";

import { useState } from "react";
import { concepts, skillRows } from "@/lib/skills";

/* The technical skills, as logos rather than a list of adjectives.

   Deliberately not a grid of cards. It is a Swiss table: one full width row per
   category, a marginal label, and the logos flowing along a shared baseline
   with a hairline between rows.

   The logos carry no names, so pointing at one writes its name into the display
   line at the top. That line is the only thing on the page that moves, and the
   pointer drives it. It also means the logos can stay monochrome: twenty five
   brand colours at once is the single most templated thing a skills page can
   do, and it would fight the ground besides. */

const PAPER = "#ffffff";
const ACID = "#e9ff3d";

export default function SkillWall() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col px-[5.5vw] pb-[6vh] pt-[5vh]">
      <p
        aria-hidden
        className="mb-[3vh] font-[family-name:var(--font-archivo)] text-[clamp(2.4rem,9vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-colors duration-200"
        style={{ color: active ? ACID : PAPER }}
      >
        {active ?? "Skills"}
      </p>

      <div className="flex flex-1 flex-col justify-between">
        {skillRows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-3 border-t py-[2.2vh] sm:flex-row sm:items-center sm:gap-[4vw]"
            style={{ borderColor: "rgba(255,255,255,0.26)" }}
          >
            <ul className="flex flex-wrap items-center gap-x-[3.6vw] gap-y-4">
              {row.items.map((item) => (
                <li
                  key={item.name}
                  onPointerEnter={() => setActive(item.name)}
                  onPointerLeave={() => setActive(null)}
                  className="group cursor-default"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-[clamp(30px,4vw,60px)] w-[clamp(30px,4vw,60px)] transition-colors duration-200"
                    style={{ fill: active === item.name ? ACID : PAPER }}
                  >
                    <path d={item.path} />
                  </svg>
                  <span className="sr-only">{item.name}</span>
                </li>
              ))}
            </ul>

            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60 sm:ml-auto sm:text-right">
              {row.label}
            </span>
          </div>
        ))}

        {/* The techniques with no logo. Set in type on purpose, so the one row
            that cannot be drawn is not pretending to be. */}
        <div
          className="flex flex-col gap-3 border-t py-[2.2vh] sm:flex-row sm:items-baseline sm:gap-[4vw]"
          style={{ borderColor: "rgba(255,255,255,0.26)" }}
        >
          <p className="flex flex-wrap gap-x-[2.4vw] gap-y-1 text-[clamp(0.95rem,1.4vw,1.3rem)]">
            {concepts.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </p>

          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60 sm:ml-auto sm:text-right">
            Also
          </span>
        </div>
      </div>
    </div>
  );
}
