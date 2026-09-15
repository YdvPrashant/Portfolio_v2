"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Arrow from "@/components/Arrow";
import NextLink from "@/components/NextLink";
import PipelineDiagram from "@/components/projects/PipelineDiagram";
import { projects } from "@/lib/content";

/* Three projects side by side, never stacked.

   A horizontal scroll-snap track rather than a carousel library: the browser
   already does snapping, momentum and touch swiping properly, so the only
   things written here are the ways a desktop mouse can drive it. A wheel
   gesture advances exactly one panel and then locks briefly, which is steadier
   than mapping wheel delta straight onto scrollLeft and fighting the snap.

   Each project owns a ground. With the calm palette they alternate between the
   page ground and the raised one rather than taking a neon each, so sliding
   still changes the room without the nav having to change its ink.

   Restored on 2026-09-15 after a sparser version was set aside ("project
   section was good so keep it like that"); that one is at /archive/v4. The
   changes from the original are deliberately minor: palette colours, build
   notes a size up so they can be read, drawn arrows, the last slide leading on
   to DSA, a one line hint on how to move, and the first screenshot loading at
   once.

   No drag-to-scroll. It would have to suppress clicks past a movement threshold
   and disable snapping mid-gesture, and every panel has links in it. Wheel,
   arrow keys, the index and touch cover it. */

const GROUND: Record<string, string> = {
  prism: "bg-ground",
  conflict: "bg-raised",
  ctximg: "bg-ground",
};

