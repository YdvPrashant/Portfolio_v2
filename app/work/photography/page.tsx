import type { Metadata } from "next";
import BackLink from "@/components/BackLink";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import Gallery from "@/components/work/Gallery";
import { person } from "@/lib/content";
import { getPhotos, intoRows, UNSPLASH_PROFILE } from "@/lib/unsplash";

/* Photography. On the deep tone, because a gallery ground has one job and it is
   to get out of the way of the pictures. The accent stays as the only colour so
   the page still belongs to the site.

   Two layouts, switched by the viewer: justified rows and a centred reel. Both
   live in components/work/Gallery.tsx, which owns that choice and is the only
   client JavaScript here besides the back links. Everything else, including the
   Unsplash fetch and the row division, stays on the server.

   The gallery is reached from Skills and from Work, so both back links follow
   the visitor's real history (components/BackLink.tsx): one at the top so a long
   page is not a trap, one at the end where people finish. */

export const metadata: Metadata = {
  title: "Photography / " + person.full,
  description: "Photographs by Prashant Yadav.",
};

export default async function PhotographyPage() {
  const photos = await getPhotos(30);
  const rows = intoRows(photos);

  return (
    <PageTransition>
      <main data-tone="deep" className="min-h-dvh w-full bg-ground pt-(--nav-h) text-ink">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 px-[3vw] pb-[5vh] pt-[3vh]">
          <div>
            <BackLink size="small" />
            <SectionTitle slug="photography">
              <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
                Photography
              </h1>
            </SectionTitle>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-muted">{photos.length} photographs</span>
            <a
              href={UNSPLASH_PROFILE}
              target="_blank"
              rel="noreferrer"
              className="-my-3 py-3 text-accent transition-opacity duration-200 hover:opacity-75"
            >
              On Unsplash
            </a>
          </div>
        </header>

        {photos.length === 0 ? (
          <p className="px-[3vw] pb-[12vh] font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
            The Unsplash feed could not be reached. Check UNSPLASH_ACCESS_KEY in .env.local.
          </p>
        ) : (
          <Gallery rows={rows} />
        )}

        <footer className="px-[3vw] pb-[8vh] pt-[2vh]">
          <BackLink />
        </footer>
      </main>
    </PageTransition>
  );
}
