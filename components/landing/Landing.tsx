"use client";

import { useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { person } from "@/lib/content";

/* The landing. Two behaviours on one page, deliberately on different clocks so
   they read as one composition rather than as two things competing.

   The structure holds still: three flat rectangles in an asymmetric
   arrangement, with the name laid across them so words land half on paper and
   half on ink. It only recomposes when you click it, never on its own.

   The type moves immediately: every letter is a live variable font instance
   whose weight and width answer to how near your cursor is. Letters trade width
   with one another so the line keeps its measure, and the swell travels through
   the word instead of pushing it around the page.

   Letters are addressed by their index along the line, never by measured
   geometry. Feeding a letter's new width back in as its own input would make the
   whole line oscillate. */

const GROUND = "#e9ff3d";
const INK = "#0b0b0b";

/* The ground is chartreuse, hue 67. Its complement is hue 247, so both
   saturated blocks sit in the violet-blue family opposite it: the true
   complement, then one split arm. The bone is the rest between them. A red
   block sat at hue 3, near enough to the ground to fight it rather than
   answer it. */
const BLOCKS = ["#7b3dff", "#2f6bff", "#f4f1e9"];

type Rect = { x: number; y: number; w: number; h: number };

/* Two zones are reserved: the nav at top right, and the role line at bottom
   left. The two saturated blocks stay out of both, because 11px of near-black
   on the violet is about 3.7 to 1, under the 4.5 small text wants. The bone
   block may sit anywhere, since small black type reads on it as well as it does
   on the ground. Display type only needs 3 to 1 and crosses everything freely.

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

const LINES = ["PRASHANT", "YADAV"];

const W_MIN = 260;
const W_MAX = 900;
const D_MIN = 64;
const D_MAX = 125;

export default function Landing() {
  const typeRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const root = typeRef.current;
    if (!root) return;
    const lineEls = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
    const letters = lineEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>("[data-letter]")));
    if (!letters.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t = 0;
    let disposed = false;
    let active = false;
    let pu = 0.5; // pointer, as a fraction of the viewport
    let pv = 0.5;
    let cu = 0.5; // eased follower, so the swell trails the cursor slightly
    let cv = 0.5;

    // Vertical centre of each line as a fraction of the viewport. Stable,
    // because the width axis changes a line's width and never its height.
    let lineV: number[] = [];
    const measureLines = () => {
      const h = window.innerHeight || 1;
      lineV = lineEls.map((el) => {
        const r = el.getBoundingClientRect();
        return (r.top + r.height / 2) / h;
      });
    };

    const SU = 0.19; // horizontal reach of the swell
    const SV = 0.15; // vertical reach

    // Scratch buffers, allocated once, so the loop below stays free of garbage.
    const buffers = letters.map((row) => new Float32Array(row.length));

    const frame = () => {
      if (disposed) return;
      t += 0.018;
      cu += (pu - cu) * 0.12;
      cv += (pv - cv) * 0.12;

      for (let li = 0; li < letters.length; li++) {
        const row = letters[li];
        const buf = buffers[li];
        const vy = lineV[li] ?? 0.5;
        const near = active ? Math.exp(-((vy - cv) * (vy - cv)) / (2 * SV * SV)) : 1;

        let sum = 0;
        for (let i = 0; i < row.length; i++) {
          const u = (i + 0.5) / row.length;
          let k: number;
          if (active) {
            k = Math.exp(-((u - cu) * (u - cu)) / (2 * SU * SU)) * near;
          } else {
            // Idle: a swell travelling along the line. Squared, not cubed;
            // cubing drove most of the line to zero and the re-centring below
            // then flattened those letters into a single value.
            const s = 0.5 + 0.5 * Math.sin(t - i * 0.62 - li * 1.6);
            k = s * s;
          }
          buf[i] = k;
          sum += k;
        }

        // Re-centre on a fixed mean so letters trade width with one another
        // rather than all thinning at once, which keeps the line's measure.
        const shift = 0.5 - sum / row.length;
        for (let i = 0; i < row.length; i++) {
          let k = buf[i] + shift;
          k = k < 0 ? 0 : k > 1 ? 1 : k;
          const wght = Math.round(W_MIN + k * (W_MAX - W_MIN));
          const wdth = (D_MIN + k * (D_MAX - D_MIN)).toFixed(1);
          row[i].style.fontVariationSettings = '"wght" ' + wght + ', "wdth" ' + wdth;
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pu = e.clientX / (window.innerWidth || 1);
      pv = e.clientY / (window.innerHeight || 1);
      active = true;
    };
    const onLeave = () => {
      active = false;
    };

    const start = () => {
      if (disposed) return;
      measureLines();
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", measureLines);
      if (reduced) {
        t = 1.2;
        frame();
        cancelAnimationFrame(raf);
      } else {
        frame();
      }
    };

    // Metrics are wrong until the webfont is actually available.
    document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measureLines);
    };
  }, []);

  return (
    <section
      style={{ background: GROUND, color: INK }}
      className="relative isolate flex h-dvh w-full flex-col justify-between overflow-hidden"
      onClick={() => setLayout((n) => (n + 1) % LAYOUTS.length)}
    >
      {/* Reshaped by transform rather than by inset, so a recompose is three
          composited transforms and no layout at all. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {BLOCKS.map((c, i) => {
          const r = LAYOUTS[layout][i];
          return (
            <div
              key={c}
              className="absolute inset-0 origin-top-left"
              style={{
                background: c,
                transform: `translate(${r.x}%, ${r.y}%) scale(${r.w / 100}, ${r.h / 100})`,
                transition: "transform 760ms cubic-bezier(0.76, 0, 0.24, 1)",
                transitionDelay: i * 60 + "ms",
              }}
            />
          );
        })}
      </div>

      <SiteNav tone={INK} />

      <div ref={typeRef} className="relative px-[4vw] sm:px-[5vw]">
        <h1 className="sr-only">{person.full}</h1>
        {LINES.map((line) => (
          <div
            key={line}
            data-line
            aria-hidden
            /* Sized to the longer of the two lines. PRASHANT is eight letters
               and Archivo sets them at about 0.67em each, so the line wants
               5.4em and the measure is 90vw: anything above 16.6vw runs off the
               edge. It was 18.5vw capped at 16rem, which overran at every width
               — by 16px on a phone and by 76px on a laptop — and the section
               clipped the T off both. */
            className="flex justify-start font-[family-name:var(--font-archivo)] text-[clamp(2.8rem,16.4vw,15rem)] leading-[0.86]"
          >
            {line.split("").map((ch, i) => (
              <span
                key={line + i}
                data-letter
                className="inline-block"
                style={{ fontVariationSettings: '"wght" 400, "wdth" 100' }}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="relative px-[5.5vw] pb-10">
        <p className="max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]">{person.role}</p>
      </div>
    </section>
  );
}
