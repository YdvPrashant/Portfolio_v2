"use client";

import { useEffect, useRef } from "react";

/* Sets its lines at the largest size at which the longest one still fits its
   own box. It measures rather than counting characters: a character count
   once pushed a last letter off the page, and a parent's clientWidth includes
   the parent's padding. The text is measured with a Range, which reports the
   true width even while the text overflows. */

type Props = {
  lines: string[];
  className?: string;
  /** Rough size before measuring, so the first paint is close. */
  estimate?: string;
};

export function FitLines({ lines, className = "", estimate = "10vw" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const available = el.getBoundingClientRect().width;
      let widest = 0;
      for (const line of el.children) {
        const range = document.createRange();
        range.selectNodeContents(line);
        widest = Math.max(widest, range.getBoundingClientRect().width);
      }
      if (widest > 0) el.style.fontSize = `${Math.floor((available / widest) * 100 * 1000) / 1000}px`;
    };
    fit();
    document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines]);

  return (
    <span ref={ref} className={`block ${className}`} style={{ fontSize: estimate }}>
      {lines.map((line) => (
        <span key={line} className="block w-max whitespace-nowrap">
          {line}
        </span>
      ))}
    </span>
  );
}
