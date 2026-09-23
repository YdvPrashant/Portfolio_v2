"use client";

import { useEffect, useRef } from "react";
import { lenis } from "@/components/site/SmoothScroll";
import { finishIntro, INTRO_KEY } from "@/lib/intro";

/* Counts to 100 in the corner, once per session, then lifts to uncover the
   hero as its stripes spring in (after Gianluca Gradogna's and Gil Huybrecht's
   counters). The count cannot pass 90 until the fonts have loaded, so the name
   is never drawn in a fallback face. */

const DURATION = 1250;

export function Preloader() {
  const panel = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = panel.current;
    const out = count.current;
    if (root.dataset.intro !== "pending" || !el || !out) {
      finishIntro();
      return;
    }

    lenis()?.stop();
    let fontsReady = false;
    let alive = true;
    let shown = 0;
    let frame = 0;
    let timer = 0;
    document.fonts.ready.then(() => {
      fontsReady = true;
    });

    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      let target = Math.round(100 * (1 - Math.pow(1 - t, 3)));
      if (!fontsReady) target = Math.min(target, 90);
      if (target !== shown) {
        shown = target;
        out.textContent = String(shown).padStart(3, "0");
      }
      if (shown < 100) {
        frame = requestAnimationFrame(tick);
        return;
      }
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      el.dataset.state = "leaving";
      finishIntro();
      timer = window.setTimeout(() => {
        if (!alive) return;
        delete root.dataset.intro;
        lenis()?.start();
      }, 1000);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      lenis()?.start();
    };
  }, []);

  return (
    <div ref={panel} className="preloader" aria-hidden="true">
      <span ref={count} className="preloader-count numerals">
        000
      </span>
    </div>
  );
}
