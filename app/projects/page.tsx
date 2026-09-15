import type { Metadata } from "next";
import PageTransition from "@/components/PageTransition";
import ProjectSlider from "@/components/projects/ProjectSlider";
import { person, projects } from "@/lib/content";
import { projectImage } from "@/lib/project-images";

/* Projects. Three panels on one horizontal track, because they were never meant
   to stack down the page. Screenshots are resolved at build time; see
   lib/project-images.ts. */

export const metadata: Metadata = {
  title: "Projects / " + person.full,
  description: "Prism, a real time conflict detection pipeline, and ctximg.",
};

export default function ProjectsPage() {
  const images = Object.fromEntries(projects.map((p) => [p.id, projectImage(p.id)]));

  return (
    <PageTransition>
      <main>
        <ProjectSlider images={images} />
      </main>
    </PageTransition>
  );
}
