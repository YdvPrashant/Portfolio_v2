import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { getPhotos } from "@/lib/unsplash";
import { person } from "@/lib/content";

/* The Work hub. Two halves, but the photography half shows actual photographs
   rather than a second pair of buttons, because Skills already carries the
   button version and repeating it here would make this page redundant. */

const INK = "#0b0b0b";
const BONE = "#f4f1e9";
const ACID = "#e9ff3d";

export const metadata: Metadata = {
  title: "Work / " + person.full,
  description: "Photography and graphic design by Prashant Yadav.",
};

export default async function WorkPage() {
  const photos = (await getPhotos(12)).slice(0, 6);

  return (
    <main style={{ background: INK, color: BONE }} className="flex min-h-dvh w-full flex-col">
      <SiteNav tone={BONE} />

      <h1 className="sr-only">Work</h1>

      <div className="flex flex-1 flex-col lg:flex-row">
        <Link
          href="/work/photography"
          className="group relative flex min-h-[52vh] flex-1 flex-col justify-between overflow-hidden px-[4vw] py-[7vh]"
        >
          <div aria-hidden className="absolute inset-0 flex gap-[2px] opacity-40 transition-opacity duration-700 group-hover:opacity-65">
            {/* Six strips across a phone are 60px wide each and read as dark
                stripes rather than as photographs, so half of them stand down
                until there is width for them. */}
            {photos.map((p, i) => (
              <div
                key={p.id}
                className={"relative h-full flex-1 " + (i >= 3 ? "hidden sm:block" : "")}
                style={{ background: p.color }}
              >
                <Image src={p.url} alt="" fill sizes="(max-width: 640px) 34vw, 20vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,11,11,0.75), rgba(11,11,11,0.45) 45%, rgba(11,11,11,0.85))" }} />

          <span className="relative font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: ACID }}>
            {photos.length > 0 ? "Live from Unsplash" : "Photographs"}
          </span>
          <span className="relative block font-[family-name:var(--font-archivo)] text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
            Photography
          </span>
        </Link>

        <Link
          href="/work/design"
          style={{ background: BONE, color: INK }}
          className="group flex min-h-[52vh] flex-1 flex-col justify-between px-[4vw] py-[7vh]"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">Being put together</span>
          <span className="block font-[family-name:var(--font-archivo)] text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
            Graphic
            <br />
            design
          </span>
        </Link>
      </div>
    </main>
  );
}
