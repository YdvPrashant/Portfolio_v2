"use client";

export { INTRO_KEY } from "./intro-script";

/* The preloader and the hero have to agree on one moment: the hero's stripes
   spring in as the preloader lifts. When there is no preloader (a repeat visit
   in the same session, a soft navigation, or reduced motion) that moment is
   now. The inline script next to the preloader sets data-intro="pending" on
   <html> before the first paint. */

let finished = false;
const waiting = new Set<() => void>();

function pending(): boolean {
  return !finished && document.documentElement.dataset.intro === "pending";
}

export function whenIntroDone(callback: () => void): () => void {
  if (!pending()) {
    callback();
    return () => {};
  }
  waiting.add(callback);
  return () => {
    waiting.delete(callback);
  };
}

export function finishIntro() {
  finished = true;
  waiting.forEach((callback) => callback());
  waiting.clear();
}

