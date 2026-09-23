"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { projects } from "@/lib/content";
import { pageTop, useScrollProgress } from "@/lib/scroll";
import { lenis } from "@/components/site/SmoothScroll";

/* Selected work slides sideways while you scroll down (after Gianluca
   Gradogna's numbered index and Boc.Studio's rows). The section is as tall as
   the distance the rail travels, so the page scrolls one to one with the
   slide. Below 1024px the rail is an ordinary swipeable strip instead:
   projects always slide, they never stack. */

const INTRO = "Three projects from the last two years. Prism is live; the other two are on GitHub.";

export function WorkTrack() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  useScrollProgress(section, "pin");

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
                <p className="mt-6 flex items-baseline gap-3 border-t border-rule pt-4">
                  <span className="t-l font-[560]">{p.metric.value}</span>
                  <span className="t-small text-muted">{p.metric.label}</span>
                </p>
                <Link
                  href={`/work/${p.slug}`}
                  transitionTypes={["nav-forward", "work-morph"]}
                  className="t-small link-line hit mt-6 inline-block font-[560]"
                >
                  Read the case study &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="work-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
