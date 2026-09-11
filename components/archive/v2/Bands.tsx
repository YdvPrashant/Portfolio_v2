"use client";

import { useEffect, useRef } from "react";
import { nav, person } from "@/lib/content";

/* Direction B. Bands.
   The viewport is cut into seven horizontal strips, each a different saturated
   colour, and each strip holds its own copy of the full name clipped to that
   strip. Sliding the copies past each other by an amount proportional to how
   far the strip sits from the middle fans the name into a shear. The pointer
   drives the fan, and at dead centre every strip lines up and the name snaps
   whole. Leave it alone and it fans itself, slowly, so the trick is
   discoverable without instructions. */

const BANDS = 7;
const COLOURS = ["#ff2d55", "#0047ff", "#00e0a4", "#ffc400", "#7b2ff7", "#ff6b00", "#00c2ff"];
const INK = "#0b0b0b";

export default function Bands() {
  const sectionRef = useRef<HTMLElement>(null);
  const slabs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let disposed = false;
    let t = 0;
    let target = 0; // -1 to 1, how far the fan is thrown
    let current = 0;
    let active = false;

    const apply = (k: number) => {
      const amp = (section.clientWidth || 1) * 0.085;
      const mid = (BANDS - 1) / 2;
      for (let i = 0; i < BANDS; i++) {
        const el = slabs.current[i];
        if (!el) continue;
        el.style.transform = "translate3d(" + (k * amp * (i - mid)).toFixed(2) + "px,0,0)";
      }
    };

    const frame = () => {
      if (disposed) return;
      t += 0.006;
      // With no pointer the fan breathes through alignment on its own.
      if (!active) target = Math.sin(t) * 0.75;
      current += (target - current) * 0.08;
      apply(current);
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      target = ((e.clientX - r.left) / r.width - 0.5) * 2;
      active = true;
    };
    const onLeave = () => {
      active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    if (reduced) {
      apply(0.45);
    } else {
      frame();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-dvh w-full overflow-hidden" style={{ background: INK }}>
      <h1 className="sr-only">{person.full}</h1>

      {Array.from({ length: BANDS }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute left-0 w-full overflow-hidden"
          style={{
            top: (i * 100) / BANDS + "%",
            height: 100 / BANDS + "%",
            background: COLOURS[i],
          }}
        >
          {/* A full height copy of the name, pulled up so this strip shows only
              its own slice of it. Percentages resolve against the strip, so
              -i * 100% is exactly i strips. */}
          <div
            ref={(el) => {
              slabs.current[i] = el;
            }}
            className="absolute left-0 flex w-full items-center justify-center"
            style={{ top: -(i * 100) + "%", height: BANDS * 100 + "%", willChange: "transform" }}
          >
            {/* The type has to stand nearly as tall as the viewport, or the
                strips have nothing to slice. Sized against height and width at
                once so it never outgrows either. Anton is condensed enough to
                take eight characters at this scale. */}
            <span
              className="block whitespace-nowrap text-center font-[family-name:var(--font-anton)] uppercase leading-[0.88] tracking-[0.01em]"
              style={{ color: INK, fontSize: "min(25vw, 45vh)" }}
            >
              PRASHANT
              <br />
              YADAV
            </span>
          </div>
        </div>
      ))}

      <nav className="absolute left-0 top-0 z-10 flex w-full flex-wrap justify-end gap-x-6 gap-y-2 px-[5.5vw] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] sm:pt-10" style={{ color: INK }}>
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="transition-opacity duration-200 hover:opacity-45">
            {item.label}
          </a>
        ))}
      </nav>

      <p
        className="absolute bottom-9 left-[5.5vw] z-10 max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]"
        style={{ color: INK }}
      >
        {person.role}
      </p>
    </section>
  );
}
