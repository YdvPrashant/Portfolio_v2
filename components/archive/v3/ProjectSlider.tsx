"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SiteNav from "@/components/archive/v3/ArchivedNav";
import PipelineDiagram from "@/components/archive/v3/PipelineDiagram";
import { projects } from "@/lib/content";

/* Three projects side by side, never stacked.

   A horizontal scroll-snap track rather than a carousel library: the browser
   already does snapping, momentum and touch swiping properly, so the only
   things written here are the ways a desktop mouse can drive it. A wheel
   gesture advances exactly one panel and then locks briefly, which is steadier
   than mapping wheel delta straight onto scrollLeft and fighting the snap.

   Each project owns a ground from the site palette, and the nav takes its ink
   from whichever panel you are on, so sliding repaints the whole page.

   No drag-to-scroll. It would have to suppress clicks past a movement
   threshold and disable snapping mid-gesture, and every panel here has links
   in it. Wheel, arrow keys, the index and a real scrollbar gesture cover it. */

const THEME: Record<string, { ground: string; on: string; rule: string }> = {
  prism: { ground: "#e9ff3d", on: "#0b0b0b", rule: "rgba(11,11,11,0.25)" },
  conflict: { ground: "#7b3dff", on: "#ffffff", rule: "rgba(255,255,255,0.32)" },
  ctximg: { ground: "#f4f1e9", on: "#0b0b0b", rule: "rgba(11,11,11,0.22)" },
};

