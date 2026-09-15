"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import Arrow from "@/components/Arrow";
import type { Photo } from "@/lib/unsplash";

/* Creative work as two stacks of prints that fan out when pointed at:
   photographs on one side, blank plates with printer's crop marks on the other.
   Set aside on 2026-09-16, the fourth arrangement of that page he turned down,
   after which he asked for the first one back. */

const CARDS = 5;
const MIDDLE = (CARDS - 1) / 2;

function atRest(i: number) {
  const x = ((i % 3) - 1) * 6;
  const y = (i % 2 === 0 ? -1 : 1) * (4 + (i % 3) * 2);
  const turn = ((i % 5) - 2) * 2.4;
  return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${turn}deg)`;
}

function fanned(i: number) {
  const step = i - MIDDLE;
  return `translate(-50%, -50%) translate(calc(var(--spread) * ${step}), ${Math.abs(step) * 12}px) rotate(${step * 6}deg)`;
}

function Pile({ open, cards }: { open: boolean; cards: ReactNode[] }) {
  return (
    <span
      className="relative block h-[clamp(200px,min(40vh,44vw),420px)]"
      style={{ "--spread": "clamp(24px, 6.2vw, 82px)" } as CSSProperties}
    >
      {cards.map((card, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 block h-full transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: open ? fanned(i) : atRest(i),
            transitionDelay: `${Math.abs(i - MIDDLE) * 45}ms`,
            zIndex: i,
          }}
        >
          {card}
        </span>
      ))}
    </span>
  );
}

function Print({ photo, eager }: { photo: Photo; eager: boolean }) {
  return (
    <span className="relative block aspect-[3/4] h-full bg-raised p-[5%] shadow-[0_14px_34px_rgb(0_0_0/0.28)]">
      <span className="relative block h-full w-full overflow-hidden" style={{ background: photo.color }}>
        <Image
          src={photo.url}
          alt=""
          fill
          sizes="(max-width: 1023px) 46vw, 20vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover"
        />
      </span>
    </span>
  );
}

const CORNERS = [
  "left-0 top-0 border-l border-t",
  "right-0 top-0 border-r border-t",
  "left-0 bottom-0 border-l border-b",
  "right-0 bottom-0 border-r border-b",
];

function Blank({ n }: { n: number }) {
  return (
    <span className="relative block aspect-[3/4] h-full bg-raised p-[5%] shadow-[0_14px_34px_rgb(0_0_0/0.28)]">
      <span
        className="relative block h-full w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, color-mix(in oklab, var(--ink) 14%, transparent) 0 1px, transparent 1px 9px)",
        }}
      >
        {CORNERS.map((corner) => (
          <span key={corner} className={"absolute size-4 border-ink/45 " + corner} />
        ))}
        <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          {String(n).padStart(2, "0")}
        </span>
      </span>
    </span>
  );
}

export default function CreativePiles({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<"photography" | "design" | null>(null);

  const prints = Array.from({ length: CARDS }, (_, i) => photos[Math.floor((i * photos.length) / CARDS)]).filter(
    (p): p is Photo => Boolean(p),
  );

  const photographCards =
    prints.length === CARDS
      ? prints.map((p, i) => <Print key={p.id} photo={p} eager={i >= CARDS - 2} />)
      : Array.from({ length: CARDS }, (_, i) => <Blank key={i} n={i + 1} />);

  return (
    <section className="grid flex-1 content-center gap-y-[9vh] px-[5.5vw] py-[5vh] lg:grid-cols-2 lg:gap-x-[5vw]">
      <Link
        href="/work/photography"
        onPointerEnter={() => setOpen("photography")}
        onPointerLeave={() => setOpen(null)}
        className="group block"
      >
        <Pile open={open === "photography"} cards={photographCards} />
        <span className="mt-[5vh] block border-t border-rule pt-5">
          <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-muted">01 Photography</span>
            <span className="inline-flex items-center gap-3">
              {photos.length > 0 ? `${photos.length} photographs` : "Photographs"}
              <Arrow className="size-4" />
            </span>
          </span>
          <span className="mt-4 block font-display text-[clamp(1.9rem,3.6vw,3.2rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
            Photography
          </span>
          <span className="mt-3 block max-w-[38ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.5] text-muted">
            Shot on my own time, not for clients. The gallery is live from Unsplash.
          </span>
        </span>
      </Link>

      <Link
        href="/work/design"
        onPointerEnter={() => setOpen("design")}
        onPointerLeave={() => setOpen(null)}
        className="group block"
      >
        <Pile open={open === "design"} cards={Array.from({ length: CARDS }, (_, i) => <Blank key={i} n={i + 1} />)} />
        <span className="mt-[5vh] block border-t border-rule pt-5">
          <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-muted">02 Graphic design</span>
            <span className="inline-flex items-center gap-3">
              Being put together
              <Arrow className="size-4" />
            </span>
          </span>
          <span className="mt-4 block font-display text-[clamp(1.9rem,3.6vw,3.2rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
            Graphic design
          </span>
          <span className="mt-3 block max-w-[38ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.5] text-muted">
            Posters, type and composition, mostly in Photoshop. Nothing on the plates yet.
          </span>
        </span>
      </Link>
    </section>
  );
}
