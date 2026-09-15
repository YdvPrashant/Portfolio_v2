"use client";

import { useEffect, useRef } from "react";
import { readToken, watchPalette } from "@/lib/tokens";

/* The texture under the About opening.

   It started as a bright field of additive ink with a swirl that followed the
   cursor, and people found it distracting, so it is a quiet one now: faint
   strands in the page's own ink colour drifting slowly, taking no notice of the
   pointer, and asleep whenever it is off screen.

   It still steers around the content. Every element marked data-flow-obstacle
   is drawn into a blurred mask, and the gradient of that mask adds a tangential
   term, so strands run along the edges of the text and thin out behind it. That
   keeps the type clean without a scrim.

   Each strand is its own recent path, redrawn onto a cleared canvas every
   frame, rather than a trail left to fade. Fading an 8 bit canvas by painting
   the ground over it at low alpha never quite gets back to the ground: the last
   few levels round away, and the leftovers build into a haze. Strokes are
   batched into one path per alpha band. */

const COUNT = 950;
const TRAIL = 24; // points remembered per strand
const MASK_STEP = 4;
const ALPHA = 0.16;
const BANDS = 4;
const SPEED = 1.1;

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
    let onScreen = true;
    let ground = "#000";
    let ink = "#fff";

    let gw = 0;
    let gh = 0;
    let gradX = new Float32Array(0);
    let gradY = new Float32Array(0);

    // Strands as a struct of arrays: a ring buffer of TRAIL points each.
    let n = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let heads = new Uint8Array(0);
    let lens = new Uint8Array(0);
    let lives = new Float32Array(0);
    let spans = new Float32Array(0);

    const readColours = () => {
      ground = readToken(host, "--ground") || ground;
      ink = readToken(host, "--ink") || ink;
    };

    const spawn = (i: number, stagger: boolean) => {
      const o = i * TRAIL;
      xs[o] = Math.random() * w;
      ys[o] = Math.random() * h;
      heads[i] = 0;
      lens[i] = 1;
      spans[i] = 160 + Math.random() * 300;
      lives[i] = stagger ? Math.random() * spans[i] : 0;
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

    const bins: Path2D[] = [];

    const step = () => {
      t += 0.0012;
      for (let b = 0; b < BANDS; b++) bins[b] = new Path2D();

      for (let i = 0; i < n; i++) {
        const o = i * TRAIL;
        const head = heads[i];
        const x = xs[o + head];
        const y = ys[o + head];

        const sx = x / 560;
        const sy = y / 560;
        const a =
          Math.sin(sx * 1.9 + t * 2.1) + Math.sin(sy * 2.3 - t * 1.7) + Math.sin((sx + sy) * 1.2 + t * 0.9);
        let vx = Math.cos(a * Math.PI);
        let vy = Math.sin(a * Math.PI);

        const cx = (x / MASK_STEP) | 0;
        const cy = (y / MASK_STEP) | 0;
        if (cx > 0 && cy > 0 && cx < gw - 1 && cy < gh - 1) {
          const g = cy * gw + cx;
          const dx = gradX[g];
          const dy = gradY[g];
          const mag = Math.hypot(dx, dy);
          if (mag > 0.004) {
            const nx = dx / mag;
            const ny = dy / mag;
            const k = Math.min(mag * 9, 1);
            // Tangent dominates so a strand sweeps along an edge, with an
            // outward push strong enough that the text it passes stays clean.
            vx += -ny * 2.7 * k - nx * 2.2 * k;
            vy += nx * 2.7 * k - ny * 2.2 * k;
          }
        }

        const px = x + vx * SPEED;
        const py = y + vy * SPEED;
        lives[i]++;

        if (lives[i] > spans[i] || px < -40 || px > w + 40 || py < -40 || py > h + 40) {
          spawn(i, false);
          continue;
        }

        const next = (head + 1) % TRAIL;
        heads[i] = next;
        xs[o + next] = px;
        ys[o + next] = py;
        if (lens[i] < TRAIL) lens[i]++;

        // Strands fade in and out over their life, one alpha band at a time.
        const fade = Math.sin((lives[i] / spans[i]) * Math.PI);
        let band = (fade * BANDS) | 0;
        if (band >= BANDS) band = BANDS - 1;
        const path = bins[band];
        const len = lens[i];
        let idx = (next - len + 1 + TRAIL) % TRAIL;
        path.moveTo(xs[o + idx], ys[o + idx]);
        for (let s = 1; s < len; s++) {
          idx = (idx + 1) % TRAIL;
          path.lineTo(xs[o + idx], ys[o + idx]);
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ink;
      for (let b = 0; b < BANDS; b++) {
        ctx.globalAlpha = ALPHA * ((b + 0.5) / BANDS);
        ctx.stroke(bins[b]);
      }
      ctx.globalAlpha = 1;
    };

    // With reduced motion the field is run on for a moment and left still.
    const settle = () => {
      for (let i = 0; i < 90; i++) step();
    };

    const resize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (nw === 0 || nh === 0) return;
      if (nw !== w || nh !== h) {
        w = nw;
        h = nh;
        canvas.width = w;
        canvas.height = h;
        n = Math.round(COUNT * Math.max(0.45, Math.min(1.3, (w * h) / (1600 * 900))));
        xs = new Float32Array(n * TRAIL);
        ys = new Float32Array(n * TRAIL);
        heads = new Uint8Array(n);
        lens = new Uint8Array(n);
        lives = new Float32Array(n);
        spans = new Float32Array(n);
        for (let i = 0; i < n; i++) spawn(i, true);
      }
      buildMask();
      if (reduced) settle();
    };

    const loop = () => {
      raf = 0;
      if (disposed || !onScreen) return;
      step();
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!raf && !disposed && onScreen && !reduced) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      wake();
    });
    const ro = new ResizeObserver(resize);
    const unwatch = watchPalette(() => {
      readColours();
      if (reduced) settle();
    });

    const start = () => {
      if (disposed) return;
      readColours();
      resize();
      ro.observe(canvas);
      io.observe(canvas);
      wake();
    };

    // The obstacles are text, so their boxes are wrong until the webfonts land.
    document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unwatch();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />;
}
