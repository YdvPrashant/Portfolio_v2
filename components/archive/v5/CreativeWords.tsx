"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Arrow from "@/components/Arrow";
import SectionTitle from "@/components/SectionTitle";
import FitText from "@/components/type/FitText";
import type { Photo } from "@/lib/unsplash";

/* Creative work as two words the width of the page: Photography cut out of his
   photographs, and Graphic design cut out of hatching. Set aside on 2026-09-16,
   the third arrangement of that page he turned down. */

export default function CreativeWords({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const photo = photos.length > 0 ? photos[Math.min(index, photos.length - 1)] : null;

  useEffect(() => {
    for (const p of photos.slice(0, 12)) {
      const preload = new window.Image();
      preload.src = p.url;
    }
  }, [photos]);

  const leaf = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || photos.length < 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const next = Math.min(photos.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * photos.length)));
    if (next !== index) setIndex(next);
  };

  return (
    <section className="flex flex-1 flex-col">
      <Link
        href="/work/photography"
        onPointerMove={leaf}
        className="group flex flex-1 flex-col justify-center gap-[3vh] border-t border-rule bg-ground px-[5.5vw] py-[5vh]"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="text-muted">01 Photography</span>
          <span className="inline-flex items-center gap-3">
            {photos.length > 0 ? `${photos.length} photographs, live from Unsplash` : "Photographs"}
            <Arrow className="size-4" />
          </span>
        </span>

        <SectionTitle slug="photography">
          <FitText
            text="Photography"
            max={260}
            className={
              "font-display text-[min(11vw,13rem)] font-black uppercase leading-[0.82] tracking-[-0.045em] " +
              (photo ? "photo-fill" : "")
            }
            style={
              photo
                ? {
                    backgroundImage: `linear-gradient(rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.18)), url("${photo.url}")`,
                  }
                : undefined
            }
          />
        </SectionTitle>

        {photos.length > 1 ? (
          <span className="flex items-center gap-5">
            <span aria-hidden className="hidden flex-1 items-center gap-[2px] sm:flex">
              {photos.map((p, i) => (
                <span
                  key={p.id}
                  className={"h-3 flex-1 transition-colors duration-200 " + (i === index ? "bg-accent" : "bg-rule")}
                />
              ))}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
          </span>
        ) : null}
      </Link>

      <Link
        href="/work/design"
        className="group flex flex-1 flex-col justify-center gap-[3vh] border-y border-rule bg-raised px-[5.5vw] py-[5vh]"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="text-muted">02 Graphic design</span>
          <span className="inline-flex items-center gap-3">
            Being put together
            <Arrow className="size-4" />
          </span>
        </span>

        <SectionTitle slug="design">
          <FitText
            text="Graphic design"
            max={210}
            className="hatch-fill font-display text-[min(9vw,11rem)] font-black uppercase leading-[0.82] tracking-[-0.045em]"
          />
        </SectionTitle>

        <span className="block max-w-[44ch] text-[clamp(1rem,1.15vw,1.12rem)] leading-[1.5] text-muted">
          Posters, type and composition, mostly in Photoshop.
        </span>
      </Link>
    </section>
  );
}
