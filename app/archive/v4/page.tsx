import type { Metadata } from "next";
import ArchiveSwitcher from "@/components/archive/ArchiveSwitcher";
import AboutStory from "@/components/archive/v4/AboutStory";
import HomeIndex from "@/components/archive/v4/HomeIndex";
import ProjectSliderMinimal from "@/components/archive/v4/ProjectSliderMinimal";
import { dsa, person, projects } from "@/lib/content";
import { projectImage } from "@/lib/project-images";
import { concepts, skillRows } from "@/lib/skills";

/* The first pass of the calm redesign, 2026-09-15, set aside the same day: a
   home page built around a section index (he wanted the block landing back in
   the new colours), About with a figure column beside the story (he asked for
   something new), and a sparser Projects slider (he preferred the original). */

export const metadata: Metadata = {
  title: "Archive, calm redesign first pass / " + person.full,
};

function homeNotes(): Record<string, string> {
  const tools = skillRows.reduce((n, row) => n + row.items.length, 0);
  return {
    about: "Engineer in Lucknow, web and ML",
    skills: `${tools} tools, ${concepts.length} techniques, a typing test`,
    projects: "Prism, conflict detection, ctximg",
    dsa: `${dsa.total} solved, ${dsa.rating} rating`,
    work: "Photography and graphic design",
    contact: "Email, LinkedIn, GitHub",
  };
}

export default function ArchiveV4Page() {
  const images = Object.fromEntries(projects.map((p) => [p.id, projectImage(p.id)]));

  return (
    <ArchiveSwitcher
      views={[
        { name: "Home", note: "section index", el: <HomeIndex notes={homeNotes()} /> },
        { name: "About", note: "story and figures", el: <AboutStory /> },
        { name: "Projects", note: "sparser slides", el: <ProjectSliderMinimal images={images} /> },
      ]}
    />
  );
}
