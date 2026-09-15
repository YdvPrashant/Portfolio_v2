"use client";

import { useEffect, useRef } from "react";
import { readToken, watchPalette } from "@/lib/tokens";

/* His pixel portrait, redrawn from public/avatar.png in the palette's own
   colours instead of the Game Boy greens it was made in, and assembled from
   particles.

   The source is 32 by 32 cells blown up to 512px. Each cell is sampled once. The
   commonest colour is the background and is left out, so the ground shows
   through; cells darker than it become the ink and lighter ones the accent.

   Until it is seen, every cell is a small faint speck scattered over the frame.
   The first time the portrait comes into view each speck flies to its place on
   its own short delay, growing into a full cell as it lands, and then it holds
   still. */

const GRID = 32;
const SOURCE = "/avatar.png";
const TRAVEL_MS = 1400;
const SPREAD_MS = 600;
const DONE_MS = TRAVEL_MS + SPREAD_MS;

type Cell = { x: number; y: number; accent: boolean; sx: number; sy: number; delay: number };

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function PixelPortrait({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cells: Cell[] = [];
    let elapsed = 0; // ms into the assembly
    let raf = 0;
    let disposed = false;
    let started = false;
    let observer: IntersectionObserver | null = null;

    const draw = () => {
      const size = canvas.clientWidth;
      if (!size || cells.length === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.round(size * dpr);
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      const cell = px / GRID;
      const gap = Math.max(1, Math.round(cell * 0.1));
      const full = cell - gap;
      const ink = readToken(canvas, "--ink");
      const accent = readToken(canvas, "--accent");

      ctx.clearRect(0, 0, px, px);
      for (const c of cells) {
        const p = easeOut(Math.min(1, Math.max(0, (elapsed - c.delay) / TRAVEL_MS)));
        const gx = c.sx + (c.x - c.sx) * p;
        const gy = c.sy + (c.y - c.sy) * p;
        const s = full * (0.3 + 0.7 * p);
        ctx.globalAlpha = 0.2 + 0.8 * p;
        ctx.fillStyle = c.accent ? accent : ink;
        ctx.fillRect(gx * cell + (full - s) / 2, gy * cell + (full - s) / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const assemble = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const frame = (t: number) => {
        if (disposed) return;
        elapsed = Math.min(DONE_MS, t - t0);
        draw();
        if (elapsed < DONE_MS) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const image = new Image();
    image.src = SOURCE;
    image
      .decode()
      .then(() => {
        if (disposed) return;
        const sample = document.createElement("canvas");
        sample.width = GRID;
        sample.height = GRID;
        const sx = sample.getContext("2d", { willReadFrequently: true });
        if (!sx) return;
        sx.imageSmoothingEnabled = false;
        sx.drawImage(image, 0, 0, GRID, GRID);
        const data = sx.getImageData(0, 0, GRID, GRID).data;

        const colourAt = (i: number) => (data[i * 4] << 16) | (data[i * 4 + 1] << 8) | data[i * 4 + 2];
        const lightness = (c: number) => 0.2126 * ((c >> 16) & 255) + 0.7152 * ((c >> 8) & 255) + 0.0722 * (c & 255);

        const counts = new Map<number, number>();
        for (let i = 0; i < GRID * GRID; i++) counts.set(colourAt(i), (counts.get(colourAt(i)) ?? 0) + 1);
        const background = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        const backgroundLightness = lightness(background);

        const found: Cell[] = [];
        for (let i = 0; i < GRID * GRID; i++) {
          const c = colourAt(i);
          if (c === background) continue;
          found.push({
            x: i % GRID,
            y: Math.floor(i / GRID),
            accent: lightness(c) > backgroundLightness,
            // Scattered over the frame and a little beyond it.
            sx: Math.random() * GRID * 1.3 - GRID * 0.15,
            sy: Math.random() * GRID * 1.3 - GRID * 0.15,
            delay: Math.random() * SPREAD_MS,
          });
        }
        cells = found;

        if (reduced) {
          elapsed = DONE_MS;
          draw();
          return;
        }
        draw();
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            assemble();
            observer?.disconnect();
          },
          { threshold: 0.3 },
        );
        observer.observe(canvas);
      })
      .catch(() => {
        // Without the source image there is nothing to draw; the frame stays empty.
      });

    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    const unwatch = watchPalette(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      resize.disconnect();
      unwatch();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Pixel portrait of Prashant Yadav"
      className={"block aspect-square w-full " + className}
    />
  );
}
