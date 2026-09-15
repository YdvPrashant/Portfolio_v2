"use client";

import { useEffect, useRef } from "react";

/* Type whose every letter is a live variable font instance. Weight and width
   answer to how near the pointer is. Letters trade width with one another, so a
   line keeps its measure and the swell travels through the word instead of
   pushing it around the page. With `idle`, a slow swell runs along the lines
   while the pointer is elsewhere; without it the letters rest at the middle of
   their range and the loop sleeps until the pointer moves.

   Letters are addressed by their index along the line, never by measured
   geometry. Feeding a letter's new width back in as its own input makes the
   whole line oscillate.

   The name on Home and the address on Contact both use it, so the site opens
   and closes on the same material. Renders aria-hidden; the caller supplies the
   accessible text. */

type Range = readonly [number, number];

type Props = {
  lines: readonly string[];
  className?: string;
  idle?: boolean;
  weight?: Range;
  width?: Range;
};

const SU = 0.19; // horizontal reach of the swell, as a fraction of the viewport
const SV = 0.15; // vertical reach

export default function LivingType({
  lines,
  className = "",
  idle = true,
  weight = [260, 900],
  width = [64, 125],
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [wMin, wMax] = weight;
  const [dMin, dMax] = width;
  const text = lines.join("\n");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const lineEls = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
    const letters = lineEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>("[data-letter]")));
    if (!letters.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let disposed = false;
    let t = 0;
    let active = false;
    let pu = 0.5; // pointer, as a fraction of the viewport
    let pv = 0.5;
    let cu = 0.5; // eased follower, so the swell trails the pointer slightly
    let cv = 0.5;

    // Vertical centre of each line as a fraction of the viewport. The width
    // axis changes a line's width and never its height, so this holds still.
    let lineV: number[] = [];
    const measure = () => {
      const h = window.innerHeight || 1;
      lineV = lineEls.map((el) => {
        const r = el.getBoundingClientRect();
        return (r.top + r.height / 2) / h;
      });
    };

    // Scratch buffers, allocated once, so the loop stays free of garbage.
    const buffers = letters.map((row) => new Float32Array(row.length));

    const write = () => {
      for (let li = 0; li < letters.length; li++) {
        const row = letters[li];
        const buf = buffers[li];
        const vy = lineV[li] ?? 0.5;
        const near = Math.exp(-((vy - cv) * (vy - cv)) / (2 * SV * SV));

        let sum = 0;
        for (let i = 0; i < row.length; i++) {
          const u = (i + 0.5) / row.length;
          let k = 0.5;
          if (active) {
            k = Math.exp(-((u - cu) * (u - cu)) / (2 * SU * SU)) * near;
          } else if (idle) {
            // Squared, not cubed: cubing drove most of the line to zero and the
            // re-centring below then flattened those letters to one value.
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
          const wght = Math.round(wMin + k * (wMax - wMin));
          const wdth = (dMin + k * (dMax - dMin)).toFixed(1);
          row[i].style.fontVariationSettings = '"wght" ' + wght + ', "wdth" ' + wdth;
        }
      }
    };

    const frame = () => {
      if (disposed) return;
      t += 0.018;
      cu += (pu - cu) * 0.12;
      cv += (pv - cv) * 0.12;
      write();
      const settled = Math.abs(pu - cu) < 0.0005 && Math.abs(pv - cv) < 0.0005;
      if (!idle && (!active || settled)) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (running || disposed || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pu = e.clientX / (window.innerWidth || 1);
      pv = e.clientY / (window.innerHeight || 1);
      active = true;
      wake();
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return; // moved between elements, still on the page
      active = false;
      wake();
    };
    const onLayout = () => {
      measure();
      wake();
    };

    const start = () => {
      if (disposed) return;
      measure();
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
      window.addEventListener("resize", onLayout);
      window.addEventListener("scroll", onLayout, { passive: true });
      if (reduced) {
        t = 1.2;
        write();
      } else if (idle) {
        running = true;
        frame();
      } else {
        write();
      }
    };

    // Metrics are wrong until the webfont is actually available.
    document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout);
    };
  }, [text, idle, wMin, wMax, dMin, dMax]);

  const rest = '"wght" ' + Math.round((wMin + wMax) / 2) + ', "wdth" ' + ((dMin + dMax) / 2).toFixed(1);

  return (
    <span ref={rootRef} aria-hidden className="block">
      {lines.map((line, li) => (
        <span key={li} data-line className={"flex " + className}>
          {Array.from(line).map((ch, i) => (
            <span key={i} data-letter className="inline-block whitespace-pre" style={{ fontVariationSettings: rest }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
