import { Hero } from "@/components/home/Hero";
import { Lens } from "@/components/home/Lens";
import { Measured } from "@/components/home/Measured";
import { Skills } from "@/components/home/Skills";
import { Statement } from "@/components/home/Statement";
import { TypeRace } from "@/components/home/TypeRace";
import { WorkTrack } from "@/components/home/WorkTrack";
import { Footer } from "@/components/site/Footer";
import { PageTransition } from "@/components/site/PageTransition";
import { heroPhoto } from "@/lib/content";
import { describePhoto, getPhotoDetails, getPhotos, getReach, lensPhotoOf } from "@/lib/unsplash";

export default async function Home() {
  const photos = await getPhotos();
  const lens = lensPhotoOf(photos);
  const [reach, lensDetails] = await Promise.all([getReach(), lens ? getPhotoDetails(lens.id) : null]);

  return (
    <PageTransition>
      <main id="main">
        <Hero photo={photos.find((p) => p.id === heroPhoto) ?? null} />
        <Statement />
        <WorkTrack />
        <Measured />
        <TypeRace />
        <Lens photos={photos} reach={reach} caption={lensDetails ? describePhoto(lensDetails) || null : null} />
        <Skills />
      </main>
      <Footer />
    </PageTransition>
  );
}
