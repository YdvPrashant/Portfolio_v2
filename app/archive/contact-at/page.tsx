import type { Metadata } from "next";
import { AtContact } from "@/components/archive/AtContact";
import { PageTransition } from "@/components/site/PageTransition";
import { contactPhoto } from "@/lib/content";
import { getPhotos, photoUrl } from "@/lib/unsplash";

/* An archived design, kept where Prashant can open it. Nothing links here,
   and search engines are asked to leave it out. */

export const metadata: Metadata = {
  title: "The @, an archived contact section",
  robots: { index: false, follow: false },
};

export default async function ArchivedContact() {
  const photos = await getPhotos();
  const photo = photos.find((p) => p.id === contactPhoto);
  const sizes = photo ? { small: photoUrl(photo.src, 1200, 80), large: photoUrl(photo.src, 2000, 80) } : null;

  return (
    <PageTransition>
      <main id="main">
        <section
          data-theme="paper"
          className="px-pad pb-[clamp(96px,32vh,340px)] pt-[calc(var(--header)+clamp(32px,7vh,96px))]"
        >
          <h1 className="t-xl">The @</h1>
          <p className="t-m mt-6 max-w-[40ch] text-pretty text-muted">
            Another design for the contact section, made on 2 October 2026 beside the tear-off flyer that now closes
            the home page and the case studies. Kept here as it was built.
          </p>
        </section>
        <AtContact photo={sizes} />
      </main>
    </PageTransition>
  );
}
