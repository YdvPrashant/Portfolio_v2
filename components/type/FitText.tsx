"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";

/* A word set to span its measure exactly.

   The size is measured rather than guessed. A range around the text gives its
   real width even when it overflows its box, and the font size is scaled by the
   ratio of the box to that width, twice if the first pass lands short, which it
   can when the metrics change mid-measure.

   Two things this had to learn the hard way. Sizing the word from a character
   count was close and still wrong, and the last letter of PHOTOGRAPHY ran off
   the page. Then the box was read with the parent's `clientWidth`, which
   includes the parent's padding, so every word came out a padding too wide and
   the whole site got a horizontal scrollbar. The box to fit is this element's
   own, which is already the content width.

   The observer re-fits whenever the text stops matching its box, which is what
   happens when the window changes size and again when the webfont finally
   swaps in, and stays quiet once the two agree. */

export default function FitText({
  text,
  className = "",
  style,
  max = 260,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  max?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const textWidth = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width;
    };

    const fit = () => {
      const box = el.getBoundingClientRect().width;
      if (!box) return;
      for (let pass = 0; pass < 4; pass++) {
        const size = parseFloat(el.style.fontSize) || parseFloat(getComputedStyle(el).fontSize) || 100;
        const width = textWidth();
        if (!width) return;
        const next = Math.max(16, Math.min(max, (box / width) * size));
        if (Math.abs(next - size) < 0.4) break;
        el.style.fontSize = next + "px";
      }
    };

    fit();
    document.fonts.ready.then(fit);

    const observer = new ResizeObserver(() => {
      if (Math.abs(textWidth() - el.getBoundingClientRect().width) > 1.5) fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, max]);

  return (
    <h2 ref={ref} className={"block whitespace-nowrap " + className} style={style}>
      {text}
    </h2>
  );
}
