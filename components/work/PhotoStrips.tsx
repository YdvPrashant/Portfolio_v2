import Image from "next/image";
import type { Photo } from "@/lib/unsplash";

/* Photographs cut into tall strips behind a Photography panel, on Work and on
   Skills, so the way into the gallery shows what is in it. The parent must be
   `relative isolate`; the strips sit behind its content.

   Six strips across a phone are 60px wide each and read as dark stripes rather
   than photographs, so half of them stand down until there is width for them.

   `eager` for a panel in the first screen, where the strips are the largest
   paint on the page and lazy loading would only delay it. */
export default function PhotoStrips({ photos, eager = false }: { photos: Photo[]; eager?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 flex gap-[2px] opacity-45 transition-opacity duration-700 group-hover:opacity-70"
      >
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={"relative h-full flex-1 " + (i >= 3 ? "hidden sm:block" : "")}
            style={{ background: p.color }}
          >
            <Image
              src={p.url}
              alt=""
              fill
              sizes="(max-width: 640px) 34vw, 10vw"
              loading={eager ? "eager" : "lazy"}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--ground) 80%, transparent), color-mix(in oklab, var(--ground) 40%, transparent) 45%, color-mix(in oklab, var(--ground) 88%, transparent))",
        }}
      />
    </>
  );
}
