"use client";

import { useEffect, useRef } from "react";
import { nav, person } from "@/lib/content";

/* Direction A. Ink Field.
   Particles advect through a sum of sines current. The name is rasterised to a
   blurred mask, and the gradient of that mask contributes a tangential term, so
   ink races along the contours of the letterforms instead of merely avoiding
   them. The pointer adds vorticity. Everything composites additively over a
   deep indigo ground, so crossing currents bloom into magenta and cyan. The
   ground is kept dark on purpose: additive ink over an already bright field has
   no headroom left to glow into.

   Two canvases. The ink runs at 1x because a full canvas fill every frame is
   the dominant cost and the ink is soft by nature. The name gets its own 2x
   canvas painted once per resize, so the type stays crisp without being
   repainted sixty times a second. Both are laid out from one set of
   measurements in CSS pixels, so the current and the letterforms cannot drift
   apart. */

const GROUND = "#0d0140";
// All three chromatic. A white ink lifts every channel at once, which turns
// the ground grey long before the filaments look bright.
const INKS = ["rgb(255,40,170)", "rgb(255,72,28)", "rgb(0,224,190)"];

const COUNT = 3200;
const MASK_STEP = 4; // mask sampled once per 4 CSS px
const ALPHA = 0.18; // peak deposition per segment
const DECAY = 0.016; // pull back toward the ground per frame
const BANDS = 5; // alpha buckets, so strokes batch into few paths

type P = { x: number; y: number; px: number; py: number; life: number; max: number; ink: number };

export default function InkField() {
  const inkRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const inkCanvas = inkRef.current;
    const nameCanvas = nameRef.current;
    if (!inkCanvas || !nameCanvas) return;
    const ctx = inkCanvas.getContext("2d", { alpha: false });
    const nctx = nameCanvas.getContext("2d");
    if (!ctx || !nctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim() ||
      "sans-serif";

    let w = 0; // CSS px, and the coordinate space every particle lives in
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
      p.ink = r < 0.3 ? 0 : r < 0.62 ? 1 : 2;
    };

    const layout = () => {
      const pad = Math.max(w * 0.055, 22);
      const measure = w - pad * 2;
      nctx.setTransform(1, 0, 0, 1, 0, 0);
      nctx.font = "900 100px " + family;
      const fit = (word: string) => (measure / nctx.measureText(word).width) * 100;
      // One size for both lines so the block reads as a single mass.
      const size = Math.min(fit("PRASHANT"), fit("YADAV"), h * 0.42);
      const leading = size * 0.86;
      return { pad, size, leading, top: h * 0.5 - leading + size * 0.76 };
    };

    type L = ReturnType<typeof layout>;

    const paintName = (l: L) => {
      const ndpr = Math.min(window.devicePixelRatio || 1, 2);
      nameCanvas.width = Math.floor(w * ndpr);
      nameCanvas.height = Math.floor(h * ndpr);
      nctx.setTransform(ndpr, 0, 0, ndpr, 0, 0);
      nctx.clearRect(0, 0, w, h);
      nctx.font = "900 " + l.size + "px " + family;
      nctx.textBaseline = "alphabetic";
      nctx.fillStyle = "#ffffff";
      nctx.fillText("PRASHANT", l.pad, l.top);
      nctx.fillText("YADAV", l.pad, l.top + l.leading);
    };

    const buildMask = (l: L) => {
      gw = Math.max(2, Math.ceil(w / MASK_STEP));
      gh = Math.max(2, Math.ceil(h / MASK_STEP));
      const mc = document.createElement("canvas");
      mc.width = gw;
      mc.height = gh;
      const mx = mc.getContext("2d", { willReadFrequently: true });
      if (!mx) return;
      // Drawn straight at mask scale rather than downsampled, so the blur is
      // applied to clean letterforms instead of to aliasing.
      mx.filter = "blur(" + Math.max(1, l.size / (MASK_STEP * 7)) + "px)";
      mx.font = "900 " + l.size / MASK_STEP + "px " + family;
      mx.textBaseline = "alphabetic";
      mx.fillStyle = "#fff";
      mx.fillText("PRASHANT", l.pad / MASK_STEP, l.top / MASK_STEP);
      mx.fillText("YADAV", l.pad / MASK_STEP, (l.top + l.leading) / MASK_STEP);

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
      const nw = inkCanvas.clientWidth;
      const nh = inkCanvas.clientHeight;
      if (nw === 0 || nh === 0 || (nw === w && nh === h)) return;
      w = nw;
      h = nh;

      // The ink layer stays at 1x on purpose. It is the per frame cost.
      inkCanvas.width = w;
      inkCanvas.height = h;

      const l = layout();
      paintName(l);
      buildMask(l);

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
    };

    // One path per ink per alpha band. Fifteen stroke calls a frame instead of
    // one per particle, which is the difference between this running and not.
    const bins: Path2D[] = [];

    const step = () => {
      t += 0.0022;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = GROUND;
      ctx.globalAlpha = DECAY;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < INKS.length * BANDS; i++) bins[i] = new Path2D();

      const pr = 260;

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;

        const sx = p.x / 520;
        const sy = p.y / 520;
        // Three incommensurate sines stand in for curl noise, so the current
        // never visibly repeats.
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
            // Tangent dominates, with a smaller outward nudge, so ink sweeps
            // along an edge rather than piling into it.
            vx += -ny * 3.1 * k - nx * 1.15 * k;
            vy += nx * 3.1 * k - ny * 1.15 * k;
          }
        }

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const f = 1 / (1 + (dx * dx + dy * dy) / (pr * pr));
          vx += -dy * 0.011 * f;
          vy += dx * 0.011 * f;
        }

        p.x += vx * 1.9;
        p.y += vy * 1.9;
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
      ctx.lineWidth = 1.4;
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
      const r = inkCanvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const ro = new ResizeObserver(resize);

    const start = () => {
      if (disposed) return;
      resize();
      ro.observe(inkCanvas);
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      if (reduced) {
        for (let i = 0; i < 320; i++) step();
      } else {
        loop();
      }
    };

    // Canvas text metrics are wrong until the webfont is actually available.
    document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section style={{ background: GROUND }} className="relative isolate h-dvh w-full overflow-hidden">
      <canvas ref={inkRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={nameRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <h1 className="sr-only">{person.full}</h1>

      <nav className="absolute right-[5.5vw] top-8 z-10 flex flex-wrap justify-end gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 sm:top-10">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="transition-colors duration-200 hover:text-white">
            {item.label}
          </a>
        ))}
      </nav>

      <p className="absolute bottom-10 left-[5.5vw] z-10 max-w-[30ch] font-mono text-[12px] leading-relaxed text-white/80 sm:text-[13px]">
        {person.role}
      </p>
    </section>
  );
}
