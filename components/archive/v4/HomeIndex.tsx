import Link from "next/link";
import Arrow from "@/components/Arrow";
import SectionTitle from "@/components/SectionTitle";
import LivingType from "@/components/type/LivingType";
import { person } from "@/lib/content";
import { SECTIONS } from "@/lib/sections";

/* Home. It used to be only the name, with the way into the site a row of tiny
   links in a corner, which is why people said there was no home page. Now it
   does the three things a home page is for: who (the living name), what (one
   line), and where to go (an index of the six sections, which is also the order
   the Next links walk).

   The name keeps its behaviour from the landing it replaces. The coloured
   blocks behind it retired with the neon palette; that version is at
   /archive/v3.

   Each section's name in the index shares a view transition name with the
   heading on its page, so following a link carries the word across. */

export default function Home({ notes }: { notes: Record<string, string> }) {
  return (
    <main className="flex min-h-dvh flex-col justify-between gap-[7vh] px-[4vw] pb-[5vh] pt-[6vh] sm:px-[5vw]">
      <h1 className="sr-only">{person.full}</h1>

      {/* Sized to the longer line, PRASHANT, which wants about 5.4em against a
          90vw measure, and held under a quarter of the window's height so the
          index below it still fits on a laptop screen without scrolling. */}
      <LivingType
        lines={["PRASHANT", "YADAV"]}
        className="font-display text-[clamp(2.8rem,min(16.4vw,26dvh),15rem)] leading-[0.86]"
      />

      <div className="grid gap-y-9 lg:grid-cols-12 lg:items-end lg:gap-x-[2vw]">
        <p className="max-w-[34ch] text-[clamp(1rem,1.2vw,1.18rem)] leading-[1.5] lg:col-span-4 lg:pb-4">
          {person.role}. Based in {person.location.split(",")[0]}.
        </p>

        <nav aria-label="Sections" className="lg:col-span-8">
          <ol className="grid sm:grid-flow-col sm:grid-rows-3 sm:gap-x-[3vw]">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  transitionTypes={["nav-forward"]}
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-2 border-t border-rule py-3 sm:py-4"
                >
                  <span className="self-start pt-1 font-mono text-[11px] tabular-nums text-muted">{s.n}</span>
                  <span className="min-w-0">
                    <SectionTitle slug={s.slug}>
                      <span className="block w-fit font-display text-[clamp(1.5rem,2.5vw,2.3rem)] font-black uppercase leading-none tracking-[-0.035em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent">
                        {s.label}
                      </span>
                    </SectionTitle>
                    <span className="mt-2 block truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                      {notes[s.slug]}
                    </span>
                  </span>
                  <Arrow className="size-5 -translate-x-2 text-accent opacity-0 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </main>
  );
}
