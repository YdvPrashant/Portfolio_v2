"use client";

import { useEffect, useRef, useState } from "react";
import { nav, person } from "@/lib/content";

/* Direction C. Blocks.
   A Neue Grafik composition that will not sit still. Four flat rectangles in
   four flat colours, arranged asymmetrically against bone, with the name locked
   across them so words run half on paper and half on ink. Every few seconds the
   composition resolves into a different arrangement while the type holds its
   ground, so the page reads as one poster being redrawn rather than as a set of
   slides.

   Each block is a full bleed div reshaped by transform rather than by inset, so
   a recompose is four composited transforms and no layout at all. */

const GROUND = "#f4f1e9";
const INK = "#0b0b0b";

const COLOURS = ["#e63329", "#0047ff", "#ffc400", "#00c46a"];

type Rect = { x: number; y: number; w: number; h: number };

const LAYOUTS: Rect[][] = [
  [
    { x: 58, y: 0, w: 42, h: 40 },
    { x: 74, y: 40, w: 26, h: 60 },
    { x: 0, y: 0, w: 22, h: 26 },
    { x: 22, y: 62, w: 18, h: 38 },
  ],
  [
    { x: 0, y: 0, w: 34, h: 52 },
    { x: 34, y: 0, w: 20, h: 30 },
    { x: 66, y: 18, w: 34, h: 30 },
    { x: 0, y: 74, w: 30, h: 26 },
  ],
  [
    { x: 80, y: 0, w: 20, h: 100 },
    { x: 0, y: 0, w: 30, h: 22 },
    { x: 46, y: 66, w: 34, h: 34 },
    { x: 30, y: 0, w: 16, h: 44 },
  ],
];

export default function Blocks() {
  const [layout, setLayout] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) setLayout((n) => (n + 1) % LAYOUTS.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  const advance = () => setLayout((n) => (n + 1) % LAYOUTS.length);

  return (
    <section
      style={{ background: GROUND, color: INK }}
      className="relative isolate h-dvh w-full cursor-pointer overflow-hidden"
      onClick={advance}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {COLOURS.map((c, i) => {
          const r = LAYOUTS[layout][i];
          return (
            <div
              key={c}
              className="absolute inset-0 origin-top-left"
              style={{
                background: c,
                transform: `translate(${r.x}%, ${r.y}%) scale(${r.w / 100}, ${r.h / 100})`,
                transition: "transform 720ms cubic-bezier(0.76, 0, 0.24, 1)",
                transitionDelay: i * 55 + "ms",
              }}
            />
          );
        })}
      </div>

      <nav className="relative flex flex-wrap justify-end gap-x-6 gap-y-2 px-[5.5vw] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] sm:pt-10">
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => e.stopPropagation()}
            className="transition-opacity duration-200 hover:opacity-45"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="absolute bottom-[9vh] left-[5.5vw] right-[5.5vw]">
        <h1 className="font-[family-name:var(--font-archivo)] text-[clamp(2.8rem,13vw,11.5rem)] font-black uppercase leading-[0.84] tracking-[-0.045em]">
          Prashant
          <br />
          Yadav
        </h1>
      </div>

      <p className="absolute bottom-9 right-[5.5vw] max-w-[26ch] text-right font-mono text-[12px] leading-relaxed sm:text-[13px]">
        {person.role}
      </p>
    </section>
  );
}
