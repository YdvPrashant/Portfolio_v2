"use client";

import { useEffect, useRef, type RefObject } from "react";

/* One scroll loop for the whole site.

   Each subscriber measures its geometry when mounted and whenever the page
   resizes, then turns the scroll position into a progress value with plain
   arithmetic. Nothing reads layout while scrolling, and everything updates in
   the same animation frame. Lenis drives the native scroll position, so the
   ordinary scroll event covers smooth and native scrolling alike. */

type Subscriber = {
  measure: () => void;
  update: (scrollY: number, viewportHeight: number) => void;
};

const subscribers = new Set<Subscriber>();
let frame = 0;
let listening = false;

function run() {
  frame = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  subscribers.forEach((s) => s.update(y, vh));
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(run);
}

function remeasure() {
  subscribers.forEach((s) => s.measure());
  schedule();
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", remeasure);
  // Images and fonts arriving late change the page height under everything.
  new ResizeObserver(remeasure).observe(document.body);
}

export function subscribe(subscriber: Subscriber): () => void {
  listen();
  subscribers.add(subscriber);
  subscriber.measure();
  schedule();
  return () => {
    subscribers.delete(subscriber);
  };
}

/** Page offset of an element, ignoring transforms and the current scroll. */
export function pageTop(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * - `pin`: 0 when the element's top reaches the top of the viewport, 1 when its
 *   bottom reaches the bottom. For tall containers with a sticky child.
 * - `through`: 0 when the top enters at the bottom, 1 when the bottom leaves at
 *   the top.
 * - `enter`: 0 when the top enters at the bottom, 1 when the top reaches the top.
 * - `read`: 0 when the top is 85% of the way down the viewport, 1 when the
 *   bottom is 45% of the way down. For text read in place.
 */
export type ProgressRange = "pin" | "through" | "enter" | "read";

export function progressOf(
  range: ProgressRange,
  scrollY: number,
  vh: number,
  top: number,
  height: number,
): number {
  let p: number;
  if (range === "pin") p = (scrollY - top) / Math.max(1, height - vh);
  else if (range === "enter") p = (scrollY + vh - top) / vh;
  else if (range === "read") p = (scrollY + 0.85 * vh - top) / (height + 0.4 * vh);
  else p = (scrollY + vh - top) / (height + vh);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/**
 * Writes the element's scroll progress to a CSS custom property (`--p` by
 * default) and optionally hands it to a callback. The callback is read through
 * a ref, so passing a new function each render does not resubscribe.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  range: ProgressRange = "through",
  onChange?: (p: number) => void,
  cssVar = "--p",
) {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let top = 0;
    let height = 0;
    let last = -1;
    return subscribe({
      measure() {
        top = pageTop(el);
        height = el.offsetHeight;
        last = -1;
      },
      update(y, vh) {
        const p = progressOf(range, y, vh, top, height);
        if (Math.abs(p - last) < 0.0002) return;
        last = p;
        el.style.setProperty(cssVar, p.toFixed(4));
        callback.current?.(p);
      },
    });
  }, [ref, range, cssVar]);
}
