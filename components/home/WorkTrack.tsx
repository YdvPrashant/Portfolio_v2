"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { projects } from "@/lib/content";
import { pageTop, useScrollProgress } from "@/lib/scroll";
import { lenis } from "@/components/site/SmoothScroll";

/* Selected work slides sideways while you scroll down (after Gianluca
   Gradogna's numbered index and Boc.Studio's rows). The section is as tall as
   the distance the rail travels, so the page scrolls one to one with the
   slide. Below 1024px the rail is an ordinary swipeable strip instead:
   projects always slide, they never stack.

   On desktop the progress line under the rail is a ruler: each project's name
   stands where the slide reaches it, the one in view is inked, and clicking a
   name slides straight there. */

const INTRO = "Three projects from the last two years. Prism is live; the other two are on GitHub.";

export function WorkTrack() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLElement>(null);
  // Where each project's panel arrives, as a fraction of the slide.
  const stops = useRef<number[]>([]);

  useScrollProgress(section, "pin", (p) => {
    const marks = ruler.current?.querySelectorAll<HTMLElement>("[data-i]");
    const at = stops.current;
    if (!marks || at.length === 0) return;
    // Nothing is current while the heading still has the screen.
    let current = p < at[0] / 2 ? -1 : 0;
    if (current === 0) {
      at.forEach((stop, i) => {
        if (Math.abs(p - stop) < Math.abs(p - at[current])) current = i;
      });
    }
    marks.forEach((mark, i) => {
      if (i === current) mark.setAttribute("aria-current", "true");
      else mark.removeAttribute("aria-current");
    });
  });

  useEffect(() => {
    const track = rail.current;
    const marks = ruler.current?.querySelectorAll<HTMLElement>("[data-i]");
    if (!track || !marks) return;
    const measure = () => {
      const frame = track.parentElement;
      if (!frame) return;
      const travel = track.scrollWidth - frame.clientWidth;
      const panels = track.querySelectorAll<HTMLElement>("article[data-panel]");
      stops.current = [...panels].map((panel) => Math.min(1, panel.offsetLeft / Math.max(1, travel)));
      marks.forEach((mark, i) => mark.style.setProperty("--at", String(stops.current[i] ?? 0)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  const go = (i: number) => {
    const el = section.current;
    const stop = stops.current[i];
    if (!el || stop === undefined) return;
    const y = pageTop(el) + stop * (el.offsetHeight - window.innerHeight);
    const smooth = lenis();
    if (smooth) smooth.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Tabbing into a panel that is off to the side scrolls the page to it. Only
  // keyboard focus counts: a click already happens on a panel in view.
  const reveal = (e: React.FocusEvent) => {
    const el = section.current;
    const track = rail.current;
    const target = e.target as HTMLElement;
    if (!el || !track || !target.matches(":focus-visible")) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const panel = target.closest<HTMLElement>("[data-panel]");
    const frame = track.parentElement;
    if (!panel || !frame) return;
    // The rail is as wide as its content, so the distance it travels is its
    // width less the frame it slides inside.
    const travel = track.scrollWidth - frame.clientWidth;
    const p = Math.min(1, panel.offsetLeft / Math.max(1, travel));
    const y = pageTop(el) + p * (el.offsetHeight - window.innerHeight);
    const smooth = lenis();
    if (smooth) smooth.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };

  return (
    <section
      id="work"
      ref={section}
      data-theme="ink"
      aria-label="Selected work"
      className="work-track"
      onFocus={reveal}
    >
      {/* Phones and tablets: the heading sits above the strip. */}
      <div className="px-pad pb-10 lg:hidden">
        <h2 className="t-xxl">Selected work</h2>
        <p className="t-m mt-5 max-w-[30ch] text-muted">{INTRO}</p>
      </div>

      <div className="work-sticky">
        <div ref={rail} className="work-rail">
          {/* Desktop: the heading is the first thing on the rail. */}
          <div data-panel className="work-intro">
            <h2 className="t-xxl">
              Selected
              <br />
              work
            </h2>
            <p className="t-m mt-8 max-w-[30ch] text-muted">{INTRO}</p>
          </div>

          {projects.map((p) => (
            <article key={p.slug} data-panel className="work-panel" aria-labelledby={`work-${p.slug}`}>
              <Link
                href={`/work/${p.slug}`}
                transitionTypes={["nav-forward", "work-morph"]}
                className="work-media block"
                tabIndex={-1}
                aria-hidden="true"
              >
                <ProjectMedia project={p} sizes="(min-width: 1024px) 56vw, 86vw" />
              </Link>

              <div className="work-text">
                <p className="numerals work-num" aria-hidden="true">
                  {p.index}
                </p>
                <h3 id={`work-${p.slug}`} className="t-l mt-2 font-[620]">
                  {p.title}
                </h3>
                <p className="serif t-m mt-2 text-muted">{p.kicker}</p>
                <p className="t-body work-summary mt-5 max-w-[42ch] text-muted">{p.summary}</p>
                <p className="t-mono mt-4 max-w-[52ch] text-muted">{p.stack.join(" · ")}</p>
                <p className="mt-6 flex items-baseline gap-3 border-t border-rule pt-4">
                  <span className="t-l font-[560]">{p.metric.value}</span>
                  <span className="t-small text-muted">{p.metric.label}</span>
                </p>
                <p className="t-small mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-3">
                  <Link
                    href={`/work/${p.slug}`}
                    transitionTypes={["nav-forward", "work-morph"]}
                    className="link-line hit font-[560]"
                  >
                    Read the case study &rarr;
                  </Link>
                  <a
                    href={p.link.href}
                    target="_blank"
                    rel="noopener"
                    className="link-line hit text-muted transition-colors hover:text-fg"
                  >
                    {p.link.label === "GitHub" ? "Code on GitHub" : `Live at ${p.link.label}`} &#8599;
                  </a>
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="work-progress" aria-hidden="true">
          <span />
        </div>
        <nav ref={ruler} className="work-ruler" aria-label="Projects">
          {projects.map((p, i) => (
            <button key={p.slug} type="button" data-i={i} className="work-stop t-mono hit" onClick={() => go(i)}>
              {p.index} {p.title}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
