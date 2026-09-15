import NextLink from "@/components/NextLink";
import ScrollCue from "@/components/ScrollCue";
import AboutHeading from "@/components/about/AboutHeading";
import Marked from "@/components/archive/v5/Marked";
import PixelPortrait from "@/components/archive/v5/PixelPortrait";
import { about } from "@/lib/content";

/* About as a portrait. One of three directions on trial
   (components/about/AboutSwitcher.tsx).

   The pixel portrait from Contact, redrawn large in the palette's own colours,
   holds the left of the first screen; who he is and the facts hold the right.
   The story follows in two columns, with the things it names linking to where
   they live. Nothing moves except the portrait developing the first time it is
   seen. */

export default function Portrait() {
  return (
    <>
      <section className="flex min-h-dvh flex-col px-[5.5vw] pb-7 pt-[calc(var(--nav-h)+3vh)]">
        <div className="grid flex-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-[5vw]">
          <div className="lg:col-span-5">
            <PixelPortrait className="mx-auto max-w-[min(100%,68vh)]" />
          </div>

          <div className="lg:col-span-7">
            <AboutHeading />
            <p className="mt-[5vh] font-serif text-[clamp(1.9rem,3.6vw,3.5rem)] leading-[1.08] tracking-[-0.01em]">
              {about.lead}
            </p>
            <dl className="mt-[6vh] grid gap-x-[3vw] sm:grid-cols-2">
              {about.facts.map((f) => (
                <div key={f.label} className="border-t border-rule py-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
                  <dd className="mt-2 text-[clamp(0.95rem,1.05vw,1.06rem)] leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ScrollCue className="mt-6" />
      </section>

      <section className="px-[5.5vw] pt-[10vh]">
        <div className="lg:columns-2 lg:gap-[5vw]">
          {about.body.map((para) => (
            <p
              key={para.slice(0, 24)}
              className="mb-7 break-inside-avoid text-[clamp(1.02rem,1.25vw,1.2rem)] leading-[1.65] last:mb-0"
            >
              <Marked text={para} />
            </p>
          ))}
        </div>
      </section>

      <NextLink from="/about" />
    </>
  );
}
