import type { Metadata } from "next";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import NextLink from "@/components/NextLink";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import SkillWall from "@/components/skills/SkillWall";
import TypingTest from "@/components/skills/TypingTest";
import PhotoStrips from "@/components/work/PhotoStrips";
import { person } from "@/lib/content";
import { disciplines } from "@/lib/skills";
import { getPhotos } from "@/lib/unsplash";

/* Skills. Three bands, and they are not the same kind of thing.

   1. The technical skills, as a logo table (components/skills/SkillWall.tsx).
      It fills the first screen, so it ends with a cue that there is more.
   2. The typing race, on the deep tone: the ground that suits a thing you type
      into.
   3. Photography and graphic design, which are not tools and do not get logos.
      They close the page as two panels into their galleries. The photography
      one shows real photographs, so the way in shows what is inside.

   Nothing here is a card grid. A radial mind map was tried instead and
   rejected; it is kept at /archive/mindmap. data-page lets a theme give the page
   its own ground: in Vivid, the original blue. */

export const metadata: Metadata = {
  title: "Skills / " + person.full,
  description: "The tools Prashant Yadav builds with, and the two things he makes that are not code.",
};

export default async function SkillsPage() {
  const photos = (await getPhotos(12)).slice(0, 6);

  return (
    <PageTransition>
      <main data-page="skills" className="bg-ground text-ink">
        <h1 className="sr-only">Skills</h1>

        <section className="flex min-h-dvh w-full flex-col pt-(--nav-h)">
          <SkillWall />
        </section>

        <TypingTest />

        <section className="grid w-full lg:grid-cols-2">
          {disciplines.map((d, i) => {
            const slug = d.href.split("/").pop() ?? d.href;
            const photographs = i === 0;
            return (
              <Link
                key={d.href}
                href={d.href}
                transitionTypes={["nav-forward"]}
                data-tone={photographs ? "deep" : undefined}
                className={
                  "group relative isolate flex min-h-[46vh] flex-col justify-between gap-8 overflow-hidden px-[5.5vw] py-[7vh] text-ink lg:px-[4vw] " +
                  (photographs ? "bg-ground" : "bg-raised")
                }
              >
                {photographs && photos.length > 0 ? <PhotoStrips photos={photos} /> : null}

                <span className="max-w-[36ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted">
                  {d.note}
                </span>

                <span className="flex items-end justify-between gap-6">
                  <SectionTitle slug={slug}>
                    <span className="block font-display text-[clamp(2rem,5.4vw,4.4rem)] font-black uppercase leading-[0.9] tracking-[-0.035em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-accent">
                      {d.name}
                    </span>
                  </SectionTitle>
                  <Arrow className="size-[clamp(1.6rem,3vw,2.6rem)] shrink-0 transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent" />
                </span>
              </Link>
            );
          })}
        </section>

        <NextLink from="/skills" />
      </main>
    </PageTransition>
  );
}
