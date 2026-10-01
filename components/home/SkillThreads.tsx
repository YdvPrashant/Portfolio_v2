"use client";

import { useEffect, useRef } from "react";
import { pageTop, subscribe } from "@/lib/scroll";

/* The lines between the projects and their skills, and pointing at either end.

   Every line is measured from where its two words actually sit, so the lines
   follow whatever layout the screen gets, and are drawn again whenever the
   page resizes. As the section scrolls in they draw out from each project in
   turn, scrubbed by the scroll rather than played on a timer; with reduced
   motion they are simply there. Point at a project (tab to it, or tap it on a
   touch screen) and only its lines stay, in the accent; point at a skill to
   see every project that used it. */

type Line = { path: SVGPathElement; project: string; skill: HTMLElement; hub: Hub; delay: number };
type Hub = { dot: SVGCircleElement; delay: number };
type Pointing = { kind: "project"; project: string } | { kind: "skill"; skill: HTMLElement };

const NS = "http://www.w3.org/2000/svg";
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
// Each project starts drawing a little after the one above it, each line a
// touch after its neighbour, and every line takes this share of the scroll.
const PROJECT_STEP = 0.13;
const LINE_STEP = 0.008;
const DRAW = 0.45;

/** The box around a name's letters. A wrapped name's element is as wide as
    its column, which would start the lines in empty space. */
