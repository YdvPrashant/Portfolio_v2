import Image from "next/image";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import SectionTitle from "@/components/SectionTitle";
import type { Photo } from "@/lib/unsplash";

/* Work as a contact sheet. One of two directions on trial (app/work/page.tsx).

   The hub it replaces was two half screen panels: photographs cut into strips
   and darkened behind one, and nothing at all in the other, which made the page
   feel unfinished. Here the photographs are shown as themselves, a justified row
   at full brightness under a large title, like a proof sheet for the gallery.
   Graphic design, still being put together, takes one honest row instead of
   half the screen.

   The row justifies the way the gallery's mosaic does: each photograph grows by
   its aspect ratio from a zero basis, so the heights match and the row fills the
   measure. Scaled by a constant so every grow factor stays above one. */

const ROW = 5;
const GROW = 4;

export default function WorkSheet({ photos }: { photos: Photo[] }) {
  const row = photos.slice(0, ROW);

  return (
    <>
      <section className="px-[5.5vw]">
        <Link href="/work/photography" transitionTypes={["nav-forward"]} className="group block border-t border-rule pt-5">
          <span className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <SectionTitle slug="photography">
              <span className="block font-display text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em] transition-colors duration-500 group-hover:text-accent">
                Photography
              </span>
            </SectionTitle>
            <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {photos.length > 0 ? `${photos.length} photographs, live from Unsplash` : "Photographs"}
              <Arrow className="size-4 text-ink transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-accent" />
            </span>
          </span>

          {row.length > 0 ? (
            <span className="mt-6 flex h-[clamp(200px,46vh,500px)] gap-[0.8vw]">
              {row.map((p, i) => (
                <span
                  key={p.id}
                  className={"relative block h-full overflow-hidden " + (i >= 2 ? "hidden sm:block" : "")}
                  style={{ flex: `${(p.width / p.height) * GROW} 1 0%`, background: p.color }}
                >
                  <Image
                    src={p.url}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 24vw"
                    loading={i < 3 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </span>
              ))}
            </span>
          ) : null}
        </Link>
      </section>

      <section className="mt-[12vh] px-[5.5vw]">
        <Link
          href="/work/design"
          transitionTypes={["nav-forward"]}
          className="group grid items-baseline gap-x-[4vw] gap-y-3 border-y border-rule py-7 lg:grid-cols-12"
        >
          <SectionTitle slug="design">
            <span className="block font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] transition-colors duration-500 group-hover:text-accent lg:col-span-5">
              Graphic design
            </span>
          </SectionTitle>
          <span className="text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.5] text-muted lg:col-span-5">
            Posters, type and composition, mostly in Photoshop.
          </span>
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] lg:col-span-2 lg:justify-end">
            Being put together
            <Arrow className="size-4 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-accent" />
          </span>
        </Link>
      </section>
    </>
  );
}
