"use client";

import { useEffect, useState } from "react";
import Stretch from "@/components/archive/v2/Stretch";
import Bands from "@/components/archive/v2/Bands";
import Blocks from "@/components/archive/v2/Blocks";
import Extrude from "@/components/archive/v2/Extrude";

/* Archived 2026-09-11. The second round of landing directions, built from the
   brief alone. Stretch and Blocks were both chosen and merged into the live
   landing; Bands and Extrude are kept here. */

const DIRECTIONS = [
  { name: "Stretch", note: "variable type", el: <Stretch /> },
  { name: "Bands", note: "shear", el: <Bands /> },
  { name: "Blocks", note: "composition", el: <Blocks /> },
  { name: "Extrude", note: "dimension", el: <Extrude /> },
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

      <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[94vw] -translate-x-1/2 items-stretch gap-1.5 overflow-x-auto rounded-xl bg-[#0e0e0e]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        {DIRECTIONS.map((d, n) => (
          <button
            key={d.name}
            onClick={() => setI(n)}
            aria-pressed={i === n}
            title={`Press ${n + 1}`}
            className={
              "shrink-0 rounded-lg px-3 py-2 text-left transition-colors duration-200 " +
              (i === n ? "bg-white text-[#0e0e0e]" : "text-white/50 hover:bg-white/10 hover:text-white")
            }
          >
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
              {n + 1} {d.note}
            </span>
            <span className="mt-0.5 block whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
              {d.name}
            </span>
          </button>
        ))}

        <a
          href="/archive/v1"
          className="flex shrink-0 items-center rounded-lg px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          Round 1
        </a>
      </div>
    </main>
  );
}
