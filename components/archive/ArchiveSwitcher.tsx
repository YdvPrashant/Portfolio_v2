"use client";

import { useEffect, useState } from "react";

/* Switches between archived versions of pages, which are kept reachable rather
   than deleted: he has asked for an earlier direction back more than once.
   Press 1 to 9 to switch. */

type View = { name: string; note: string; el: React.ReactNode };

export default function ArchiveSwitcher({ views }: { views: View[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= views.length) setI(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [views.length]);

  return (
    <div className="relative">
      {views[i].el}

      <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[94vw] -translate-x-1/2 items-stretch gap-1.5 overflow-x-auto rounded-xl bg-[#0e0e0e]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        {views.map((v, n) => (
          <button
            key={v.name}
            onClick={() => setI(n)}
            aria-pressed={i === n}
            title={`Press ${n + 1}`}
            className={
              "shrink-0 rounded-lg px-3 py-2 text-left transition-colors duration-200 " +
              (i === n ? "bg-white text-[#0e0e0e]" : "text-white/50 hover:bg-white/10 hover:text-white")
            }
          >
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
              {n + 1} {v.note}
            </span>
            <span className="mt-0.5 block whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
              {v.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
