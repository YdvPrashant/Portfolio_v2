"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Arrow from "@/components/Arrow";
import SectionTitle from "@/components/SectionTitle";
import type { Photo } from "@/lib/unsplash";

/* Work as a cover. One of two directions on trial (app/work/page.tsx).

   Photography takes most of the width as one photograph at full size, like a
   magazine cover, with its name set over the foot of it. Moving the pointer
   across the cover leafs through the latest six, left to right, and a row of
   ticks at the top shows which one you are on. Nothing changes until the
   pointer moves; on a touchscreen the cover is simply the latest photograph.
   Graphic design sits beside it as a quieter panel that says plainly it is
   being put together. */

const COUNT = 6;

export default function WorkCover({ photos }: { photos: Photo[] }) {
  const shown = photos.slice(0, COUNT);
  const [index, setIndex] = useState(0);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || shown.length < 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const next = Math.min(shown.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * shown.length)));
    if (next !== index) setIndex(next);
  };

  return (
    <section className="grid gap-[1vw] px-[5.5vw] lg:h-[calc(100dvh_-_var(--nav-h)_-_9rem)] lg:min-h-[480px] lg:grid-cols-12">
      <Link
        href="/work/photography"
        transitionTypes={["nav-forward"]}
        onPointerMove={onMove}
        className="group relative isolate block min-h-[62vh] overflow-hidden bg-raised lg:col-span-8 lg:min-h-0"
      >
        {shown.map((p, n) => (
          <Image
            key={p.id}
            src={p.url}
            alt={n === index ? p.alt : ""}
            fill
            sizes="(max-width: 1023px) 90vw, 62vw"
            loading={n === 0 ? "eager" : "lazy"}
            className={"object-cover transition-opacity duration-500 " + (n === index ? "opacity-100" : "opacity-0")}
            style={{ background: p.color }}
          />
        ))}

        {/* A shade at the foot only, so the name reads on any photograph while
            the rest of it stays at full brightness. */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />

        {shown.length > 1 ? (
          <span aria-hidden className="absolute inset-x-[3vw] top-[3vw] flex gap-1.5">
            {shown.map((p, n) => (
              <span key={p.id} className={"h-[2px] flex-1 transition-colors duration-300 " + (n === index ? "bg-white" : "bg-white/35")} />
            ))}
          </span>
        ) : null}

        <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-[5.5vw] text-white lg:p-[3vw]">
          <SectionTitle slug="photography">
            <span className="block font-display text-[clamp(2.4rem,6.5vw,5.6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
              Photography
            </span>
          </SectionTitle>
          <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums">
            {shown.length > 1 ? `${String(index + 1).padStart(2, "0")} / ${String(shown.length).padStart(2, "0")}` : "Gallery"}
            <Arrow className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
          </span>
        </span>
      </Link>

      <Link
        href="/work/design"
        transitionTypes={["nav-forward"]}
        className="group flex min-h-[40vh] flex-col justify-between gap-10 border border-rule p-[5.5vw] lg:col-span-4 lg:min-h-0 lg:p-[2.6vw]"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Being put together</span>
        <span>
          <SectionTitle slug="design">
            <span className="block font-display text-[clamp(2rem,3.8vw,3.4rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] transition-colors duration-500 group-hover:text-accent">
              Graphic
              <br />
              design
            </span>
          </SectionTitle>
          <span className="mt-4 flex items-end justify-between gap-6">
            <span className="max-w-[30ch] text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.5] text-muted">
              Posters, type and composition, mostly in Photoshop.
            </span>
            <Arrow className="size-5 shrink-0 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-accent" />
          </span>
        </span>
      </Link>
    </section>
  );
}
