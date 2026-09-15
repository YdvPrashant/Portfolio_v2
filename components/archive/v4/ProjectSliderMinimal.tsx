"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Arrow from "@/components/Arrow";
import NextLink from "@/components/NextLink";
import SectionTitle from "@/components/SectionTitle";
import PipelineDiagram from "@/components/projects/PipelineDiagram";
import { projects, type Project } from "@/lib/content";

/* Three projects side by side, never stacked.

   The first version gave each project its own neon ground and put everything it
   knew on the slide at once, three dense build notes included. This one is
   calmer: one ground for all three, the essentials in a column (what it is,
   the number that matters, the stack, the link) and the screenshot large on a
   plate. The build notes are one press away behind "How it was built", in the
   plate, at a size that can be read.

   A horizontal scroll-snap track rather than a carousel library: the browser
   already does snapping, momentum and touch swiping properly, so the only
   things written here are the ways a desktop mouse drives it. A wheel gesture
   advances exactly one panel and then locks briefly, which is steadier than
   mapping wheel delta onto scrollLeft and fighting the snap.

   No drag-to-scroll. It would have to suppress clicks past a movement threshold
   and disable snapping mid-gesture, and every panel has links in it.

   The last slide swaps its forward arrow for the way on to DSA, so the page does
   not end in a disabled button.

   The text column is four of twelve columns and its type is sized against the
   window's height too. Wider, the short summaries left a hole between the text
   and the number at the foot of the column. */

const pad = (n: number) => String(n).padStart(2, "0");

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
         going takes the wheel first: the text column or the build notes on a
         short window, the whole slide on a narrow one. Only once it is at its
         end does the track move. Without this, preventDefault below would make
         overflowing text unreachable. */
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
    <div className="flex h-dvh w-full flex-col overflow-hidden pt-(--nav-h)">
      <header className="flex items-baseline justify-between gap-6 px-[5.5vw] pb-[1.5vh] pt-[2.5vh]">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] tabular-nums text-muted">03</span>
          <SectionTitle slug="projects">
            <h1 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
              Projects
            </h1>
          </SectionTitle>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted">
          {pad(index + 1)} / {pad(projects.length)}
        </p>
      </header>

      <div
        ref={trackRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => (
          <Slide key={p.id} project={p} src={images[p.id]} eager={i === 0} />
        ))}
      </div>

      <footer className="flex items-center justify-between gap-6 border-t border-rule px-[5.5vw] py-3.5">
        <div className="flex items-center gap-5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              aria-current={i === index ? "true" : undefined}
              className={
                "-my-3 py-3 font-mono text-[11px] tracking-[0.2em] tabular-nums transition-colors duration-200 " +
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

        <div className="flex items-center gap-5">
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
      </footer>
    </div>
  );
}

function Slide({ project: p, src, eager }: { project: Project; src: string | null; eager: boolean }) {
  const [notes, setNotes] = useState(false);

  return (
    <section
      id={p.id}
      aria-label={p.title}
      data-col
      /* On a phone the slide scrolls as one piece, text then figure. A fixed
         height box with the text scrolling inside it cut every project's copy
         off mid sentence. From lg it is two columns in one screen, and each
         column scrolls on its own only if it has to. */
      className="flex h-full w-full shrink-0 snap-center flex-col gap-10 overflow-y-auto px-[5.5vw] pb-10 pt-[2vh] [scrollbar-width:none] lg:grid lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] lg:gap-x-[3vw] lg:gap-y-0 lg:overflow-hidden lg:pb-[3vh] [&::-webkit-scrollbar]:hidden"
    >
      <div
        data-col
        className="flex shrink-0 flex-col justify-between gap-8 [scrollbar-width:none] lg:col-span-4 lg:min-h-0 lg:overflow-y-auto lg:pr-[1vw] [&::-webkit-scrollbar]:hidden"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{p.period}</p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,min(4vw,6.2vh),3.4rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
            {p.title}
          </h2>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{p.kicker}</p>
          <p className="mt-5 max-w-[46ch] text-[clamp(1rem,min(1.4vw,2.3vh),1.3rem)] leading-[1.55]">{p.summary}</p>
        </div>

        <div>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-rule pt-5">
            <span className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-none tracking-[-0.04em] text-accent">
              {p.metric.value}
            </span>
            <span className="max-w-[26ch] font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              {p.metric.label}
            </span>
          </p>

          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </p>

          <a
            href={p.link.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex items-center gap-3 font-display text-[clamp(1.1rem,1.7vw,1.45rem)] font-black uppercase tracking-[-0.03em]"
          >
            <span className="transition-colors duration-300 group-hover:text-accent">{p.link.label}</span>
            <Arrow
              turn={-45}
              className="size-5 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </a>
        </div>
      </div>

      <div className="flex h-[58vh] shrink-0 flex-col lg:col-span-8 lg:h-auto lg:min-h-0">
        <div
          role="tablist"
          aria-label={"What to show for " + p.title}
          className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em]"
        >
          {(["Preview", "How it was built"] as const).map((label, i) => {
            const on = notes === (i === 1);
            return (
              <button
                key={label}
                role="tab"
                aria-selected={on}
                onClick={() => setNotes(i === 1)}
                className={
                  "-my-3 py-3 underline-offset-[6px] transition-colors duration-200 " +
                  (on ? "text-ink underline decoration-accent decoration-1" : "text-muted hover:text-ink")
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden bg-raised">
          <div
            aria-hidden={notes}
            className={
              "absolute inset-0 transition-opacity duration-500 " + (notes ? "pointer-events-none opacity-0" : "opacity-100")
            }
          >
            {src ? (
              /* contain, not cover: these are interface screenshots, and cropping
                 one cuts off the very thing it is there to show. */
              <Image
                src={src}
                alt={p.title}
                fill
                sizes="(max-width: 1023px) 90vw, 62vw"
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : undefined}
                className="object-contain p-[4%]"
              />
            ) : p.id === "conflict" ? (
              // This one has no interface to screenshot, so it gets a drawing of
              // its architecture rather than a faked one.
              <PipelineDiagram />
            ) : (
              <Placeholder id={p.id} />
            )}
          </div>

          <ol
            data-col
            aria-hidden={!notes}
            className={
              "absolute inset-0 overflow-y-auto px-[6%] py-[5%] transition-opacity duration-500 " +
              (notes ? "opacity-100" : "pointer-events-none opacity-0")
            }
          >
            {p.points.map((point, i) => (
              <li
                key={point.slice(0, 20)}
                className="grid grid-cols-[2.5rem_1fr] border-t border-rule py-4 first:border-t-0 first:pt-0"
              >
                <span className="pt-0.5 font-mono text-[11px] tabular-nums text-muted">{pad(i + 1)}</span>
                <span className="text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65]">{point}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
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
