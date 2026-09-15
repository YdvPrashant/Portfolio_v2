import type { Metadata } from "next";
import CreativeWork from "@/components/work/CreativeWork";
import NextLink from "@/components/NextLink";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { person } from "@/lib/content";
import { getPhotos } from "@/lib/unsplash";

/* Creative work: photography and graphic design, the two things he makes that
   are not code. The page is the two words, each cut out of its own material
   (components/work/CreativeWork.tsx).

   Both galleries are also reached from the end of Skills, which is why their
   back links follow the visitor's real history rather than pointing here. The
   fetch asks for the same thirty photographs as the gallery page, so the two
   share one cached response. */

export const metadata: Metadata = {
  title: "Creative work / " + person.full,
  description: "Photography and graphic design by Prashant Yadav.",
};

export default async function WorkPage() {
  const photos = await getPhotos(30);

  return (
    <PageTransition>
      <main data-page="work" className="flex min-h-dvh w-full flex-col bg-ground pt-(--nav-h) text-ink">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2 px-[5.5vw] pb-[3vh] pt-[2.5vh]">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tabular-nums text-muted">05</span>
            <SectionTitle slug="work">
              <h1 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
                Creative work
              </h1>
            </SectionTitle>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Two things I make that are not code
          </p>
        </div>

        <CreativeWork photos={photos} />

        <NextLink from="/work" />
      </main>
    </PageTransition>
  );
}
