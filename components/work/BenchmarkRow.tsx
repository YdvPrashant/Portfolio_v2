"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { projects, type Benchmark } from "@/lib/content";

/* One benchmark as comparison bars or a unit chart, used on the case study
   pages (after Cerebrium's benchmark bars). Hatched means before, or not to be
   trusted; solid means the number that stands. Each row draws itself once,
   when it scrolls into view. */

function useInView(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

function Bars({ b }: { b: Extract<Benchmark, { kind: "bars" }> }) {
  let k = 0;
  return (
    <div className="grid gap-y-5">
      {b.rows.map((row) => (
        <div key={row.label} className="grid gap-x-4 gap-y-2 sm:grid-cols-[10rem_1fr]">
          <p className="t-mono pt-[3px] text-muted">{row.label}</p>
          <div className="grid gap-y-2">
            {row.bars.map((bar) => {
              const share = Math.round((bar.value / b.max) * 10000) / 100;
              const i = k++;
              return (
                // The inner box leaves room on the right for the value label.
                <div key={bar.label + bar.value} className="relative mr-[8.5rem] h-[26px]">
                  <div
                    className={`bar absolute left-0 top-[5px] h-4 ${bar.muted ? "bar-muted" : "bg-accent"}`}
                    style={{ width: `${share}%`, "--k": i } as React.CSSProperties}
                  />
                  <p
                    className="bar-value t-mono absolute top-[3px] whitespace-nowrap"
                    style={{ left: `calc(${share}% + 10px)`, "--k": i } as React.CSSProperties}
                  >
                    <span className="font-[600] text-fg">{bar.display}</span>
                    {bar.label && <span className="text-muted"> {bar.label}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Units({ b }: { b: Extract<Benchmark, { kind: "units" }> }) {
  return (
    <div>
      <p className="t-xl font-[560]">{b.value}</p>
      <ol className="mt-5 flex flex-wrap gap-[5px]" aria-label={`${b.filled} of ${b.total}`}>
        {Array.from({ length: b.total }, (_, i) => (
          <li
            key={i}
            className={`unit size-[clamp(12px,1.35vw,20px)] ${i < b.filled ? "unit-on" : "unit-off"}`}
            style={{ "--k": i } as React.CSSProperties}
          />
        ))}
      </ol>
    </div>
  );
}

export function BenchmarkRow({ b, showProject = true }: { b: Benchmark; showProject?: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  useInView(ref);
  const project = projects.find((p) => p.slug === b.slug);

  return (
    <li
      ref={ref}
      className="measured-row grid grid-cols-12 gap-x-[var(--gap)] gap-y-6 border-b border-rule py-[clamp(28px,4.5vh,48px)]"
    >
      <div className="col-span-12 lg:col-span-4">
        <h3 className="t-m font-[580]">{b.title}</h3>
        <p className="t-small mt-2 max-w-[40ch] text-muted">{b.note}</p>
        {showProject && project && (
          <Link
            href={`/work/${project.slug}`}
            transitionTypes={["nav-forward"]}
            className="t-mono hit mt-3 inline-block text-muted transition-colors hover:text-fg"
          >
            {project.index} {project.title} &rarr;
          </Link>
        )}
      </div>
      <div className="col-span-12 self-center lg:col-span-7 lg:col-start-6">
        {b.kind === "bars" ? <Bars b={b} /> : <Units b={b} />}
      </div>
    </li>
  );
}
