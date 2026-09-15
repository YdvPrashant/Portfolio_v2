import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ArchiveSwitcher from "@/components/archive/ArchiveSwitcher";
import About from "@/components/archive/v3/About";
import ArchivedNav from "@/components/archive/v3/ArchivedNav";
import ContactSurface from "@/components/archive/v3/ContactSurface";
import Landing from "@/components/archive/v3/Landing";
import ProjectSlider from "@/components/archive/v3/ProjectSlider";
import { person, projects } from "@/lib/content";
import { projectImage } from "@/lib/project-images";

/* Home, About, Projects and Contact as they stood before the calm redesign of
   2026-09-15: the acid landing with its blocks, the violet flow field, a neon
   ground per project, and magenta with the cursor disc. Reviewers found the
   neon grounds hard on the eyes. */

export const metadata: Metadata = {
  title: "Archive, before the calm redesign / " + person.full,
};

const RESUME = "prashant-yadav-resume.pdf";

export default function ArchiveV3Page() {
  const images = Object.fromEntries(projects.map((p) => [p.id, projectImage(p.id)]));
  const resume = fs.existsSync(path.join(process.cwd(), "public", RESUME)) ? "/" + RESUME : null;

  return (
    <ArchiveSwitcher
      views={[
        { name: "Landing", note: "acid and blocks", el: <Landing /> },
        { name: "About", note: "flow field", el: <About /> },
        { name: "Projects", note: "colour per slide", el: <ProjectSlider images={images} /> },
        {
          name: "Contact",
          note: "magenta and disc",
          el: (
            <main className="relative">
              <div className="absolute inset-x-0 top-0 z-20">
                <ArchivedNav tone="#0b0b0b" />
              </div>
              <ContactSurface resume={resume} />
            </main>
          ),
        },
      ]}
    />
  );
}
