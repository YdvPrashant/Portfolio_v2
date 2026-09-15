import type { Metadata } from "next";
import Timeline from "@/components/about/Timeline";
import PageTransition from "@/components/PageTransition";
import { person } from "@/lib/content";

/* About, as a timeline (components/about/Timeline.tsx). Chosen on 2026-09-16
   from three directions on trial; Portrait and Dossier are at /archive/v5.

   data-page lets a theme give this page a ground of its own: in Vivid it takes
   back the deep violet the original About had. */

export const metadata: Metadata = {
  title: "About / " + person.full,
  description: person.role + ".",
};

export default function AboutPage() {
  return (
    <PageTransition>
      <main data-page="about" className="bg-ground text-ink">
        <Timeline />
      </main>
    </PageTransition>
  );
}