export default function ProjectSlider({ images }: { images: Record<string, string | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(projects.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }, []);

  // Read the index back off the scroll position, so it stays right however the
  // track was moved: keys, wheel, touch or the scrollbar itself.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.clientWidth) setIndex(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(Math.round(el.scrollLeft / el.clientWidth) + 1);
      if (e.key === "ArrowLeft") goTo(Math.round(el.scrollLeft / el.clientWidth) - 1);
    };

    // One gesture, one panel. The lock stops a single flick of an inertial
    // trackpad from skipping the whole set.
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // real horizontal scroll, leave it

      /* On a short viewport the text column scrolls. Let it consume the wheel
         until it reaches its own end, then start moving the track: without
         this, preventDefault below would make the overflowing text
         unreachable. */
      const col = (e.target as Element | null)?.closest?.("[data-col]") as HTMLElement | null;
      if (col && col.scrollHeight > col.clientHeight + 1) {
        const atTop = col.scrollTop <= 0;
        const atEnd = col.scrollTop + col.clientHeight >= col.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return;
      }

      e.preventDefault();
      if (locked || Math.abs(e.deltaY) < 12) return;
      locked = true;
      window.setTimeout(() => (locked = false), 620);
      goTo(Math.round(el.scrollLeft / el.clientWidth) + (e.deltaY > 0 ? 1 : -1));
    };

    window.addEventListener("keydown", onKey);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("wheel", onWheel);
    };
  }, [goTo]);

  const theme = THEME[projects[index]?.id] ?? THEME.prism;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className="pointer-events-auto transition-colors duration-500">
          <SiteNav tone={theme.on} />
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p) => {
          const t = THEME[p.id];
          const src = images[p.id];
          return (
            <section
              key={p.id}
              style={{ background: t.ground, color: t.on }}
              /* On a phone the panel scrolls as one piece. It used to be a
                 fixed height box with the text column scrolling inside it,
                 which cut every project's copy off mid sentence where the
                 screenshot began and hid the rest behind a nested scrollbar
                 nobody would find. Sliding between projects is still
                 horizontal; only the reading is vertical. */
              className="flex h-full w-full shrink-0 snap-center flex-col overflow-y-auto [scrollbar-width:none] lg:flex-row lg:overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            >
              <div
                data-col
                /* The gap only matters on a phone: there the column is its own
                   height and justify-between has no slack to spend, so the
                   stack row sat against the last bullet. */
                className="flex min-h-0 shrink-0 flex-col justify-between gap-10 px-[5.5vw] pb-[5vh] pt-[13vh] lg:gap-0 [scrollbar-width:none] lg:w-[45%] lg:flex-1 lg:shrink lg:overflow-y-auto lg:pb-[10vh] lg:pr-[3vw] lg:pt-[12vh] [&::-webkit-scrollbar]:hidden"
              >
                <div>
                  <div
                    className="flex items-baseline gap-4 border-b pb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
                    style={{ borderColor: t.rule }}
                  >
                    <span>{p.index}</span>
                    <span className="opacity-60">{p.period}</span>
                  </div>

                  <h2 className="mt-6 font-[family-name:var(--font-archivo)] text-[clamp(2rem,4.2vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
                    {p.title}
                  </h2>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] opacity-60">{p.kicker}</p>

                  <p className="mt-5 max-w-[48ch] text-[clamp(0.95rem,1.05vw,1.08rem)] leading-[1.6]">
                    {p.summary}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {p.points.map((point) => (
                      <li
                        key={point.slice(0, 20)}
                        className="border-t pt-3 text-[11.5px] leading-[1.6] opacity-75"
                        style={{ borderColor: t.rule }}
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.14em] opacity-60">
                    {p.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </p>

                  <a
                    href={p.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-5 inline-flex items-baseline gap-3 border-t pt-4 font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ borderColor: t.rule }}
                  >
                    <span className="opacity-55">Open</span>
                    <span className="font-[family-name:var(--font-archivo)] text-[clamp(1.1rem,2vw,1.7rem)] font-black uppercase tracking-[-0.03em] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                      {p.link.label}
                    </span>
                  </a>
                </div>
              </div>

              {/* A definite height on a phone, where the panel scrolls and
                  flex-1 would have nothing left to divide. */}
              <div className="flex h-[54vh] shrink-0 flex-col px-[5.5vw] pb-[13vh] pt-0 lg:h-auto lg:min-h-0 lg:w-[55%] lg:flex-1 lg:px-0 lg:pr-[5.5vw] lg:pt-[15vh]">
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  {src ? (
                    <Image
                      src={src}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1023px) 90vw, 50vw"
                      /* contain, not cover: these are interface screenshots,
                         and cropping one cuts off the very thing it is there to
                         show. The panel colour fills whatever is left over. */
                      className="object-contain object-top"
                    />
                  ) : p.id === "conflict" ? (
                    // This one has no interface to screenshot, so it gets a
                    // drawing of its architecture rather than a faked one.
                    <PipelineDiagram />
                  ) : (
                    <Placeholder id={p.id} rule={t.rule} on={t.on} />
                  )}
                </div>

                <div
                  className="mt-5 flex items-baseline justify-between gap-6 border-t pt-4"
                  style={{ borderColor: t.rule }}
                >
                  <span className="font-[family-name:var(--font-archivo)] text-[clamp(2rem,4.6vw,3.8rem)] font-black leading-none tracking-[-0.04em]">
                    {p.metric.value}
                  </span>
                  <span className="max-w-[26ch] text-right font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] opacity-60">
                    {p.metric.label}
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-[5.5vw] pb-7">
        <div className="pointer-events-auto flex items-center gap-5" style={{ color: theme.on }}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              aria-current={i === index ? "true" : undefined}
              className={
                "-my-3 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity duration-200 " +
                (i === index ? "opacity-100" : "opacity-40 hover:opacity-75")
              }
            >
              {p.index}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex items-center gap-4" style={{ color: theme.on }}>
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous project"
            className="-m-3 p-3 font-mono text-[15px] transition-opacity duration-200 disabled:opacity-25"
          >
            &larr;
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === projects.length - 1}
            aria-label="Next project"
            className="-m-3 p-3 font-mono text-[15px] transition-opacity duration-200 disabled:opacity-25"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

/* Deliberately reads as missing rather than as a design decision, and names the
   file that would replace it. */
function Placeholder({ id, rule, on }: { id: string; rule: string; on: string }) {
  return (
    <div className="absolute inset-0">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <rect x="0.3" y="0.3" width="99.4" height="99.4" fill="none" stroke={rule} strokeWidth="0.6" />
        <line x1="0.3" y1="0.3" x2="99.7" y2="99.7" stroke={rule} strokeWidth="0.4" />
        <line x1="99.7" y1="0.3" x2="0.3" y2="99.7" stroke={rule} strokeWidth="0.4" />
      </svg>
      <span
        className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] opacity-45"
        style={{ color: on }}
      >
        public/projects/{id}.jpg
      </span>
    </div>
  );
}
