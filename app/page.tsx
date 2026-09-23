import { Hero } from "@/components/home/Hero";
import { Lens } from "@/components/home/Lens";
import { Measured } from "@/components/home/Measured";
import { Preloader } from "@/components/home/Preloader";
import { Statement } from "@/components/home/Statement";
import { StickerWall } from "@/components/home/StickerWall";
import { TypeRace } from "@/components/home/TypeRace";
import { WorkTrack } from "@/components/home/WorkTrack";
import { Footer } from "@/components/site/Footer";
import { PageTransition } from "@/components/site/PageTransition";
import { getPhotos } from "@/lib/unsplash";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <PageTransition>
      <main id="main">
        <Preloader />
        <Hero />
        <Statement />
        <WorkTrack />
        <Measured />
        <TypeRace />
        <Lens photos={photos} />
        <StickerWall />
      </main>
      <Footer />
    </PageTransition>
  );
}
