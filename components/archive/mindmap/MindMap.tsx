"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { skillRows } from "@/lib/skills";

/* Archived 2026-09-11. A radial mind map tried as an alternative to the logo
   table, and not kept.

   One centre, one ring, nothing in between.

   Every skill hangs straight off the centre. An earlier version put a labelled
   pill for each category between the centre and its tools, which added five
   boxes, five more labels and a second set of edges to read, and buried the
   logos under all of it.

   The nodes are bare logos with no discs behind them, and the edges are
   hairlines that stop short at both ends, so the ring reads as marks on a field
   rather than as a diagram of bubbles. Pointing at any one of them writes its
   name into the centre, which is what earns the logos the right to stay
   unlabelled.

   Positions are spaced evenly along the ellipse by arc length, not by angle.
   Even angles bunch nodes together at the ends of the major axis, which on a
   wide ellipse looks like a mistake. Tools stay in their resume groupings as
   they go round, so related things sit together without needing to be labelled.

   Parallax is written straight to a transform in rAF, so following the pointer
   does not re-render twenty six nodes a frame. */

const GROUND = "#053c2b";
const BONE = "#f4f1e9";
const ACID = "#e9ff3d";
const INK = "#0b0b0b";

const DISCIPLINE = { label: "Photography & graphic design", href: "/work" };

type Cfg = {
  w: number;
  h: number;
  rx: number;
  ry: number;
  centreR: number;
  logo: number;
  pillW: number;
  pillH: number;
};

const WIDE: Cfg = { w: 1600, h: 980, rx: 600, ry: 358, centreR: 122, logo: 44, pillW: 404, pillH: 88 };
const TALL: Cfg = { w: 900, h: 1400, rx: 330, ry: 552, centreR: 98, logo: 38, pillW: 340, pillH: 78 };

const rad = (deg: number) => (deg * Math.PI) / 180;

/* Even spacing by arc length. Sample the arc once, then walk the cumulative
   length and take the angle at each equal step. */
function spaceByArc(rx: number, ry: number, from: number, sweep: number, n: number) {
  const SAMPLES = 1400;
  const angles: number[] = [];
  const lengths: number[] = [0];
  let prevX = rx * Math.cos(from);
  let prevY = ry * Math.sin(from);
  angles.push(from);
  let total = 0;

  for (let i = 1; i <= SAMPLES; i++) {
    const a = from + (sweep * i) / SAMPLES;
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    total += Math.hypot(x - prevX, y - prevY);
    angles.push(a);
    lengths.push(total);
    prevX = x;
    prevY = y;
  }

  const out: number[] = [];
  let cursor = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * (k + 0.5)) / n;
    while (cursor < lengths.length - 1 && lengths[cursor] < target) cursor++;
    out.push(angles[cursor]);
  }
  return out;
}

