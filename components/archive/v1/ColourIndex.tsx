"use client";

import { useCallback, useRef, useState } from "react";
import { nav, person, ULTRAMARINE } from "@/lib/content";

/* Direction C. Colour Index.
   No hero. The landing is the index itself. Pointing at a row floods the
   viewport with that section's colour, wiping out from the row you are on, and
   the whole page inverts to suit. Six saturated grounds live behind six words,
   and nothing else is on the screen. */

type Flood = { ink: string; on: string; origin: number; key: number };

const REST = { ink: ULTRAMARINE, on: "#FFFFFF" };

export default function ColourIndex() {
  const listRef = useRef<HTMLUListElement>(null);
  const keyRef = useRef(0);
  const [base, setBase] = useState(REST);
  const [flood, setFlood] = useState<Flood | null>(null);

  /* The incoming colour wipes in from the row that triggered it, then becomes
     the base. Two layers, so every change is a wipe rather than a crossfade
     through a muddy intermediate. */
  const raise = useCallback(
    (ink: string, on: string, el: HTMLElement | null) => {
      if (ink === base.ink) {
        setFlood(null);
        return;
      }
      let origin = 50;
      const list = listRef.current;
      if (el && list) {
        const r = el.getBoundingClientRect();
        origin = ((r.top + r.height / 2) / window.innerHeight) * 100;
      }
      keyRef.current += 1;
      setFlood({ ink, on, origin, key: keyRef.current });
    },
    [base.ink],
  );

  const settle = useCallback(() => {
    setFlood((f) => {
      if (f) setBase({ ink: f.ink, on: f.on });
      return null;
    });
  }, []);

  const fg = flood ? flood.on : base.on;

  return (
    <section
      style={{ background: base.ink, color: fg }}
      className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden transition-colors duration-0"
      onMouseLeave={() => raise(REST.ink, REST.on, null)}
    >
      {flood ? (
        <div
          key={flood.key}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 origin-center animate-[flood_420ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
          style={{
            background: flood.ink,
            transformOrigin: `50% ${flood.origin}%`,
          }}
          onAnimationEnd={settle}
        />
      ) : null}

      <style>{"@keyframes flood { from { transform: scaleY(0); } to { transform: scaleY(1); } }"}</style>

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 px-[5.5vw] pb-8 pt-9 sm:pt-12">
        <h1 className="font-[family-name:var(--font-instrument)] text-[clamp(2.1rem,5.2vw,4.1rem)] leading-[0.95] tracking-[-0.02em]">
          {person.full}
        </h1>
        <p className="max-w-[30ch] font-mono text-[11px] leading-relaxed opacity-70 sm:text-[12px]">
          {person.role}
        </p>
      </header>

      <ul ref={listRef} className="flex flex-1 flex-col">
        {nav.map((item) => (
          <li key={item.href} className="flex-1">
            <a
              href={item.href}
              onMouseEnter={(e) => raise(item.ink, item.on, e.currentTarget)}
              onFocus={(e) => raise(item.ink, item.on, e.currentTarget)}
              className="group flex h-full min-h-[4.6rem] items-center gap-[4vw] border-t px-[5.5vw] outline-none"
              style={{ borderColor: "currentColor", borderTopWidth: 1 }}
            >
              <span className="w-[3ch] shrink-0 font-mono text-[11px] tabular-nums opacity-60 sm:text-[12px]">
                {item.n}
              </span>

              <span className="flex-1 overflow-hidden">
                <span className="block font-[family-name:var(--font-archivo)] text-[clamp(1.9rem,6.2vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.035em] transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1.6vw] group-focus-visible:translate-x-[1.6vw]">
                  {item.label}
                </span>
              </span>

              <span className="hidden max-w-[26ch] shrink-0 text-right font-mono text-[11px] leading-relaxed opacity-0 transition-opacity duration-300 group-hover:opacity-70 group-focus-visible:opacity-70 md:block">
                {item.note}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
