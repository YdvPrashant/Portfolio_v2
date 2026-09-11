import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SkillWall from "@/components/skills/SkillWall";
import TypingTest from "@/components/skills/TypingTest";
import { disciplines } from "@/lib/skills";
import { person } from "@/lib/content";

/* Skills. Blue is this page's colour, deepened from the landing block the same
   way About deepened its violet: white on the landing's `#2F6BFF` only just
   clears 4.5 to 1, and this page has small mono labels on it.

   Two halves, and they are not the same kind of thing. The technical skills are
   a logo table on the blue. Photography and graphic design are not tools and do
   not get logos, so they close the page as two full colour panels that open
   their galleries.

   Nothing here is a card grid.

   A radial mind map was tried instead and rejected; it is kept at
   /archive/mindmap. */

const BLUE = "#2a5ef0";
const ACID = "#e9ff3d";
const BONE = "#f4f1e9";
const INK = "#0b0b0b";
const PAPER = "#ffffff";

export const metadata: Metadata = {
  title: "Skills / " + person.full,
  description: "The tools Prashant Yadav builds with, and the two things he makes that are not code.",
};

const PANELS = [ACID, BONE];

export default function SkillsPage() {
  return (
    <main>
      <h1 className="sr-only">Skills</h1>

      <section
        style={{ background: BLUE, color: PAPER }}
        className="flex min-h-dvh w-full flex-col overflow-hidden"
      >
        <SiteNav tone={PAPER} />
        <SkillWall />
      </section>

      {/* Near black between the blue table and the acid and bone panels: a
          third ground, and the one that suits a thing you type into. */}
      <TypingTest />

      <section className="flex w-full flex-col lg:flex-row">
        {disciplines.map((d, i) => (
          <Link
            key={d.href}
            href={d.href}
            style={{ background: PANELS[i], color: INK }}
            className="group flex min-h-[44vh] flex-1 flex-col justify-between gap-6 px-[5.5vw] py-[7vh] lg:px-[4vw]"
          >
            <span className="block font-[family-name:var(--font-archivo)] text-[clamp(2rem,5.4vw,4.4rem)] font-black uppercase leading-[0.9] tracking-[-0.035em] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
              {d.name}
            </span>
            <span className="flex items-baseline justify-between gap-6 border-t pt-5 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ borderColor: INK }}>
              <span className="max-w-[32ch] normal-case tracking-normal opacity-70">{d.note}</span>
              <span className="shrink-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                Gallery
              </span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
