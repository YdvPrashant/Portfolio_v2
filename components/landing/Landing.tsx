"use client";

import { useState } from "react";
import LivingType from "@/components/type/LivingType";
import { person } from "@/lib/content";

/* The landing. Two behaviours on one page, deliberately on different clocks so
   they read as one composition rather than as two things competing.

   The structure holds still: three flat rectangles in an asymmetric
   arrangement, with the name laid across them so words land half on the ground
   and half on a block. It only recomposes when you click it, never on its own.

   The type moves immediately: every letter is a live variable font instance
   whose weight and width answer to how near your cursor is
   (components/type/LivingType.tsx).

   Restored on 2026-09-15. A home page with a section index replaced it for a
   day and was rejected ("keep it as it was but change the colours"); that one
   is at /archive/v4. Only the colours changed: ground and ink come from the
   palette, and the blocks from --block-1 to --block-3, which each palette
   chooses so the name stays readable wherever it crosses one. */

type Rect = { x: number; y: number; w: number; h: number };

/* Two zones are reserved: the nav at top right, and the role line at bottom
   left. The blocks stay out of both, so small type only ever sits on the
   ground. Display type only needs 3 to 1 and crosses everything freely.

   Nav zone:  x 62 to 100, y 0 to 13.
   Role zone: x 0 to 40,   y 86 to 100. */
const LAYOUTS: Rect[][] = [
  [
    { x: 62, y: 13, w: 38, h: 34 },
    { x: 0, y: 0, w: 20, h: 22 },
    { x: 74, y: 52, w: 26, h: 48 },
  ],
  [
    { x: 0, y: 0, w: 30, h: 46 },
    { x: 70, y: 15, w: 30, h: 26 },
    { x: 34, y: 70, w: 28, h: 30 },
  ],
  [
    { x: 82, y: 13, w: 18, h: 87 },
    { x: 0, y: 50, w: 24, h: 30 },
    { x: 26, y: 0, w: 34, h: 28 },
  ],
];

const BLOCKS = ["var(--block-1)", "var(--block-2)", "var(--block-3)"];

const LINES = ["PRASHANT", "YADAV"];

export default function Landing() {
  const [layout, setLayout] = useState(0);

  return (
    <section
      className="relative isolate flex h-dvh w-full flex-col justify-between overflow-hidden bg-ground text-ink"
      onClick={() => setLayout((n) => (n + 1) % LAYOUTS.length)}
    >
      {/* Reshaped by transform rather than by inset, so a recompose is three
          composited transforms and no layout at all. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {BLOCKS.map((colour, i) => {
          const r = LAYOUTS[layout][i];
          return (
            <div
              key={i}
              className="absolute inset-0 origin-top-left"
              style={{
                background: colour,
                transform: `translate(${r.x}%, ${r.y}%) scale(${r.w / 100}, ${r.h / 100})`,
                transition: "transform 760ms cubic-bezier(0.76, 0, 0.24, 1)",
                transitionDelay: i * 60 + "ms",
              }}
            />
          );
        })}
      </div>

      {/* The nav lives in the root layout, fixed over this corner. */}
      <div aria-hidden className="h-(--nav-h) shrink-0" />

      <div className="relative px-[4vw] sm:px-[5vw]">
        <h1 className="sr-only">{person.full}</h1>
        {/* Sized to the longer of the two lines. PRASHANT is eight letters and
            Archivo sets them at about 0.67em each, so the line wants 5.4em and
            the measure is 90vw: anything above 16.6vw runs off the edge. */}
        <LivingType
          lines={LINES}
          className="justify-start font-[family-name:var(--font-archivo)] text-[clamp(2.8rem,16.4vw,15rem)] leading-[0.86]"
        />
      </div>

      <div className="relative px-[5.5vw] pb-10">
        <p className="max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]">{person.role}</p>
      </div>
    </section>
  );
}
