"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { figures, projects, type Figure } from "@/lib/content";

/* Measured, on one screen (after Lando Norris's Site of the Year stats: huge
   condensed numerals, small labels, and marks drawn over them by hand).

   The figures roll up like an odometer the first time they are seen. The
   figures that improved carry where they started, struck through with a
   proofreader's pen; point at one and it rolls back to that number, then
   forward again when you leave. The others spin once more when pointed at.
   The pen marks draw themselves in after the numbers land. */

// Each digit's strip holds 0 to 9 four times, so a roll can spin a full turn.
const TURNS = 4;
const REST = 2; // the turn a digit rests on
const DIGITS = Array.from({ length: 10 * TURNS }, (_, i) => i % 10);

function Odometer({ text, turn, delay }: { text: string; turn: number; delay: number }) {
  let col = 0;
  return (
    <span className="odo" aria-hidden="true">
      {Array.from(text).map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} className="odo-char">
              {ch}
            </span>
          );
        }
        const k = col++;
        return (
          <span key={i} className="odo-col">
            <span
              className="odo-strip"
              style={
                {
                  "--n": turn * 10 + Number(ch),
                  "--delay": `${delay + k * 90}ms`,
                } as React.CSSProperties
              }
            >
              {DIGITS.map((d, j) => (
                <span key={j}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** A caption with one word ringed or underlined in pen. */
function Caption({ figure }: { figure: Figure }) {
  const mark = figure.mark;
  if (!mark) return <>{figure.label}</>;
  const [head, ...rest] = figure.label.split(mark.word);
  return (
    <>
      {head}
      <span className="pen-word">
        {mark.word}
        <svg className={`pen pen-${mark.kind}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          {mark.kind === "ring" ? (
            <path pathLength={1} d="M52 5 C 22 3, 3 12, 5 23 C 7 35, 44 38, 72 34 C 96 30, 99 14, 82 8 C 66 2, 36 4, 20 9" />
          ) : (
            <path pathLength={1} d="M2 30 C 18 26, 30 34, 46 30 C 62 26, 76 33, 98 28" />
          )}
        </svg>
      </span>
      {rest.join(mark.word)}
    </>
  );
}

function Stat({ figure, seen, armed, index }: { figure: Figure; seen: boolean; armed: boolean; index: number }) {
  // Turns: REST at rest, REST - 1 rolled back to `before`, REST + 1 for the
  // extra spin of a figure that has no `before`. 0 until it has been seen.
  const [turn, setTurn] = useState(REST);
  const [back, setBack] = useState(false);
  const [touched, setTouched] = useState(false);
  const project = projects.find((p) => p.slug === figure.slug);
  const shown = back && figure.before ? figure.before : figure.value;
  // Real numbers until the page knows the section is off screen; then zero,
  // ready to roll when it arrives.
  const current = !seen && armed ? 0 : back ? REST - 1 : turn;

  const enter = () => {
    if (!seen) return;
    setTouched(true);
    if (figure.before) setBack(true);
    else setTurn((t) => (t === REST ? REST + 1 : REST));
  };
  const leave = () => setBack(false);
  // A touch has no hover, so a tap toggles instead.
  const tap = () => {
    if (!seen) return;
    setTouched(true);
    if (figure.before) setBack((b) => !b);
    else setTurn((t) => (t === REST ? REST + 1 : REST));
  };

  return (
    <figure
      className="measure"
      onPointerEnter={(e) => e.pointerType !== "touch" && enter()}
      onPointerLeave={(e) => e.pointerType !== "touch" && leave()}
      onPointerDown={(e) => e.pointerType === "touch" && tap()}
      onFocus={enter}
      onBlur={leave}
      tabIndex={0}
      data-back={back || undefined}
    >
      <p className="measure-before t-mono">
        {figure.before ? (
          <>
            <span className="pen-word">
              {figure.before}
              {figure.unit}
              <svg className="pen pen-strike" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength={1} d="M-4 24 C 20 18, 44 27, 64 20 C 80 15, 92 19, 104 16" />
              </svg>
            </span>
            <span className="measure-then"> before</span>
          </>
        ) : (
          " "
        )}
      </p>
      <p className="measure-figure">
        <Odometer text={shown} turn={current} delay={touched ? 0 : index * 140} />
        <span className="measure-unit">{figure.unit}</span>
        <span className="sr-only">
          {figure.value}
          {figure.unit}
          {figure.before ? `, down from ${figure.before}${figure.unit}` : ""}
        </span>
      </p>
      <figcaption className="t-small mt-3 max-w-[30ch] text-muted">
        <Caption figure={figure} />
      </figcaption>
      {project && (
        <Link
          href={`/work/${project.slug}`}
          transitionTypes={["nav-forward"]}
          className="t-mono hit mt-4 inline-block text-muted transition-colors hover:text-fg"
        >
          {project.index} {project.title} &rarr;
        </Link>
      )}
    </figure>
  );
}

export function Measured() {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        } else setArmed(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="measured"
      ref={ref}
      data-theme="paper"
      data-seen={seen || undefined}
      data-armed={armed || undefined}
      aria-labelledby="measured-title"
      className="measured px-pad py-[clamp(80px,12vh,150px)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <h2 id="measured-title" className="t-xxl">
          Measured
        </h2>
        <p className="t-m max-w-[36ch] text-muted">
          Timed or counted on the systems themselves.{" "}
          <span className="pointer-coarse:hidden">Point at a number to see where it started.</span>
          <span className="hidden pointer-coarse:inline">Tap a number to see where it started.</span>
        </p>
      </div>

      <div className="mt-[clamp(32px,6vh,64px)] grid grid-cols-2 border-t border-fg lg:grid-cols-4">
        {figures.lead.map((f, i) => (
          <Stat key={f.value + f.slug} figure={f} seen={seen} armed={armed} index={i} />
        ))}
      </div>

      <ul className="t-small grid gap-x-6 gap-y-3 border-t border-rule pt-5 sm:grid-cols-2 lg:grid-cols-5">
        {figures.more.map((m) => (
          <li key={m.label} className="flex items-baseline gap-2.5">
            <span className="font-[680] whitespace-nowrap text-fg">{m.value}</span>
            <span className="text-muted">{m.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
