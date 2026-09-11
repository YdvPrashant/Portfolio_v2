"use client";

import { useEffect, useRef } from "react";
import { nav, person } from "@/lib/content";

/* Direction D. Extrude.
   Flat, hard edged dimension, the way it is done in print rather than the way a
   renderer does it: no lighting, no gradient, no bevel. The name is stamped
   along a single axis behind a white face, and moving the pointer swings that
   axis, as if you were walking a lamp around the letters.

   Getting a smooth silhouette needs about sixty steps, and the obvious two ways
   to do that both stall the renderer: sixty DOM copies means sixty style
   recalcs and paint records a frame, and sixty text shadows means sixty
   rasterisations of display sized glyphs a frame. Both locked the tab outright.

   Chained drop-shadow filters compose instead of accumulating. Each pass casts
   a shadow of everything produced so far, so offsets of 1, 2, 4, 8, 16 and 32
   yield every whole step from zero to sixty three. Six GPU filter passes, one
   solid slab, and no staircase.

   The loop also parks itself once the axis has arrived. Nothing here moves on
   its own, so a permanent rAF would keep re-filtering display sized type
   forever. */

const GROUND = "#ff2d6f";
const FACE = "#ffffff";
const SOLID = "#0033ff";

// Seven doubling passes reach 2^7 - 1 steps, which puts one step under a pixel
// at display sizes and takes the last of the notching out of the silhouette.
const PASSES = 7;
const STEPS = (1 << PASSES) - 1;
const REACH_EM = 0.34; // total extrusion length, as a fraction of the type size

export default function Extrude() {
  const typeRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const type = typeRef.current;
    if (!type) return;

    let raf = 0;
    let disposed = false;
    let running = false;

    // Resting axis: down and to the right, the way a stamped shadow usually
    // falls. The pointer only ever swings it away from itself.
    let targetA = Math.PI * 0.25;
    let currentA = targetA;
    let step = 2;

    const measure = () => {
      const fs = parseFloat(getComputedStyle(type).fontSize || "0") || 100;
      step = (fs * REACH_EM) / STEPS;
    };

    const write = () => {
      const dx = Math.cos(currentA) * step;
      const dy = Math.sin(currentA) * step;
      const parts: string[] = [];
      for (let i = 0; i < PASSES; i++) {
        const n = 1 << i;
        parts.push(
          "drop-shadow(" + (dx * n).toFixed(2) + "px " + (dy * n).toFixed(2) + "px 0 " + SOLID + ")",
        );
      }
      type.style.filter = parts.join(" ");
    };

    const frame = () => {
      if (disposed) return;
      // Shortest way round the circle, so crossing the seam does not spin.
      let d = targetA - currentA;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      currentA += d * 0.1;
      write();
      if (Math.abs(d) < 0.002) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (running || disposed) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = type.getBoundingClientRect();
      targetA = Math.atan2(r.top + r.height / 2 - e.clientY, r.left + r.width / 2 - e.clientX);
      kick();
    };

    const onResize = () => {
      measure();
      write();
    };

    const start = () => {
      if (disposed) return;
      measure();
      write();
    };

    // Metrics are wrong until the webfont is actually available.
    document.fonts.ready.then(start);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      style={{ background: GROUND }}
      className="relative flex h-dvh w-full flex-col justify-between overflow-hidden"
    >
      <nav
        className="relative z-10 flex flex-wrap justify-end gap-x-6 gap-y-2 px-[5.5vw] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] sm:pt-10"
        style={{ color: FACE }}
      >
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="transition-opacity duration-200 hover:opacity-55">
            {item.label}
          </a>
        ))}
      </nav>

      <div className="px-[5.5vw]">
        <h1
          ref={typeRef}
          className="font-[family-name:var(--font-anton)] uppercase leading-[0.82] tracking-[0.005em]"
          style={{ color: FACE, fontSize: "min(17vw, 40vh)" }}
        >
          Prashant
          <br />
          Yadav
        </h1>
      </div>

      <div className="relative z-10 px-[5.5vw] pb-10">
        <p className="max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]" style={{ color: FACE }}>
          {person.role}
        </p>
      </div>
    </section>
  );
}
