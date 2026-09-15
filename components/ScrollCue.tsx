"use client";

import { useSyncExternalStore } from "react";

/* A small prompt that there is more below, for first screens that fill the
   window and hide what follows. It goes the moment the page moves, because by
   then it has said all it had to say. */

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const atTop = () => window.scrollY < 24;

export default function ScrollCue({ className = "" }: { className?: string }) {
  const show = useSyncExternalStore(subscribe, atTop, () => true);

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-opacity duration-500 " +
        (show ? "opacity-100 " : "opacity-0 ") +
        className
      }
    >
      <span className="scroll-cue-line relative block h-7 w-px overflow-hidden bg-rule text-ink" />
      Scroll
    </div>
  );
}
