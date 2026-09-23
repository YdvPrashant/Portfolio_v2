import Image from "next/image";
import { ViewTransition } from "react";
import type { Project } from "@/lib/content";
import { PipelineDiagram } from "./PipelineDiagram";

/* A project's screenshot, or its diagram when there is nothing to screenshot.
   The same name on the home page and the case study lets the browser morph
   one into the other. Screenshots keep their own aspect ratio: cropping an
   interface cuts off the thing it exists to show. */

// Only links from the work track morph; the same image further down the home
// page would otherwise fly in from off screen.
const MORPH = { "work-morph": "morph", default: "none" };

type Props = {
  project: Project;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function ProjectMedia({ project, sizes, priority, className = "" }: Props) {
  const m = project.media;
  return (
    <ViewTransition name={`media-${project.slug}`} share={MORPH} default="none">
      {m.kind === "image" ? (
        <div
          className={`relative overflow-hidden ${m.tone === "dark" ? "outline outline-1 -outline-offset-1 outline-rule" : ""} ${className}`}
          style={{ aspectRatio: `${m.width} / ${m.height}` }}
        >
          <Image src={m.src} alt={m.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : (
        <div
          className={`relative outline outline-1 -outline-offset-1 outline-rule ${className}`}
          style={{ aspectRatio: "1560 / 640" }}
        >
          <PipelineDiagram className="absolute inset-0 h-full w-full p-[4%]" title={m.alt} />
        </div>
      )}
    </ViewTransition>
  );
}
