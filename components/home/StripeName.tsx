"use client";

import { useEffect, useRef } from "react";
import { whenIntroDone } from "@/lib/intro";
import { pageTop, subscribe } from "@/lib/scroll";

/* The name, drawn as horizontal stripes of ink.

   Each stripe is a slice of the lettering in three process inks, cyan, magenta
   and yellow, printed on top of each other with multiply. Aligned, they print
   black. Moving the pointer across the name drags the stripes it passes and
   pulls the three inks out of register, so the fringes show the colours that
   make up the black, like light through a prism. Springs bring every stripe
   back, and nothing moves unless the pointer or the scroll does.

   The idea is borrowed from Son Daven's striped display type and NOTHIN's
   full width wordmark; the misregistration is this site's own. */

type Props = {
  lines: readonly string[];
  /** Horizontal alignment for each line. */
  align: readonly ("left" | "right")[];
  /** Mona Sans width, as a CSS font-stretch percentage. */
  stretch?: number;
  className?: string;
};

// Process inks. Multiplied together they make black.
const INKS = ["#00a0e9", "#e4007f", "#ffe600"] as const;
// How far each ink travels relative to its stripe: cyan most, yellow least.
const SPREAD = [1, 0.55, 0.14] as const;

// A spring that settles in about half a second with a little overshoot.
const STIFFNESS = 0.045;
const DAMPING = 0.24;

type Row = {
  y: number;
  h: number;
  d: number;
  v: number;
  gain: number;
  dir: number;
  release: number;
};

