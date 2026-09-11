"use client";

import { useEffect, useRef } from "react";
import { nav, person } from "@/lib/content";

/* Direction B. Overprint.
   A screenprint, not a picture of one. Two halftone screens are drawn at the
   classic 15 and 75 degree angles and composited in multiply, so the overlap
   produces a real secondary and a real rosette instead of a flat blend. The
   name is pulled three times in three inks with the registration slightly out,
   and the pointer slips the press. */

const PAPER = "#f2ede1";
const RED = "#ff3b1f";
const BLUE = "#0f3de8";
const CARBON = "#14110e";

type Screen = {
  cx: number;
  cy: number;
  r: number;
  spacing: number;
  angle: number;
  color: string;
  gamma: number;
};

function drawScreen(ctx: CanvasRenderingContext2D, s: Screen) {
  const cos = Math.cos(s.angle);
  const sin = Math.sin(s.angle);
  const steps = Math.ceil((s.r * 1.25) / s.spacing);
  ctx.fillStyle = s.color;
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const lx = i * s.spacing;
      const ly = j * s.spacing;
      const x = s.cx + lx * cos - ly * sin;
      const y = s.cy + lx * sin + ly * cos;
      const d = Math.hypot(x - s.cx, y - s.cy) / s.r;
      if (d > 1) continue;
      // Coverage runs solid at the core and breaks into dots at the rim, the
      // way a screen actually falls off.
      const rad = s.spacing * 0.66 * Math.pow(1 - d, s.gamma);
      if (rad < 0.3) continue;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default function Overprint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (w === 0 || h === 0) return;
      canvas.width = w;
      canvas.height = h;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);

      const unit = Math.min(w, h);
      const spacing = Math.max(4 * dpr, unit * 0.011);

      ctx.globalCompositeOperation = "multiply";
      drawScreen(ctx, {
        cx: w * 0.78,
        cy: h * 0.44,
        r: unit * 0.46,
        spacing,
        angle: (15 * Math.PI) / 180,
        color: RED,
        gamma: 0.9,
      });
      drawScreen(ctx, {
        cx: w * 0.62,
        cy: h * 0.52,
        r: unit * 0.3,
        spacing,
        angle: (75 * Math.PI) / 180,
        color: BLUE,
        gamma: 1.1,
      });
    };

    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    paint();
    return () => ro.disconnect();
  }, []);

  // Registration slip. Written straight to custom properties so the three ink
  // layers can be moved without re-rendering React on every pointer event.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--rx", (cx * 11).toFixed(2) + "px");
      el.style.setProperty("--ry", (cy * 11).toFixed(2) + "px");
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const type = "font-[family-name:var(--font-bricolage)] font-extrabold leading-[0.82] tracking-[-0.045em]";
  const size = "text-[clamp(3.4rem,16.5vw,14rem)]";

  return (
    <section
      ref={sectionRef}
      style={{ background: PAPER, ["--rx" as string]: "0px", ["--ry" as string]: "0px" }}
      className="grain relative isolate flex h-dvh w-full flex-col justify-between overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <nav className="relative z-20 flex flex-wrap justify-end gap-x-6 gap-y-2 px-[5.5vw] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] sm:pt-10"
        style={{ color: CARBON, mixBlendMode: "multiply" }}
      >
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="transition-opacity duration-200 hover:opacity-50">
            {item.label}
          </a>
        ))}
      </nav>

      <div className="relative z-10 px-[5.5vw] pb-2">
        <h1 className={`relative ${type} ${size}`}>
          <span className="sr-only">{person.full}</span>

          {/* Three pulls of the same forme. The plates are out of register, so
              the overlaps make their own colours. */}
          <span
            aria-hidden
            className="block"
            style={{
              color: RED,
              mixBlendMode: "multiply",
              transform: "translate(calc(var(--rx) + 7px), calc(var(--ry) + 5px))",
            }}
          >
            PRASHANT
            <br />
            YADAV
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block"
            style={{
              color: BLUE,
              mixBlendMode: "multiply",
              transform: "translate(calc(var(--rx) * -0.55 - 5px), calc(var(--ry) * -0.55 - 4px))",
            }}
          >
            PRASHANT
            <br />
            YADAV
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block"
            style={{ color: CARBON, mixBlendMode: "multiply" }}
          >
            PRASHANT
            <br />
            YADAV
          </span>
        </h1>
      </div>

      <div className="relative z-20 px-[5.5vw] pb-10">
        <p
          className="max-w-[34ch] font-mono text-[12px] leading-relaxed sm:text-[13px]"
          style={{ color: CARBON, mixBlendMode: "multiply" }}
        >
          {person.role}
        </p>
      </div>
    </section>
  );
}
