"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { pageTop, subscribe } from "@/lib/scroll";

/* The name set as a poster (after Josef Müller-Brockmann's der Film and Armin
   Hofmann's theatre posters for Basel).

   It fills its room both ways: across by its size, down by the width axis of
   Mona Sans, so a wide window sets it wide and a tall one condensed (after Karl
   Gerstner's programmes and the widths of Adrian Frutiger's Univers). The
   children, the index, go in the room the second line leaves, with their last
   [data-baseline] on that line's baseline, or under the name when they do not
   fit beside it.

   A photograph can show through the letters. It fades in once it has loaded,
   drifts a little with the pointer and lags behind the scroll. */

type Props = {
  lines: readonly [string, string];
  /** The photograph for phones and for everything wider. */
  photo?: { small: string; large: string } | null;
  children: ReactNode;
};

// The width axis, measured every few steps and interpolated between them.
const LO = 75;
const HI = 125;
const STEP = 5;
// The ink is narrower than the advance width: the p starts after its side
// bearing and the t's bar runs past the last letter's tracking.
const INK = 0.03;

function textWidth(node: Node): number {
  const range = document.createRange();
  range.selectNodeContents(node);
  return range.getBoundingClientRect().width;
}

export function PosterName({ lines, photo, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLDivElement>(null);
  const second = useRef<HTMLSpanElement>(null);
  const base = useRef<HTMLElement>(null);
  const aside = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = box.current;
    const el = name.current;
    const line = second.current;
    const mark = base.current;
    const side = aside.current;
    const tall = probe.current;
    const section = wrap?.parentElement;
    if (!wrap || !el || !line || !mark || !side || !tall || !section) return;
    const first = el.firstElementChild as HTMLElement;
    const wide = window.matchMedia("(min-width: 1024px)");

    let widths: number[] = [];
    let k = 1.73;
    const measure = () => {
      el.style.fontSize = "100px";
      widths = [];
      for (let s = LO; s <= HI; s += STEP) {
        el.style.fontStretch = `${s}%`;
        widths.push(textWidth(first));
      }
      k = el.getBoundingClientRect().height / 100;
    };
    const widthAt = (s: number) => {
      const x = (s - LO) / STEP;
      const i = Math.min(Math.floor(x), widths.length - 2);
      return widths[i] + (widths[i + 1] - widths[i]) * (x - i);
    };

    // The most condensed setting whose height still fits the room. When even
    // that leaves room over, the screen gives the room back instead of
    // leaving a hole above the name.
    const set = (W: number, room: number) => {
      let s = HI;
      for (let x = LO; x <= HI; x += 0.5) {
        if ((W / (widthAt(x) / 100 - INK)) * k <= room) {
          s = x;
          break;
        }
      }
      let size = W / (widthAt(s) / 100 - INK);
      if (size * k > room) size = Math.max(room / k, 32);
      el.style.fontStretch = `${s}%`;
      el.style.fontSize = `${size}px`;
      section.style.minHeight = s === LO && size * k < room - 48 ? "0" : "";
    };

    // The index's last line sits on the second line's baseline.
    const place = () => {
      const r = document.createRange();
      r.selectNodeContents(line);
      side.style.left = `calc(${r.getBoundingClientRect().right - wrap.getBoundingClientRect().left}px + 2 * var(--gap))`;
      const last = [...side.querySelectorAll("[data-baseline]")].pop();
      if (!last) return;
      const text = document.createRange();
      text.selectNodeContents(last);
      const descent = 0.23 * parseFloat(getComputedStyle(last).fontSize);
      const below = side.getBoundingClientRect().bottom - (text.getBoundingClientRect().bottom - descent);
      side.style.bottom = `${wrap.getBoundingClientRect().bottom - mark.getBoundingClientRect().top - below}px`;
    };

    const fit = () => {
      if (!widths.length) measure();
      const W = wrap.clientWidth;
      const top = section.getBoundingClientRect().top;
      let above = 0;
      for (let n = wrap.previousElementSibling; n; n = n.previousElementSibling) {
        above = Math.max(above, n.getBoundingClientRect().bottom - top);
      }
      const room =
        tall.offsetHeight -
        above -
        parseFloat(getComputedStyle(wrap).paddingTop) -
        parseFloat(getComputedStyle(section).paddingBottom) -
        8;

      side.style.left = side.style.bottom = "";
      if (wide.matches) {
        delete wrap.dataset.stack;
        set(W, room);
        place();
        if (side.scrollWidth <= side.clientWidth + 1) return;
        wrap.dataset.stack = "";
        side.style.left = side.style.bottom = "";
      }
      const sideHeight = side.offsetHeight + parseFloat(getComputedStyle(side).marginTop);
      set(W, room - sideHeight);
    };

    let lastW = -1;
    let lastH = -1;
    const refit = () => {
      const W = wrap.clientWidth;
      const H = tall.offsetHeight;
      if (W === lastW && H === lastH) return;
      lastW = W;
      lastH = H;
      fit();
    };
    const ro = new ResizeObserver(refit);
    ro.observe(wrap);
    ro.observe(tall);
    document.fonts.ready.then(() => {
      widths = [];
      lastW = -1;
      refit();
    });
    return () => ro.disconnect();
  }, []);

  // The letters stay in ink until the photograph is ready, then it fades in.
  useEffect(() => {
    const el = name.current;
    if (!el || !photo) return;
    let alive = true;
    const img = new Image();
    img.src = window.matchMedia("(max-width: 767px)").matches ? photo.small : photo.large;
    img
      .decode()
      .then(() => {
        if (alive) el.dataset.lit = "";
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [photo]);

  // The photograph drifts against the pointer and lags behind the scroll.
  useEffect(() => {
    const el = name.current;
    const section = box.current?.parentElement;
    if (!el || !section || !photo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let top = 0;
    let height = 1;
    let width = 1;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const x = e.clientX / width - 0.5;
      const y = (e.clientY + window.scrollY - top) / height - 0.5;
      el.style.setProperty("--dx", (x * -32).toFixed(1));
      el.style.setProperty("--dy", (y * -24).toFixed(1));
    };
    const leave = () => {
      el.style.setProperty("--dx", "0");
      el.style.setProperty("--dy", "0");
    };
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    const stop = subscribe({
      measure() {
        top = pageTop(section);
        height = section.offsetHeight;
        width = section.offsetWidth;
      },
      update(y) {
        const p = Math.min(1, Math.max(0, (y - top) / height));
        el.style.setProperty("--sy", (p * 120).toFixed(1));
      },
    });
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      stop();
    };
  }, [photo]);

  const style = photo
    ? ({ "--photo-small": `url("${photo.small}")`, "--photo-large": `url("${photo.large}")` } as CSSProperties)
    : undefined;

  return (
    <div ref={box} className="poster">
      <span ref={probe} className="poster-probe" aria-hidden="true" />
      <div ref={name} className={photo ? "poster-name has-photo" : "poster-name"} style={style} aria-hidden="true">
        <span>{lines[0]}</span>
        <span ref={second}>
          {lines[1]}
          <i ref={base} className="poster-base" />
        </span>
      </div>
      <div ref={aside} className="poster-aside">
        {children}
      </div>
    </div>
  );
}