export default function MindMap() {
  const [active, setActive] = useState<string | null>(null);
  const [cfg, setCfg] = useState<Cfg>(WIDE);
  const driftRef = useRef<SVGGElement>(null);
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCfg(mq.matches ? TALL : WIDE);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const g = driftRef.current;
    if (!g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      g.setAttribute("transform", `translate(${(cx * 20).toFixed(2)} ${(cy * 14).toFixed(2)})`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const { cx, cy, nodes, disc } = useMemo(() => {
    const cx = cfg.w / 2;
    const cy = cfg.h / 2;
    // Flattened in resume order, so related tools stay neighbours on the ring.
    const flat = skillRows.flatMap((r) => r.items);
    // The top of the ring is reserved for the one bright node, which is much
    // wider than a logo and needs the clearance.
    const GAP = 26;
    const angles = spaceByArc(cfg.rx, cfg.ry, rad(-90 + GAP), rad(360 - GAP * 2), flat.length);
    const nodes = flat.map((item, i) => ({
      ...item,
      x: cx + Math.cos(angles[i]) * cfg.rx,
      y: cy + Math.sin(angles[i]) * cfg.ry,
    }));
    return { cx, cy, nodes, disc: { x: cx, y: cy - cfg.ry } };
  }, [cfg]);

  // Hairline from just outside the centre to just short of the node, so nothing
  // runs underneath either mark.
  const spoke = (x: number, y: number, pad: number, on: boolean, key: string) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;
    return (
      <line
        key={key}
        x1={cx + ux * (cfg.centreR + 16)}
        y1={cy + uy * (cfg.centreR + 16)}
        x2={x - ux * pad}
        y2={y - uy * pad}
        stroke={on ? ACID : BONE}
        strokeWidth={on ? 1.7 : 1}
        strokeOpacity={on ? 0.95 : 0.17}
      />
    );
  };

  const label = active ?? "Skills";
  const centreSize = Math.min(cfg.centreR * 0.5, (cfg.centreR * 1.66) / (label.length * 0.56));

  /* minHeight is set inline rather than with a utility class: a flex item
     defaults to min-height auto, and an SVG with a viewBox has an intrinsic
     aspect ratio, so without this the box grows to the height its own width
     implies and pushes the bottom of the ring off screen. */
  return (
    <div className="relative w-full flex-1" style={{ background: GROUND, minHeight: 0 }}>
      <svg
        viewBox={`0 0 ${cfg.w} ${cfg.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="Mind map of technical skills"
        onPointerLeave={() => setActive(null)}
      >
        <g ref={driftRef}>
          {nodes.map((n) => spoke(n.x, n.y, cfg.logo * 0.82, active === n.name, "s-" + n.name))}
          {spoke(disc.x, disc.y, cfg.pillH * 0.62, active === DISCIPLINE.label, "s-disc")}

          {nodes.map((n) => {
            const on = active === n.name;
            return (
              <g
                key={n.name}
                onPointerEnter={() => setActive(n.name)}
                onPointerDown={() => setActive(n.name)}
                style={{ cursor: "default" }}
              >
                {/* Invisible hit area, so a thin logo is still easy to point at. */}
                <circle cx={n.x} cy={n.y} r={cfg.logo * 0.82} fill="transparent" />
                <g
                  transform={`translate(${n.x - cfg.logo / 2} ${n.y - cfg.logo / 2}) scale(${cfg.logo / 24})`}
                  fill={on ? ACID : BONE}
                  fillOpacity={on ? 1 : 0.82}
                  style={{ transition: "fill 150ms linear" }}
                >
                  <path d={n.path} />
                </g>
                <title>{n.name}</title>
              </g>
            );
          })}

          <g
            onPointerEnter={() => setActive(DISCIPLINE.label)}
            onPointerDown={() => setActive(DISCIPLINE.label)}
            onClick={() => router.push(DISCIPLINE.href)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={disc.x - cfg.pillW / 2}
              y={disc.y - cfg.pillH / 2}
              width={cfg.pillW}
              height={cfg.pillH}
              rx={cfg.pillH / 2}
              fill={ACID}
            />
            <text
              x={disc.x}
              y={disc.y - cfg.pillH * 0.14}
              textAnchor="middle"
              dominantBaseline="central"
              fill={INK}
              fontSize={cfg.pillH * 0.28}
              style={{ fontFamily: "var(--font-archivo)", fontWeight: 800 }}
            >
              Photography &amp;
            </text>
            <text
              x={disc.x}
              y={disc.y + cfg.pillH * 0.2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={INK}
              fontSize={cfg.pillH * 0.28}
              style={{ fontFamily: "var(--font-archivo)", fontWeight: 800 }}
            >
              graphic design
            </text>
            <title>Photography and graphic design</title>
          </g>

          <circle
            cx={cx}
            cy={cy}
            r={cfg.centreR}
            fill="none"
            stroke={active ? ACID : BONE}
            strokeOpacity={active ? 0.85 : 0.4}
            strokeWidth={1.4}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={active ? ACID : BONE}
            fontSize={centreSize}
            letterSpacing="-0.02em"
            style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, textTransform: "uppercase" }}
          >
            {label}
          </text>
        </g>
      </svg>
    </div>
  );
}
