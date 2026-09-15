import FlowField from "@/components/archive/v4/FlowField";
import Story, { type Figure } from "@/components/archive/v4/Story";
import NextLink from "@/components/NextLink";
import ScrollCue from "@/components/ScrollCue";
import SectionTitle from "@/components/SectionTitle";
import { about } from "@/lib/content";
import { projectImage } from "@/lib/project-images";
import { getPhotos } from "@/lib/unsplash";

/* About as it stood for a day on 2026-09-15: the lead over a quiet flow field,
   then the story with a figure column that followed the paragraph being read
   and whatever name was pointed at. Set aside at his request ("about section
   make something new"). */

export default async function AboutStory() {
  const photos = await getPhotos(12);
  // A landscape frame suits the figure column; any photograph will do if none is.
  const photo = photos.find((p) => p.width > p.height) ?? photos[0];
  const prism = projectImage("prism");
  const ctximg = projectImage("ctximg");

  const figures: Record<string, Figure> = {};
  if (prism) {
    figures.prism = { kind: "image", src: prism, caption: "Prism, live at prismrefractor.in", href: "/projects#prism", fit: "contain" };
  }
  if (ctximg) {
    figures.ctximg = { kind: "image", src: ctximg, caption: "ctximg, the desktop app", href: "/projects#ctximg", fit: "contain" };
  }
  figures.conflict = { kind: "diagram", caption: "The detection cascade, drawn", href: "/projects#conflict" };
  if (photo) {
    figures.photos = { kind: "image", src: photo.url, caption: "One of my photographs", href: "/work/photography", fit: "cover" };
  }

  return (
    <main>
      <section className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden pt-(--nav-h)">
        <FlowField />

        <div className="relative flex flex-1 flex-col justify-center px-[5.5vw] pb-[3vh] pt-[4vh]">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tabular-nums text-muted">01</span>
            <SectionTitle slug="about">
              <h1
                data-flow-obstacle
                className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]"
              >
                About
              </h1>
            </SectionTitle>
          </div>

          <div className="mt-[7vh] flex w-full flex-col gap-[6vh] lg:flex-row lg:items-start lg:gap-[6vw]">
            <p
              data-flow-obstacle
              className="flex-1 font-serif text-[clamp(1.9rem,4.4vw,4rem)] leading-[1.08] tracking-[-0.01em]"
            >
              {about.lead}
            </p>

            <dl data-flow-obstacle className="w-full shrink-0 lg:w-[31%]">
              {about.facts.map((f) => (
                <div
                  key={f.label}
                  className="border-t border-rule py-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
                  <dd className="mt-2 text-[clamp(0.95rem,1.05vw,1.06rem)] leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ScrollCue className="relative px-[5.5vw] pb-7" />
      </section>

      <Story paragraphs={about.body} figures={figures} />

      <NextLink from="/about" />
    </main>
  );
}
