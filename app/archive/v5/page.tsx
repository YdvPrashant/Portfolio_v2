import type { Metadata } from "next";
import ArchiveSwitcher from "@/components/archive/ArchiveSwitcher";
import CreativePiles from "@/components/archive/v5/CreativePiles";
import CreativeWords from "@/components/archive/v5/CreativeWords";
import Dossier from "@/components/archive/v5/Dossier";
import Portrait from "@/components/archive/v5/Portrait";
import WorkCover from "@/components/archive/v5/WorkCover";
import WorkSheet from "@/components/archive/v5/WorkSheet";
import { person } from "@/lib/content";
import { getPhotos } from "@/lib/unsplash";

/* Set aside in September 2026: the two About directions not chosen, and four
   attempts to better the creative work page. A contact sheet, a cover that
   leafed through photographs, the two disciplines as words cut out of
   photographs, and two stacks of prints that fanned out. He asked for the
   original two panels back, so that is the live page again. The pixel portrait
   lives on here too: it stood in the About timeline for a day before coming
   out. */

export const metadata: Metadata = {
  title: "Archive, second pass / " + person.full,
};

export default async function ArchiveV5Page() {
  const photos = await getPhotos(30);

  return (
    <ArchiveSwitcher
      views={[
        {
          name: "Portrait",
          note: "about",
          el: (
            <main>
              <Portrait />
            </main>
          ),
        },
        {
          name: "Dossier",
          note: "about",
          el: (
            <main>
              <Dossier />
            </main>
          ),
        },
        {
          name: "Sheet",
          note: "work",
          el: (
            <main className="pt-[8vh]">
              <WorkSheet photos={photos} />
            </main>
          ),
        },
        {
          name: "Cover",
          note: "work",
          el: (
            <main className="pt-[8vh]">
              <WorkCover photos={photos} />
            </main>
          ),
        },
        {
          name: "Two words",
          note: "work",
          el: (
            <main className="flex min-h-dvh flex-col pt-[8vh]">
              <CreativeWords photos={photos} />
            </main>
          ),
        },
        {
          name: "Stacks",
          note: "work",
          el: (
            <main className="flex min-h-dvh flex-col pt-[8vh]">
              <CreativePiles photos={photos} />
            </main>
          ),
        },
      ]}
    />
  );
}
