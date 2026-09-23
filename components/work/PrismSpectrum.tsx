"use client";

import { useEffect, useRef } from "react";

/* Prism's six stage analysis, drawn as what the name promises: one beam in,
   six readings out. The pointer is the light source; move it and the beam
   swings and the fan of stages opens and closes. It rests when you stop.
   The stages are the six named in the resume. */

const STAGES = [
  { label: "Claims", colour: "#ff453a" },
  { label: "Opinion", colour: "#ff9f0a" },
  { label: "Rhetoric", colour: "#ffd60a" },
  { label: "Source provenance", colour: "#32d74b" },
  { label: "Live fact checking", colour: "#0a84ff" },
  { label: "Coverage gaps", colour: "#bf5af2" },
];

// Geometry in viewBox units.
const VB = { w: 1600, h: 720 };
const PRISM = { top: [610, 150], left: [420, 520], right: [800, 520] } as const;
const ENTRY = [515, 335]; // on the left face
const EXIT = [705, 335]; // on the right face
const LABEL_X = 1190;

export function PrismSpectrum() {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const beam = el.querySelector<SVGLineElement>("[data-beam]");
    const inner = el.querySelector<SVGLineElement>("[data-inner]");
    const rays = [...el.querySelectorAll<SVGPathElement>("[data-ray]")];
    const labels = [...el.querySelectorAll<SVGGElement>("[data-label]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let target = 0.5;
    let now = 0.5;
    let raf = 0;

    const render = (a: number) => {
      // a: 0 (source high) to 1 (source low).
      const sourceY = 120 + a * 480;
      beam?.setAttribute("y1", String(sourceY));
      // The angle of incidence changes how far the colours spread.
      const spread = 34 + Math.abs(a - 0.5) * 70;
      const centre = 335 + (a - 0.5) * 120;
      rays.forEach((ray, i) => {
        const y = centre + (i - 2.5) * spread;
        const bend = LABEL_X - 150;
        ray.setAttribute("d", `M${EXIT[0]} ${EXIT[1]} L${bend} ${y} L${LABEL_X - 16} ${y}`);
        labels[i]?.setAttribute("transform", `translate(${LABEL_X} ${y})`);
      });
      inner?.setAttribute("y1", String(ENTRY[1]));
    };

    const tick = () => {
      now += (target - now) * 0.1;
      render(now);
      raf = Math.abs(target - now) > 0.001 ? requestAnimationFrame(tick) : 0;
    };

    const move = (e: PointerEvent) => {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      target = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    render(now);
    const zone = el.closest("section") ?? el;
    zone.addEventListener("pointermove", move as EventListener);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", move as EventListener);
    };
  }, []);

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      role="img"
      aria-label="Diagram: one beam of light enters a prism and leaves as six coloured rays, labelled claims, opinion, rhetoric, source provenance, live fact checking and coverage gaps."
      className="h-auto w-full touch-pan-y"
    >
      {/* incoming white beam */}
      <line data-beam x1={0} y1={335} x2={ENTRY[0]} y2={ENTRY[1]} stroke="#f0efeb" strokeWidth={3} />
      {/* inside the glass */}
      <line data-inner x1={ENTRY[0]} y1={ENTRY[1]} x2={EXIT[0]} y2={EXIT[1]} stroke="#f0efeb" strokeOpacity={0.55} strokeWidth={3} />
      {/* six rays */}
      {STAGES.map((s) => (
        <path key={s.label} data-ray fill="none" stroke={s.colour} strokeWidth={3} strokeLinejoin="round" />
      ))}
      {/* the prism */}
      <polygon
        points={`${PRISM.top.join(" ")} ${PRISM.left.join(" ")} ${PRISM.right.join(" ")}`}
        fill="rgb(240 239 235 / 0.05)"
        stroke="#f0efeb"
        strokeWidth={2}
      />
      {STAGES.map((s, i) => (
        <g key={s.label} data-label>
          <circle r={7} fill={s.colour} />
          <text x={22} y={9} fill="#f0efeb" fontSize={26} style={{ fontFamily: "var(--font-mona)", fontWeight: 520 }}>
            <tspan fill="#9a9a95" style={{ fontFamily: "var(--font-mono)" }} fontSize={20}>
              {String(i + 1).padStart(2, "0")}
            </tspan>{" "}
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
