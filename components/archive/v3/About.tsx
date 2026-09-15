import ArchivedNav from "@/components/archive/v3/ArchivedNav";
import FlowField from "@/components/archive/v3/FlowField";
import { person } from "@/lib/content";

/* About as it stood on 2026-09-11: the violet flow field opening, with a swirl
   that followed the cursor, and the bone prose band. The copy is frozen here so
   later edits to lib/content.ts cannot change what the archive shows. */

const FIELD = "#2e0c7a";
const BONE = "#f4f1e9";
const INK = "#0b0b0b";
const PAPER = "#ffffff";

const about = {
  lead: "I'm Prashant, a software engineer in Lucknow. I build web applications and machine learning systems, usually end to end, from the interface down to the model.",
  facts: [
    { label: "Based", value: "Lucknow, Uttar Pradesh, India" },
    {
      label: "Education",
      value: "B.Tech Computer Science Engineering, Lovely Professional University, 2025",
    },
    { label: "LeetCode", value: "300+ problems solved, contest rating above 1600" },
    { label: "Volunteer", value: "Web developer for Aurora, a student organisation, for a year" },
  ],
  body: [
    "Lately that has meant Prism, which takes a news article and pulls it apart into claims, sources and live fact checks, and ctximg, a photo search app that runs completely offline. You describe what you remember about a photo and it finds it, with no tags or filenames involved.",
    "Before those I spent about six months on a conflict detection system for video. It reported 98.4 percent accuracy and I did not believe it. The split was the problem. I had divided the data frame by frame, so almost every clip I was testing on had already been seen in training. I redid the split by source video, dropped the near duplicate frames, and the honest number came out at 0.808 PR-AUC across 519 videos the model had never seen.",
    "Most of my time goes on things nobody notices unless they break. Indexing that survives being interrupted without starting over. Failover to a second model provider when the first one starts rate limiting. A fact check that says it could not verify something instead of guessing.",
    "Outside of code I shoot photographs and do graphic design. Both are on this site.",
  ],
};

export default function About() {
  return (
    <main style={{ background: BONE, color: INK }}>
      <h1 className="sr-only">About {person.full}</h1>

      <section
        style={{ background: FIELD, color: PAPER }}
        className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden"
      >
        <FlowField />
        <ArchivedNav tone={PAPER} />

        <div className="relative flex flex-1 items-center px-[5.5vw] py-[7vh]">
          <div className="flex w-full flex-col gap-[7vh] lg:flex-row lg:items-start lg:gap-[6vw]">
            <p
              data-flow-obstacle
              className="flex-1 font-[family-name:var(--font-instrument)] text-[clamp(2rem,4.6vw,4.1rem)] leading-[1.08] tracking-[-0.01em]"
            >
              {about.lead}
            </p>

            <dl data-flow-obstacle className="w-full shrink-0 lg:w-[31%]">
              {about.facts.map((f) => (
                <div
                  key={f.label}
                  className="border-t py-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5"
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
