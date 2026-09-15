"use client";

import { useEffect, useRef } from "react";
import { readToken, watchPalette } from "@/lib/tokens";

/* A few dozen specks drifting slowly behind the About opening, like dust in a
   beam of light.

   Asked for as "some animation particle effect, but don't overdo it like
   earlier", earlier being a field of thousands of streaking lines with a swirl
   that chased the cursor. So these are few, small, slow and faint, and square to
   match the pixel portrait. Each has a depth that sets its size, its brightness
   and how far it shifts when the pointer moves, which tilts the whole field a
   few pixels for depth; nothing gathers around the pointer. A handful are in
   the accent.

   The loop stops while the opening is off screen, and for reduced motion the
   field is drawn once and left still. */

type Mote = { x: number; y: number; z: number; size: number; drift: number; phase: number; accent: boolean };

const PER_PIXEL = 1 / 22000; // about fifty five on a laptop screen
const MAX = 90;
const TILT = 14; // px of shift at full depth

export default function Motes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let motes: Mote[] = [];
    let ink = "#ffffff";
    let accent = "#ffffff";
    let raf = 0;
    let t = 0;
    let onScreen = true;
    let disposed = false;
    // Pointer tilt, as a target and an eased follower, each -0.5 to 0.5.
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const readColours = () => {
      ink = readToken(canvas, "--ink") || ink;
      accent = readToken(canvas, "--accent") || accent;
    };

    const seed = () => {
      const count = Math.min(MAX, Math.round(w * h * PER_PIXEL));
      motes = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          size: 1 + z * 1.8,
          drift: 0.05 + z * 0.15,
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() < 0.14,
        };
      });
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.8 + m.phase);
        ctx.globalAlpha = (0.1 + m.z * 0.32) * twinkle;
        ctx.fillStyle = m.accent ? accent : ink;
        ctx.fillRect(m.x - cx * TILT * m.z, m.y - cy * TILT * m.z, m.size, m.size);
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (!nw || !nh) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const changed = nw !== w || nh !== h;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (changed) seed();
      draw();
    };

    const step = () => {
      t += 1 / 60;
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      for (const m of motes) {
        m.y -= m.drift;
        m.x += Math.sin(t * 0.35 + m.phase) * 0.06;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        if (m.x < -4) m.x = w + 4;
        else if (m.x > w + 4) m.x = -4;
      }
      draw();
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

    const onPointer = (e: PointerEvent) => {
      tx = e.clientX / (window.innerWidth || 1) - 0.5;
      ty = e.clientY / (window.innerHeight || 1) - 0.5;
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      wake();
    });
    const ro = new ResizeObserver(resize);
    const unwatch = watchPalette(() => {
      readColours();
      draw();
    });

    readColours();
    resize();
    ro.observe(canvas);
    io.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unwatch();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />;
}
