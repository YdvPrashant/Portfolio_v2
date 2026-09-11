import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Gallery from "@/components/work/Gallery";
import { getPhotos, intoRows, UNSPLASH_PROFILE } from "@/lib/unsplash";
import { person } from "@/lib/content";

/* Photography. Near black, because a gallery ground has one job and it is to
   get out of the way of the pictures. Acid stays as the only accent so the page
   still belongs to the site.

   Two layouts, switched by the viewer: justified rows and a centred reel. Both
   live in components/work/Gallery.tsx, which owns that choice and is the only
   client JavaScript on the page. Everything else here, including the Unsplash
   fetch and the row division, stays on the server. */

const INK = "#0b0b0b";
const BONE = "#f4f1e9";
const ACID = "#e9ff3d";

export const metadata: Metadata = {
  title: "Photography / " + person.full,
  description: "Photographs by Prashant Yadav.",
};

export default async function PhotographyPage() {
  const photos = await getPhotos(30);
  const rows = intoRows(photos);

  return (
    <main style={{ background: INK, color: BONE }} className="min-h-dvh w-full">
      <SiteNav tone={BONE} />

      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 px-[3vw] pb-[5vh] pt-[6vh]">
        <h1 className="font-[family-name:var(--font-archivo)] text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
          Photography
        </h1>
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="opacity-55">{photos.length} photographs</span>
          <a href={UNSPLASH_PROFILE} target="_blank" rel="noreferrer" style={{ color: ACID }}>
            On Unsplash
          </a>
        </div>
      </header>

      {photos.length === 0 ? (
        <p className="px-[3vw] pb-[12vh] font-mono text-[12px] uppercase tracking-[0.18em] opacity-55">
          The Unsplash feed could not be reached. Check UNSPLASH_ACCESS_KEY in .env.local.
        </p>
      ) : (
        <Gallery rows={rows} />
      )}

      <footer className="px-[3vw] pb-[7vh]">
        <Link
          href="/work"
          className="group inline-flex items-baseline gap-4 border-t pt-5 font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ borderColor: "rgba(244,241,233,0.25)" }}
        >
          <span className="opacity-50">Back</span>
          <span className="font-[family-name:var(--font-archivo)] text-[clamp(1.3rem,2.6vw,2rem)] font-black uppercase tracking-[-0.03em] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2">
            Work
          </span>
        </Link>
      </footer>
    </main>
  );
}
