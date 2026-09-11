import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SortField from "@/components/dsa/SortField";
import { dsa, person } from "@/lib/content";

/* DSA. Deep royal green, the one colour on the site that is not borrowed from
   the landing, with the acid accent doing the connecting.

   The two figures anchor the top and the field runs underneath them, so the
   page is a statement with a working example beneath it rather than a number on
   an empty ground. */

const GROUND = "#053c2b";
const BONE = "#f4f1e9";

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
    <main
      style={{ background: GROUND, color: BONE }}
      className="flex h-dvh w-full flex-col overflow-hidden"
    >
      <h1 className="sr-only">Data structures and algorithms</h1>
      <SiteNav tone={BONE} />

      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 px-[5.5vw] pb-[6vh] pt-[5vh]">
        {FIGURES.map((f, i) => (
          <div key={f.label} className={i === FIGURES.length - 1 ? "text-left sm:text-right" : undefined}>
            <p className="font-[family-name:var(--font-archivo)] text-[clamp(2.6rem,7.4vw,6.4rem)] font-black leading-[0.84] tracking-[-0.05em]">
              {f.value}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">{f.label}</p>
          </div>
        ))}
      </div>

      <SortField />
    </main>
  );
}
