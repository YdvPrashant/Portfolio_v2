"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/* Smooth scrolling, as on nearly every Awwwards winner studied for this site.
   Lenis animates the native scroll position, so sticky positioning, anchors and
   the scroll loop in lib/scroll.ts all keep working. It honours reduced motion
   on its own by tracking the wheel one to one. Elements marked
   data-lenis-prevent (the photograph field) handle their own wheel input. */

let instance: Lenis | null = null;

export function lenis(): Lenis | null {
  return instance;
}

export function SmoothScroll() {
  useEffect(() => {
    instance = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    return () => {
      instance?.destroy();
      instance = null;
    };
  }, []);

  return null;
}
