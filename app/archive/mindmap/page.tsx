import type { Metadata } from "next";
import SiteNav from "@/components/archive/v3/ArchivedNav";
import MindMap from "@/components/archive/mindmap/MindMap";
import { concepts } from "@/lib/skills";
import { person } from "@/lib/content";

/* Archived 2026-09-11. The mind map treatment of the skills page, kept here
   rather than deleted. The live skills page is the logo table. */

const GROUND = "#053c2b";
const BONE = "#f4f1e9";

export const metadata: Metadata = {
  title: "Skills mind map (archived) / " + person.full,
};

export default function ArchivedMindMapPage() {
  return (
    <main
      style={{ background: GROUND, color: BONE }}
      className="flex h-dvh w-full flex-col overflow-hidden"
    >
      <h1 className="sr-only">Skills mind map, archived</h1>
      <SiteNav tone={BONE} />

      <MindMap />

      <div className="flex flex-wrap items-baseline gap-x-[2.4vw] gap-y-1 px-[5.5vw] pb-6 pt-2 text-[clamp(0.8rem,1vw,0.95rem)]">
        {concepts.map((c) => (
          <span key={c} className="opacity-70">
            {c}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] opacity-45">Also</span>
      </div>
    </main>
  );
}
