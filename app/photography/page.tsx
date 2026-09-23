import type { Metadata } from "next";
import { PhotoField } from "@/components/photo/PhotoField";
import { PageTransition } from "@/components/site/PageTransition";
import { getPhotos, UNSPLASH_PROFILE } from "@/lib/unsplash";

export const metadata: Metadata = {
  title: "Photographs",
  description:
    "Photographs by Prashant Yadav, loaded live from his Unsplash profile: flowers after rain, mountain valleys, streets at night.",
};

export default async function PhotographyPage() {
  const photos = await getPhotos();

  return (
    <PageTransition>
      <main id="main" data-theme="ink" className="min-h-svh">
        {photos.length > 0 ? (
          <PhotoField photos={photos} />
        ) : (
          <section className="flex min-h-svh flex-col justify-end px-pad pb-[var(--pad)]">
            <h1 className="t-xxl">Photographs</h1>
            <p className="t-m mt-6 max-w-[36ch] text-muted">
              The photographs could not be loaded just now. They live on Unsplash, where they are always up to
              date.
            </p>
            <a href={UNSPLASH_PROFILE} className="t-m link-line mt-6 inline-block" target="_blank" rel="noopener">
              unsplash.com/@pr7nt &#8599;
            </a>
          </section>
        )}
      </main>
    </PageTransition>
  );
}
