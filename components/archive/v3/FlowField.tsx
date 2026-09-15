"use client";

import { useEffect, useRef } from "react";

/* The flow field from the first round of landing directions, brought back as
   the ground for the About opening and rebuilt around this page instead of a
   name.

   On the landing it steered around rasterised letterforms. Here it steers
   around the content you are actually reading: every element marked
   data-flow-obstacle is drawn into a blurred mask, and the gradient of that
   mask adds a tangential term, so the current sweeps along the edges of the
   text block and thins out behind it. That is what keeps the type legible over
   a moving field, rather than a scrim laid on top.

   Two lessons from building it the first time are baked in. Ink composites
   additively, which needs a dark ground or the filaments have no headroom to
   glow into, so this violet is deep rather than bright. And strokes are batched
   into one path per ink per alpha band, fifteen stroke calls a frame instead of
   several thousand, which is the difference between sixty frames a second and a
   locked renderer. */

const GROUND = "#2e0c7a";
// All chromatic and all near the ground's own hue family, so additive crossings
// stay saturated instead of drifting grey.
const INKS = ["rgb(185,139,255)", "rgb(61,123,255)", "rgb(255,77,196)"];

const COUNT = 2600;
const MASK_STEP = 4;
const ALPHA = 0.2;
const DECAY = 0.014;
const BANDS = 5;

type P = { x: number; y: number; px: number; py: number; life: number; max: number; ink: number };

export default function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const host = canvas.parentElement;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let disposed = false;

    let gw = 0;
    let gh = 0;
    let gradX = new Float32Array(0);
    let gradY = new Float32Array(0);

    const particles: P[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const spawn = (p: P) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.px = p.x;
      p.py = p.y;
      p.max = 140 + Math.random() * 320;
      p.life = Math.random() * p.max;
      const r = Math.random();
      p.ink = r < 0.42 ? 0 : r < 0.76 ? 1 : 2;
    };

    const buildMask = () => {
      gw = Math.max(2, Math.ceil(w / MASK_STEP));
      gh = Math.max(2, Math.ceil(h / MASK_STEP));
      const mc = document.createElement("canvas");
      mc.width = gw;
      mc.height = gh;
      const mx = mc.getContext("2d", { willReadFrequently: true });
      if (!mx) return;

      const hostRect = host.getBoundingClientRect();
      mx.filter = "blur(7px)";
      mx.fillStyle = "#fff";
      host.querySelectorAll<HTMLElement>("[data-flow-obstacle]").forEach((el) => {
        const r = el.getBoundingClientRect();
        mx.fillRect(
          (r.left - hostRect.left) / MASK_STEP,
          (r.top - hostRect.top) / MASK_STEP,
          r.width / MASK_STEP,
          r.height / MASK_STEP,
        );
      });

      const data = mx.getImageData(0, 0, gw, gh).data;
      const m = new Float32Array(gw * gh);
      for (let i = 0; i < gw * gh; i++) m[i] = data[i * 4 + 3] / 255;

      gradX = new Float32Array(gw * gh);
      gradY = new Float32Array(gw * gh);
      for (let y = 1; y < gh - 1; y++) {
        for (let x = 1; x < gw - 1; x++) {
          const i = y * gw + x;
          gradX[i] = m[i + 1] - m[i - 1];
          gradY[i] = m[i + gw] - m[i - gw];
        }
      }
    };

    const resize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (nw === 0 || nh === 0) return;
      const same = nw === w && nh === h;
      w = nw;
      h = nh;
      if (!same) {
        canvas.width = w;
        canvas.height = h;
        particles.length = 0;
        const n = Math.round(COUNT * Math.max(0.5, Math.min(1.3, (w * h) / (1600 * 900))));
        for (let i = 0; i < n; i++) {
          const p: P = { x: 0, y: 0, px: 0, py: 0, life: 0, max: 0, ink: 0 };
          spawn(p);
          particles.push(p);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, w, h);
      }
      buildMask();
    };

    const bins: Path2D[] = [];

    const step = () => {
      t += 0.0022;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = GROUND;
      ctx.globalAlpha = DECAY;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < INKS.length * BANDS; i++) bins[i] = new Path2D();

      const pr = 240;

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;

        const sx = p.x / 520;
        const sy = p.y / 520;
        const a =
          Math.sin(sx * 1.9 + t * 2.1) +
          Math.sin(sy * 2.3 - t * 1.7) +
          Math.sin((sx + sy) * 1.2 + t * 0.9);
        let vx = Math.cos(a * Math.PI) * 1.05;
        let vy = Math.sin(a * Math.PI) * 1.05;

        const cx = (p.x / MASK_STEP) | 0;
        const cy = (p.y / MASK_STEP) | 0;
        if (cx > 0 && cy > 0 && cx < gw - 1 && cy < gh - 1) {
          const i = cy * gw + cx;
          const dx = gradX[i];
          const dy = gradY[i];
          const mag = Math.hypot(dx, dy);
          if (mag > 0.004) {
            const nx = dx / mag;
            const ny = dy / mag;
            const k = Math.min(mag * 9, 1);
            // Tangent dominates so ink sweeps along the block's edge, with a
            // stronger outward push than the landing used, because here the
            // thing it is flowing around has to stay readable.
            vx += -ny * 2.7 * k - nx * 2.2 * k;
            vy += nx * 2.7 * k - ny * 2.2 * k;
          }
        }

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const f = 1 / (1 + (dx * dx + dy * dy) / (pr * pr));
          vx += -dy * 0.011 * f;
          vy += dx * 0.011 * f;
        }

        p.x += vx * 1.8;
        p.y += vy * 1.8;
        p.life++;

        if (p.life > p.max || p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
          spawn(p);
          continue;
        }

        const fade = Math.sin((p.life / p.max) * Math.PI);
        let band = (fade * BANDS) | 0;
        if (band >= BANDS) band = BANDS - 1;
        const path = bins[p.ink * BANDS + band];
        path.moveTo(p.px, p.py);
        path.lineTo(p.x, p.y);
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.3;
      ctx.lineCap = "round";
      for (let ink = 0; ink < INKS.length; ink++) {
        ctx.strokeStyle = INKS[ink];
        for (let b = 0; b < BANDS; b++) {
          ctx.globalAlpha = ALPHA * ((b + 0.5) / BANDS);
          ctx.stroke(bins[ink * BANDS + b]);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (disposed) return;
      step();
      raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const ro = new ResizeObserver(resize);

    const start = () => {
      if (disposed) return;
      resize();
      ro.observe(canvas);
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      if (reduced) {
        for (let i = 0; i < 320; i++) step();
      } else {
        loop();
      }
    };

    // The obstacles are text, so their boxes are wrong until the webfonts land.
    document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />;
}
