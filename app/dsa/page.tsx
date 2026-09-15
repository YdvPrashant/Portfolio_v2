import type { Metadata } from "next";
import NextLink from "@/components/NextLink";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import SortField from "@/components/dsa/SortField";
import { dsa, person } from "@/lib/content";

/* DSA. Deep royal green with the acid bars. When the rest of the site was calmed
   down this page kept its colours on purpose, so it reads as the one room where
   the colour is turned all the way up. data-tone="dsa" pins those values
   whatever the palette.

   The heading row carries the way on to Work, since the field fills the rest of
   the screen and there is no end of page to put it at. The figures anchor the
   top and the field runs underneath them, so the page is a statement with a
   working example beneath it rather than a number on an empty ground. */

export const metadata: Metadata = {
  title: "DSA / " + person.full,
  description:
    dsa.total + " DSA problems solved, " + dsa.solved + " of them on " + dsa.platform + ", contest rating " + dsa.rating + ".",
};

const FIGURES = [
  { value: dsa.total, label: "DSA problems solved overall" },
  { value: dsa.solved, label: "of them on " + dsa.platform },
  { value: dsa.rating, label: "contest rating" },
];

export default function DsaPage() {
  return (
    <PageTransition>
      <main data-tone="dsa" className="flex h-dvh w-full flex-col overflow-hidden bg-ground pt-(--nav-h) text-ink">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-[5.5vw] pt-[2.5vh]">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tabular-nums opacity-60">04</span>
            <SectionTitle slug="dsa">
              <h1 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
                <abbr title="Data structures and algorithms" className="no-underline">
                  DSA
                </abbr>
              </h1>
            </SectionTitle>
          </div>
          <NextLink from="/dsa" compact />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 px-[5.5vw] pb-[6vh] pt-[4vh]">
          {FIGURES.map((f, i) => (
            <div key={f.label} className={i === FIGURES.length - 1 ? "text-left sm:text-right" : undefined}>
              <p className="font-display text-[clamp(2.6rem,7.4vw,6.4rem)] font-black leading-[0.84] tracking-[-0.05em]">
                {f.value}
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">{f.label}</p>
            </div>
          ))}
        </div>

        <SortField />
      </main>
    </PageTransition>
  );
}
