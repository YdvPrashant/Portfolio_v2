"use client";

import { useEffect, useState } from "react";
import InkField from "@/components/archive/v1/InkField";
import Overprint from "@/components/archive/v1/Overprint";
import ColourIndex from "@/components/archive/v1/ColourIndex";

/* Archived 2026-09-11. The first round of landing directions, kept reachable
   at /archive/v1 rather than deleted. Superseded by a second round built from
   the brief alone. */

const DIRECTIONS = [
  { key: "A", name: "Ink Field", note: "motion led", el: <InkField /> },
  { key: "B", name: "Overprint", note: "material led", el: <Overprint /> },
  { key: "C", name: "Colour Index", note: "structure led", el: <ColourIndex /> },
];

export default function Page() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= DIRECTIONS.length) setI(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative">
      {DIRECTIONS[i].el}

      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-stretch gap-1.5 rounded-xl bg-[#0e0e0e]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        {DIRECTIONS.map((d, n) => (
          <button
            key={d.key}
            onClick={() => setI(n)}
            aria-pressed={i === n}
            title={`Press ${n + 1}`}
            className={
              "rounded-lg px-3 py-2 text-left transition-colors duration-200 " +
              (i === n ? "bg-white text-[#0e0e0e]" : "text-white/50 hover:bg-white/10 hover:text-white")
            }
          >
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
              {n + 1} {d.note}
            </span>
            <span className="mt-0.5 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] whitespace-nowrap">
              {d.name}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
