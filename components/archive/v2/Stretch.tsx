"use client";

import { useEffect, useRef } from "react";
import { nav, person } from "@/lib/content";

/* Direction A. Stretch.
   One idea, executed once: the name is the whole page, and every letter is a
   live variable font instance. Weight and width are driven per letter by how
   near the cursor is, so the word thickens and opens under your hand and thins
   away from it. With no pointer a wave travels along the letters instead.

   Letters are addressed by their index along the line, never by their measured
   position. Measuring live geometry would feed each letter's new width back
   into its own input and the whole line would oscillate. */

const GROUND = "#e9ff3d";
const INK = "#0b0b0b";

const LINES = ["PRASHANT", "YADAV"];

const W_MIN = 260;
const W_MAX = 900;
const D_MIN = 64;
const D_MAX = 125;

export default function Stretch() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
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
    const raw = letters.map((row) => new Float32Array(row.length));

    const frame = () => {
      if (disposed) return;
      t += 0.018;
      cu += (pu - cu) * 0.12;
      cv += (pv - cv) * 0.12;

      for (let li = 0; li < letters.length; li++) {
        const row = letters[li];
        const buf = raw[li];
        const vy = lineV[li] ?? 0.5;
        const near = active ? Math.exp(-((vy - cv) * (vy - cv)) / (2 * SV * SV)) : 1;

        let sum = 0;
        for (let i = 0; i < row.length; i++) {
          const u = (i + 0.5) / row.length;
          let k: number;
          if (active) {
            k = Math.exp(-((u - cu) * (u - cu)) / (2 * SU * SU)) * near;
          } else {
            // Idle: a swell travelling along the line. Squared rather than
            // cubed, because cubing drove most of the line to zero and the
            // re-centring below then flattened those letters into one value.
            const s = 0.5 + 0.5 * Math.sin(t - i * 0.62 - li * 1.6);
            k = s * s;
          }
          buf[i] = k;
          sum += k;
        }

        /* Re-centre the line on a fixed mean so the letters trade width with
           one another instead of all thinning at once. The measure stays put
           and the swell reads as a squeeze travelling through it, rather than
           the whole word shrinking away from the edge of the page. */
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
        active = false;
        t = 1.2;
        frame();
        cancelAnimationFrame(raf);
      } else {
        frame();
      }
    };

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
      className="relative flex h-dvh w-full flex-col justify-between overflow-hidden"
    >
      <nav className="flex flex-wrap justify-end gap-x-6 gap-y-2 px-[5.5vw] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] sm:pt-10">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="transition-opacity duration-200 hover:opacity-45">
            {item.label}
          </a>
        ))}
      </nav>

      <div ref={rootRef} className="px-[5vw]">
        <h1 className="sr-only">{person.full}</h1>
        {LINES.map((line) => (
          <div
            key={line}
            data-line
            aria-hidden
            className="flex justify-start font-[family-name:var(--font-archivo)] text-[clamp(3.2rem,18.5vw,16rem)] leading-[0.86]"
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

      <div className="px-[5.5vw] pb-10">
        <p className="max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]">{person.role}</p>
      </div>
    </section>
  );
}
