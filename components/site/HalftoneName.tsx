"use client";

import { useEffect, useRef } from "react";

/* The name again at the foot of every page, printed as a halftone (after
   Opal's dotted wordmark and Lama Lama's halftone grounds). Each dot's size is
   the ink coverage under it. The pointer works like a loupe: dots near it grow
   and brighten, and settle back once it leaves. Nothing animates on its own. */

const TEXT = "PRASHANT YADAV";

export function HalftoneName() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() || "sans-serif";

    let dpr = 1;
    let W = 0;
    let H = 0;
    let cell = 8;
    let dots: { x: number; y: number; c: number; g: number }[] = [];
    let pointer = { x: -1e4, y: -1e4 };
    let raf = 0;
    const style = getComputedStyle(cv);

    const setFont = (c: CanvasRenderingContext2D, size: number) => {
      c.font = `900 ${size}px ${family}`;
      if ("fontStretch" in c) (c as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "condensed";
    };

    const build = () => {
      const cssW = cv.parentElement?.clientWidth ?? 0;
      if (!cssW) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const probe = document.createElement("canvas").getContext("2d")!;
      setFont(probe, 100);
      const m = probe.measureText(TEXT);
      const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const size = (cssW / width) * 100;
      const cap = m.actualBoundingBoxAscent * (size / 100);
      const cssH = Math.ceil(cap + 2);
      cell = Math.max(5, Math.round(cssW / 170));

      W = Math.round(cssW * dpr);
      H = Math.round(cssH * dpr);
      cv.width = W;
      cv.height = H;
      cv.style.height = `${cssH}px`;

      // Rasterise the lettering small, one pixel per dot, and read coverage.
      const cols = Math.ceil(cssW / cell);
      const rows = Math.ceil(cssH / cell);
      const small = document.createElement("canvas");
      small.width = cols;
      small.height = rows;
      const s = small.getContext("2d", { willReadFrequently: true })!;
      s.scale(cols / cssW, rows / cssH);
      setFont(s, size);
      s.fillStyle = "#000";
      s.fillText(TEXT, m.actualBoundingBoxLeft * (size / 100), cap);
      const data = s.getImageData(0, 0, cols, rows).data;
      dots = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const a = data[(j * cols + i) * 4 + 3] / 255;
          if (a > 0.04) dots.push({ x: (i + 0.5) * cell, y: (j + 0.5) * cell, c: a, g: 0 });
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const rest = style.getPropertyValue("--dot") || "#3b3b39";
      const lit = style.getPropertyValue("--dot-lit") || "#f0efeb";
      const max = cell * 0.5;
      ctx.fillStyle = rest;
      ctx.beginPath();
      for (const d of dots) {
        if (d.g > 0.02) continue;
        const r = max * Math.sqrt(d.c) * 0.92;
        ctx.moveTo(d.x + r, d.y);
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = lit;
      for (const d of dots) {
        if (d.g <= 0.02) continue;
        const r = max * Math.sqrt(d.c) * (0.92 + d.g * 0.55);
        ctx.globalAlpha = 0.35 + d.g * 0.65;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      raf = 0;
      const reach = cell * 11;
      let active = false;
      for (const d of dots) {
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const target = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / reach);
        d.g += (target - d.g) * 0.18;
        if (Math.abs(target - d.g) > 0.004) active = true;
      }
      draw();
      if (active) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      if (reduced) return;
      const rect = cv.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onLeave = () => {
      pointer = { x: -1e4, y: -1e4 };
      if (!raf) raf = requestAnimationFrame(step);
    };

    let ready = false;
    document.fonts.ready.then(() => {
      build();
      draw();
      ready = true;
    });
    const ro = new ResizeObserver(() => {
      if (!ready) return;
      build();
      draw();
    });
    if (cv.parentElement) ro.observe(cv.parentElement);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="halftone">
      <canvas ref={canvas} aria-hidden="true" className="w-full" />
    </div>
  );
}