export default function ProjectSlider({ images }: { images: Record<string, string | null> }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [moved, setMoved] = useState(false);
  const last = projects.length - 1;

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(projects.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }, []);

  // Read the index back off the scroll position, so it stays right however the
  // track was moved: keys, wheel, touch, the index, or a link to #ctximg.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(i);
      if (i > 0) setMoved(true);
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    // A link to /projects#ctximg lands on that slide, including on a fresh load.
    const target = projects.findIndex((p) => "#" + p.id === window.location.hash);
    if (target > 0) el.scrollLeft = target * el.clientWidth;

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") goTo(Math.round(track.scrollLeft / track.clientWidth) + 1);
      if (e.key === "ArrowLeft") goTo(Math.round(track.scrollLeft / track.clientWidth) - 1);
    };

    // One gesture, one panel. The lock stops a single flick of an inertial
    // trackpad from skipping the whole set.
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // a real horizontal scroll, leave it

      /* Anything marked data-col that can still scroll the way the wheel is
         going takes the wheel first: the text column on a short window, or the
         whole slide on a narrow one. Only once it is at its end does the track
         move. Without this, preventDefault below would make overflowing text
         unreachable. */
      for (let node = e.target as Element | null; node && node !== track; node = node.parentElement) {
        if (!(node instanceof HTMLElement) || node.dataset.col === undefined) continue;
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const overflow = getComputedStyle(node).overflowY;
        if (overflow !== "auto" && overflow !== "scroll") continue;
        const atTop = node.scrollTop <= 0;
        const atEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return;
      }

      e.preventDefault();
      if (locked || Math.abs(e.deltaY) < 12) return;
      locked = true;
      window.setTimeout(() => (locked = false), 620);
      goTo(Math.round(track.scrollLeft / track.clientWidth) + (e.deltaY > 0 ? 1 : -1));
    };

    window.addEventListener("keydown", onKey);
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      track.removeEventListener("wheel", onWheel);
    };
  }, [goTo]);

  return (
    <div className="relative h-dvh w-full overflow-hidden text-ink">
      <h1 className="sr-only">Projects</h1>

      <div
        ref={trackRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => {
          const src = images[p.id];
          return (
            <section
              key={p.id}
              id={p.id}
              aria-label={p.title}
              data-col
              /* On a phone the panel scrolls as one piece. It used to be a fixed
                 height box with the text column scrolling inside it, which cut
                 every project's copy off mid sentence. Sliding between projects
                 is still horizontal; only the reading is vertical. */
              className={
                "flex h-full w-full shrink-0 snap-center flex-col overflow-y-auto [scrollbar-width:none] lg:flex-row lg:overflow-y-hidden [&::-webkit-scrollbar]:hidden " +
                GROUND[p.id]
              }
            >
              <div
                data-col
                /* The gap only matters on a phone: there the column is its own
                   height and justify-between has no slack to spend. */
                className="flex min-h-0 shrink-0 flex-col justify-between gap-10 px-[5.5vw] pb-[5vh] pt-[13vh] [scrollbar-width:none] lg:w-[45%] lg:flex-1 lg:shrink lg:gap-0 lg:overflow-y-auto lg:pb-[10vh] lg:pr-[3vw] lg:pt-[12vh] [&::-webkit-scrollbar]:hidden"
              >
                <div>
                  <div className="flex items-baseline gap-4 border-b border-rule pb-4 font-mono text-[11px] uppercase tracking-[0.2em]">
                    <span>{p.index}</span>
                    <span className="text-muted">{p.period}</span>
                  </div>

                  <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
                    {p.title}
                  </h2>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{p.kicker}</p>

                  <p className="mt-5 max-w-[48ch] text-[clamp(0.95rem,1.05vw,1.08rem)] leading-[1.6]">{p.summary}</p>

                  <ul className="mt-6 space-y-3">
                    {p.points.map((point) => (
                      <li
                        key={point.slice(0, 20)}
                        className="border-t border-rule pt-3 text-[12.5px] leading-[1.6] opacity-85"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                    {p.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </p>

                  <a
                    href={p.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-5 inline-flex items-center gap-3 border-t border-rule pt-4 font-mono text-[11px] uppercase tracking-[0.18em]"
                  >
                    <span className="text-muted">Open</span>
                    <span className="font-display text-[clamp(1.1rem,2vw,1.7rem)] font-black uppercase tracking-[-0.03em] transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent">
                      {p.link.label}
                    </span>
                    <Arrow
                      turn={-45}
                      className="size-5 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent"
                    />
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
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : undefined}
                      /* contain, not cover: these are interface screenshots,
                         and cropping one cuts off the very thing it is there to
                         show. The panel's ground fills whatever is left. */
                      className="object-contain object-top"
                    />
                  ) : p.id === "conflict" ? (
                    // This one has no interface to screenshot, so it gets a
                    // drawing of its architecture rather than a faked one.
                    <PipelineDiagram />
                  ) : (
                    <Placeholder id={p.id} />
                  )}
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-rule pt-4">
                  <span className="font-display text-[clamp(2rem,4.6vw,3.8rem)] font-black leading-none tracking-[-0.04em] text-accent">
                    {p.metric.value}
                  </span>
                  <span className="max-w-[26ch] text-right font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
                    {p.metric.label}
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-[5.5vw] pb-7">
        <div className="pointer-events-auto flex items-center gap-5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              aria-current={i === index ? "true" : undefined}
              className={
                "-my-3 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 " +
                (i === index ? "text-ink" : "text-muted hover:text-ink")
              }
            >
              {p.index}
            </button>
          ))}
          {/* Says how to move once, and goes after the first move. */}
          <span
            aria-hidden
            className={
              "ml-3 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-opacity duration-500 md:inline " +
              (moved ? "opacity-0" : "opacity-100")
            }
          >
            Scroll, or use the arrow keys
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-5">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous project"
            className="-m-3 p-3 transition-[color,opacity] duration-200 hover:text-accent disabled:opacity-25 disabled:hover:text-ink"
          >
            <Arrow turn={180} className="size-5" />
          </button>
          {index < last ? (
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next project"
              className="-m-3 p-3 transition-colors duration-200 hover:text-accent"
            >
              <Arrow className="size-5" />
            </button>
          ) : (
            <NextLink from="/projects" compact />
          )}
        </div>
      </div>
    </div>
  );
}

/* Deliberately reads as missing rather than as a design decision, and names the
   file that would replace it. */
function Placeholder({ id }: { id: string }) {
  return (
    <div className="absolute inset-0 text-muted">
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <rect x="0.3" y="0.3" width="99.4" height="99.4" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.6" />
        <line x1="0.3" y1="0.3" x2="99.7" y2="99.7" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.4" />
        <line x1="99.7" y1="0.3" x2="0.3" y2="99.7" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.4" />
      </svg>
      <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em]">
        public/projects/{id}.jpg
      </span>
    </div>
  );
}
