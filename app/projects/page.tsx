import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ProjectSlider from "@/components/projects/ProjectSlider";
import { person, projects } from "@/lib/content";

/* Projects. Three panels on one horizontal track, because they were never
   meant to stack down the page.

   The screenshot for each is resolved here, at build time, by looking for a
   file named after the project id in public/projects. Drop one in and it
   replaces the placeholder with no code change; until then the panel shows a
   marked-up box naming the file it wants. */

const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

function findImage(id: string): string | null {
  const dir = path.join(process.cwd(), "public", "projects");
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(dir, id + "." + ext))) return "/projects/" + id + "." + ext;
  }
  return null;
}

export const metadata: Metadata = {
  title: "Projects / " + person.full,
  description: "Prism, a real time conflict detection pipeline, and ctximg.",
};

export default function ProjectsPage() {
  const images = Object.fromEntries(projects.map((p) => [p.id, findImage(p.id)]));

  return (
    <main>
      <h1 className="sr-only">Projects</h1>
      <ProjectSlider images={images} />
    </main>
  );
}