export function StripeName({ lines, align, stretch = 75, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    if (!box || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() ||
      "sans-serif";

    let dpr = 1;
    let W = 0;
    let H = 0;
    let inks: HTMLCanvasElement[] = [];
    let rows: Row[] = [];
    let scatter = 0; // 0 to 1, from scrolling the hero away
    let loop = 0;
    let introStart = 0;
    let alive = true;
    let pointer: { x: number; y: number; t: number } | null = null;

    const setFont = (c: CanvasRenderingContext2D, size: number) => {
      c.font = `900 ${size}px ${family}`;
      if ("fontStretch" in c) {
        (c as CanvasRenderingContext2D & { fontStretch: string }).fontStretch =
          stretch <= 62.5 ? "extra-condensed" : stretch <= 75 ? "condensed" : stretch <= 87.5 ? "semi-condensed" : stretch <= 100 ? "normal" : stretch <= 112.5 ? "semi-expanded" : "expanded";
      }
    };

    const build = () => {
      const cssW = box.clientWidth;
      if (!cssW) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Measure at a reference size, then scale so the widest line fills the box.
      const probe = document.createElement("canvas").getContext("2d")!;
      setFont(probe, 100);
      const metrics = lines.map((l) => probe.measureText(l));
      const widest = Math.max(
        ...metrics.map((m) => m.actualBoundingBoxLeft + m.actualBoundingBoxRight),
      );
      const size = (cssW / widest) * 100;
      const cap = Math.max(...metrics.map((m) => m.actualBoundingBoxAscent)) * (size / 100);
      const gap = size * 0.07;
      const cssH = Math.ceil(cap * lines.length + gap * (lines.length - 1) + 2);

      W = Math.round(cssW * dpr);
      H = Math.round(cssH * dpr);
      cv.width = W;
      cv.height = H;
      cv.style.height = `${cssH}px`;

      // The lettering once, as a mask.
      const mask = document.createElement("canvas");
      mask.width = W;
      mask.height = H;
      const m = mask.getContext("2d")!;
      m.scale(dpr, dpr);
      setFont(m, size);
      m.textBaseline = "alphabetic";
      m.fillStyle = "#000";
      lines.forEach((line, i) => {
        const mt = metrics[i];
        const w = (mt.actualBoundingBoxLeft + mt.actualBoundingBoxRight) * (size / 100);
        const left = align[i] === "right" ? cssW - w : 0;
        const baseline = cap * (i + 1) + gap * i;
        m.fillText(line, left + mt.actualBoundingBoxLeft * (size / 100), baseline);
      });

      // One tinted copy per ink.
      inks = INKS.map((colour) => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const x = c.getContext("2d")!;
        x.drawImage(mask, 0, 0);
        x.globalCompositeOperation = "source-in";
        x.fillStyle = colour;
        x.fillRect(0, 0, W, H);
        return x.canvas;
      });

      // Stripes: a period that scales with the type, never finer than 4px.
      const period = Math.max(4, Math.min(15, size * 0.042)) * dpr;
      const ink = Math.max(2.4 * dpr, period * 0.64);
      const previous = rows;
      rows = [];
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let y = 0, i = 0; y < H; y += period, i++) {
        const old = previous[i];
        rows.push({
          y: Math.round(y),
          h: Math.round(Math.min(ink, H - y)),
          d: old ? old.d : 0,
          v: old ? old.v : 0,
          gain: 0.65 + rand() * 0.7,
          dir: i % 2 ? 1 : -1,
          release: rand(),
        });
      }

    };

    const draw = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "multiply";
      const spreadScroll = scatter * scatter * W * 0.55;
      for (let k = 0; k < inks.length; k++) {
        const src = inks[k];
        for (const r of rows) {
          const off = (r.d + r.dir * r.gain * spreadScroll) * SPREAD[k];
          ctx.drawImage(src, 0, r.y, W, r.h, Math.round(off), r.y, W, r.h);
        }
      }
    };

    let lastTime = 0;
    const step = (now: number) => {
      loop = 0;
      if (!alive) return;
      // Fixed 60Hz physics, so a 120Hz screen does not spring twice as fast.
      const steps = lastTime ? Math.max(1, Math.min(4, Math.round((now - lastTime) / 16.67))) : 1;
      lastTime = now;
      let moving = false;
      const introT = introStart ? (now - introStart) / 1000 : Infinity;
      for (const r of rows) {
        // During the intro, stripes wait off to one side until their turn.
        if (introT < r.release * 0.6) {
          moving = true;
          continue;
        }
        for (let s = 0; s < steps; s++) {
          r.v += -STIFFNESS * r.d - DAMPING * r.v;
          r.d += r.v;
        }
        if (Math.abs(r.d) > 0.05 || Math.abs(r.v) > 0.05) moving = true;
        else {
          r.d = 0;
          r.v = 0;
        }
      }
      draw();
      if (moving) loop = requestAnimationFrame(step);
      else lastTime = 0;
    };

    const kick = () => {
      if (!loop && alive) loop = requestAnimationFrame(step);
    };

    const onPointer = (e: PointerEvent) => {
      // Nothing to do while the name is scrolled away or motion is reduced.
      if (reduced || scatter >= 0.999) return;
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      if (pointer && now - pointer.t < 80) {
        const vx = (x - pointer.x) * dpr;
        const inside = x > -60 && x < rect.width + 60;
        if (inside && vx !== 0) {
          const reach = Math.max(40, rect.height * 0.16) * dpr;
          const py = y * dpr;
          let touched = false;
          for (const r of rows) {
            const t = (r.y + r.h / 2 - py) / reach;
            if (t > 2.5 || t < -2.5) continue;
            r.v += vx * 0.22 * r.gain * Math.exp(-t * t);
            touched = true;
          }
          if (touched) kick();
        }
      }
      pointer = { x, y, t: now };
    };

    let ready = false;
    let cancelIntro = () => {};
    const start = () => {
      if (!alive) return;
      build();
      ready = true;
      box.dataset.ready = "true";
      if (reduced) {
        draw();
        return;
      }
      // Every stripe waits off to one side, then springs into place once the
      // preloader, if there is one, starts to lift.
      for (const r of rows) r.d = r.dir * W * (0.35 + r.gain * 0.25);
      draw();
      cancelIntro = whenIntroDone(() => {
        introStart = performance.now();
        kick();
      });
    };

    document.fonts
      .load(`900 100px ${family}`)
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(start);

    const ro = new ResizeObserver(() => {
      if (!ready) return;
      build();
      draw();
    });
    ro.observe(box);

    const hero = box.closest("section") ?? box;
    let heroTop = 0;
    let heroH = 1;
    const unsubscribe = subscribe({
      measure() {
        heroTop = pageTop(hero);
        heroH = hero.offsetHeight || 1;
      },
      update(y) {
        if (reduced) return;
        const next = Math.min(1, Math.max(0, (y - heroTop) / heroH));
        if (Math.abs(next - scatter) < 0.001) return;
        scatter = next;
        if (ready && !loop) draw();
      },
    });

    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      alive = false;
      cancelIntro();
      cancelAnimationFrame(loop);
      ro.disconnect();
      unsubscribe();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [lines, align, stretch]);

  return (
    <div ref={wrap} className={className} data-ready="false">
      <canvas ref={canvas} aria-hidden="true" className="w-full" />
    </div>
  );
}