function inkOf(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  if (!rects.length) return el.getBoundingClientRect();
  return {
    left: Math.min(...rects.map((r) => r.left)),
    right: Math.max(...rects.map((r) => r.right)),
    top: Math.min(...rects.map((r) => r.top)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  };
}

const lit = (el: Element, on: boolean) => (on ? el.setAttribute("data-lit", "") : el.removeAttribute("data-lit"));

export function SkillThreads({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const box = ref.current;
    const svg = svgRef.current;
    if (!box || !svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The lines carry the same data attributes, so name the elements exactly.
    const projects = [...box.querySelectorAll<HTMLElement>("button[data-project]")];
    const skills = [...box.querySelectorAll<HTMLElement>("li[data-skill]")];
    const usedIn = (skill: HTMLElement) => skill.dataset.usedIn?.split(" ") ?? [];

    let lines: Line[] = [];
    let hubs: Hub[] = [];
    let top = 0;
    let progress = 1;
    let on: Pointing | null = null;

    const build = () => {
      const frame = box.getBoundingClientRect();
      const rel = (r: { left: number; right: number; top: number; bottom: number }) => ({
        l: r.left - frame.left,
        r: r.right - frame.left,
        t: r.top - frame.top,
        b: r.bottom - frame.top,
      });
      svg.setAttribute("width", String(frame.width));
      svg.setAttribute("height", String(frame.height));
      svg.setAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
      svg.replaceChildren();
      lines = [];
      const byKey = new Map<string, Hub>();

      projects.forEach((button, k) => {
        const project = button.dataset.project ?? "";
        const name = rel(inkOf(button.querySelector(".nm") ?? button));
        const cx = (name.l + name.r) / 2;
        const cy = (name.t + name.b) / 2;
        let j = 0;
        for (const skill of skills) {
          if (!usedIn(skill).includes(project)) continue;
          const word = rel((skill.querySelector("[data-name]") ?? skill).getBoundingClientRect());
          const sx = (word.l + word.r) / 2;
          const sy = (word.t + word.b) / 2;
          // Leave from the side of the name that faces the word, or from below
          // it when the word sits underneath (C++ under DSA).
          let a: [number, number];
          let b: [number, number];
          if (sx < name.l) {
            a = [name.l - 16, cy];
            b = [word.r + 10, sy];
          } else if (sx > name.r) {
            a = [name.r + 16, cy];
            b = [word.l - 10, sy];
          } else {
            a = [cx, name.b + 10];
            b = [sx, word.t - 4];
          }
          const mid = (a[0] + b[0]) / 2;
          const path = document.createElementNS(NS, "path");
          path.setAttribute(
            "d",
            Math.abs(b[0] - a[0]) < 40
              ? `M${a[0]},${a[1]} L${b[0]},${b[1]}`
              : `M${a[0]},${a[1]} C${mid},${a[1]} ${mid},${b[1]} ${b[0]},${b[1]}`,
          );
          path.setAttribute("pathLength", "1");
          path.dataset.project = project;
          path.dataset.skill = skill.dataset.skill ?? "";
          svg.appendChild(path);

          const key = `${project}:${Math.round(a[0])}:${Math.round(a[1])}`;
          let hub = byKey.get(key);
          if (!hub) {
            const dot = document.createElementNS(NS, "circle");
            dot.setAttribute("cx", String(a[0]));
            dot.setAttribute("cy", String(a[1]));
            dot.setAttribute("r", "2.6");
            hub = { dot, delay: k * PROJECT_STEP };
            byKey.set(key, hub);
          }
          lines.push({ path, project, skill, hub, delay: k * PROJECT_STEP + j * LINE_STEP });
          j++;
        }
      });
      // The dots go on last so the lines run under them.
      hubs = [...byKey.values()];
      hubs.forEach((h) => svg.appendChild(h.dot));
      top = pageTop(box);
      draw();
      paint();
    };

    const draw = () => {
      const reached = new Map<HTMLElement, number>();
      for (const line of lines) {
        const t = easeOut(clamp((progress - line.delay) / DRAW, 0, 1));
        line.path.style.strokeDashoffset = (1 - t).toFixed(3);
        reached.set(line.skill, Math.max(reached.get(line.skill) ?? 0, t));
      }
      reached.forEach((t, skill) => skill.style.setProperty("--drawn", t.toFixed(3)));
      for (const h of hubs) h.dot.style.setProperty("--drawn", clamp((progress - h.delay) / 0.08, 0, 1).toFixed(2));
    };

    const paint = () => {
      const now = on;
      if (!now) {
        delete box.dataset.on;
        box.querySelectorAll("[data-lit]").forEach((el) => el.removeAttribute("data-lit"));
        return;
      }
      box.dataset.on = now.kind === "project" ? now.project : "skill";
      const isLit = (line: Line) => (now.kind === "project" ? line.project === now.project : line.skill === now.skill);
      const litProjects = now.kind === "project" ? [now.project] : usedIn(now.skill);
      lines.forEach((line) => lit(line.path, isLit(line)));
      const litHubs = new Set(lines.filter(isLit).map((line) => line.hub));
      hubs.forEach((h) => lit(h.dot, litHubs.has(h)));
      skills.forEach((s) => lit(s, now.kind === "project" ? usedIn(s).includes(now.project) : s === now.skill));
      projects.forEach((p) => lit(p, litProjects.includes(p.dataset.project ?? "")));
    };

    const point = (next: Pointing | null) => {
      on = next;
      paint();
    };
    const isOn = (p: Pointing) =>
      p.kind === "project" ? on?.kind === "project" && on.project === p.project : on?.kind === "skill" && on.skill === p.skill;

    // A mouse or pen points; a touch has no hover, so a tap toggles instead.
    const handlers: [EventTarget, string, EventListener][] = [];
    const listen = <E extends Event>(el: EventTarget, type: string, fn: (e: E) => void) => {
      el.addEventListener(type, fn as EventListener);
      handlers.push([el, type, fn as EventListener]);
    };
    const pointable = (el: EventTarget, p: Pointing) => {
      listen(el, "pointerenter", (e: PointerEvent) => e.pointerType !== "touch" && point(p));
      listen(el, "pointerleave", (e: PointerEvent) => e.pointerType !== "touch" && point(null));
      listen(el, "pointerdown", (e: PointerEvent) => e.pointerType === "touch" && point(isOn(p) ? null : p));
    };
    projects.forEach((button) => {
      const p: Pointing = { kind: "project", project: button.dataset.project ?? "" };
      pointable(button, p);
      listen(button, "focus", () => point(p));
      listen(button, "blur", () => point(null));
    });
    // On a skill, only the word itself points, not the empty end of its row.
    skills.forEach((skill) => pointable(skill.querySelector("[data-name]") ?? skill, { kind: "skill", skill }));
    // A tap anywhere else lets go.
    listen(document, "pointerdown", (e: PointerEvent) => {
      if (on && !box.contains(e.target as Node)) point(null);
    });

    const unsubscribe = subscribe({
      measure: build,
      update(y, vh) {
        progress = reduce.matches ? 1 : clamp((vh * 0.94 - (top - y)) / (vh * 0.66), 0, 1);
        draw();
      },
    });
    // The words move once the real fonts arrive, and the lines must follow.
    let alive = true;
    document.fonts.ready.then(() => alive && build());

    return () => {
      alive = false;
      unsubscribe();
      handlers.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
      point(null);
      svg.replaceChildren();
    };
  }, []);

  return (
    <div ref={ref} data-threads className="threads">
      <svg ref={svgRef} className="threads-svg" aria-hidden="true" />
      {children}
    </div>
  );
}
