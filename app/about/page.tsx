import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import FlowField from "@/components/about/FlowField";
import { about, person } from "@/lib/content";

/* About. Two bands, each using the whole width.

   1. The flow field. The lead sits left and the fact column fills the right,
      and the current steers around both of them. An earlier draft had this
      screen as flat violet with one sentence on it, which read as bland.
   2. Bone. The prose runs in two newspaper columns rather than one narrow
      measure stranded in a very large empty margin, which was the other thing
      wrong with the draft before this one.

   There was a third band between them carrying two scrolling marquees of tool
   names. It went: a moving list of technologies on the About page reads as the
   Skills page leaking in, and the motion belongs to the field now, where the
   pointer drives it rather than a timer. */

// The opening ground is a deeper violet than the landing block it descends
// from, because additive ink needs headroom to glow into.
const FIELD = "#2e0c7a";
const BONE = "#f4f1e9";
const INK = "#0b0b0b";
const PAPER = "#ffffff";

export const metadata: Metadata = {
  title: "About / " + person.full,
  description: person.role + ".",
};

export default function AboutPage() {
  return (
    <main style={{ background: BONE, color: INK }}>
      <h1 className="sr-only">About {person.full}</h1>

      <section
        style={{ background: FIELD, color: PAPER }}
        className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden"
      >
        <FlowField />
        <SiteNav tone={PAPER} />

        <div className="relative flex flex-1 items-center px-[5.5vw] py-[7vh]">
          <div className="flex w-full flex-col gap-[7vh] lg:flex-row lg:items-start lg:gap-[6vw]">
            <p
              data-flow-obstacle
              className="flex-1 font-[family-name:var(--font-instrument)] text-[clamp(2rem,4.6vw,4.1rem)] leading-[1.08] tracking-[-0.01em]">
              {about.lead}
            </p>

            <dl data-flow-obstacle className="w-full shrink-0 lg:w-[31%]">
              {about.facts.map((f) => (
                <div
                  key={f.label}
                  className="border-t py-5 first:pt-0 first:border-t-0 lg:first:border-t lg:first:pt-5"
                  style={{ borderColor: "rgba(255,255,255,0.28)" }}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{f.label}</dt>
                  <dd className="mt-2 text-[clamp(0.95rem,1.05vw,1.06rem)] leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="w-full px-[5.5vw] py-[13vh]">
        <div className="lg:columns-2 lg:gap-[5vw]">
          {about.body.map((para) => (
            <p
              key={para.slice(0, 24)}
              className="mb-7 break-inside-avoid text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.62] last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
