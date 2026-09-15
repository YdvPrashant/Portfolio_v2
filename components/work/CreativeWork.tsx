import Link from "next/link";
import Arrow from "@/components/Arrow";
import SectionTitle from "@/components/SectionTitle";
import PhotoStrips from "@/components/work/PhotoStrips";
import type { Photo } from "@/lib/unsplash";

/* Creative work: two panels, one for each thing he makes that is not code.

   Photography shows real photographs behind its name, so the way in shows what
   is inside. Graphic design says plainly that it is being put together.

   This is the arrangement the page started with, restored on 2026-09-16 at his
   request after four attempts to better it: a contact sheet, a cover that leafed
   through photographs as the pointer crossed it, the two disciplines as words
   cut out of photographs, and two stacks of prints that fanned out. All four are
   at /archive/v5. */

export default function CreativeWork({ photos }: { photos: Photo[] }) {
  const strips = photos.slice(0, 6);

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <Link
        href="/work/photography"
        transitionTypes={["nav-forward"]}
        data-tone="deep"
        className="group relative isolate flex min-h-[56vh] flex-col justify-between gap-8 overflow-hidden bg-ground px-[5.5vw] py-[6vh] text-ink lg:px-[4vw]"
      >
        {strips.length > 0 ? <PhotoStrips photos={strips} eager /> : null}

        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          {photos.length > 0 ? `Live from Unsplash, ${photos.length} photographs` : "Photographs"}
        </span>

        <span className="flex items-end justify-between gap-6">
          <SectionTitle slug="photography">
            <span className="block font-display text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-accent">
              Photography
            </span>
          </SectionTitle>
          <Arrow className="size-[clamp(1.6rem,3vw,2.6rem)] shrink-0 transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent" />
        </span>
      </Link>

      <Link
        href="/work/design"
        transitionTypes={["nav-forward"]}
        className="group flex min-h-[56vh] flex-col justify-between gap-8 bg-raised px-[5.5vw] py-[6vh] lg:px-[4vw]"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Being put together</span>

        <span className="flex items-end justify-between gap-6">
          <SectionTitle slug="design">
            <span className="block font-display text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-accent">
              Graphic
              <br />
              design
            </span>
          </SectionTitle>
          <Arrow className="size-[clamp(1.6rem,3vw,2.6rem)] shrink-0 transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent" />
        </span>
      </Link>
    </div>
  );
}
