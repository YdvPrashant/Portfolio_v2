"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LikeButton from "@/components/archive/v3/LikeButton";
import { person } from "@/lib/content";
import { UNSPLASH_PROFILE } from "@/lib/unsplash";

/* Contact. The address is the page.

   The one effect is a disc that follows the pointer in difference blend mode.
   Over the magenta ground it resolves to teal, over the near-black type it
   resolves to white, so moving the cursor inverts whatever it crosses. One
   element, no canvas, and nothing like any other page on the site.

   Difference blending only reaches the backdrop inside its own stacking
   context, which is why the section isolates: without that the disc would
   blend against the page behind it and come out grey.

   The disc is driven by a transform written in rAF rather than by state, and
   whether it shows at all is a CSS media query (see .cursor-disc) rather than
   a piece of React state. Deciding that after mount would mean setting state in
   an effect for something the stylesheet already knows. */

const GROUND = "#ff2d6f";
const INK = "#0b0b0b";

const CHANNELS = [
  { label: "LinkedIn", href: person.linkedin },
  { label: "GitHub", href: person.github },
  { label: "Unsplash", href: UNSPLASH_PROFILE },
];

const [LOCAL, DOMAIN] = person.email.split("@");

export default function ContactSurface({ resume }: { resume: string | null }) {
  const discRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      disc.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is blocked in some contexts. The mailto link still works, and
      // the address is on screen to be read, so there is nothing to recover.
    }
  };

  return (
    <section
      style={{ background: GROUND, color: INK }}
      className="relative isolate flex min-h-dvh w-full flex-col justify-between overflow-hidden"
    >
      <div className="flex flex-1 items-center px-[5.5vw] pb-[4vh] pt-[14vh] sm:pt-[12vh]">
        <div className="w-full">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">Write to me</p>

          <a
            href={"mailto:" + person.email}
            /* Sized to the longer line, the fifteen characters before the @,
               which want about 8.6em against a measure of 89vw. At 11.5vw
               capped at 10rem it overran at every width and the section clipped
               it — on the one page that is nothing but an address, which is the
               worst place to lose the end of a word. */
            className="mt-4 block font-[family-name:var(--font-archivo)] text-[clamp(1.6rem,9.6vw,9rem)] font-black leading-[0.84] tracking-[-0.05em]"
          >
            <span className="block">{LOCAL}</span>
            <span className="block">@{DOMAIN}</span>
          </a>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-10 gap-y-4">
            <button
              onClick={copy}
              className="inline-flex items-baseline gap-3 border-t pt-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-60"
              style={{ borderColor: "rgba(11,11,11,0.3)" }}
            >
              <span className="opacity-55">{copied ? "Copied" : "Or copy it"}</span>
              <span aria-live="polite" className="font-[family-name:var(--font-archivo)] text-[1.05rem] font-black uppercase tracking-[-0.02em]">
                {copied ? "Done" : "Copy"}
              </span>
            </button>

            {resume ? (
              <a
                href={resume}
                download="Prashant-Yadav-Resume.pdf"
                className="group inline-flex items-baseline gap-3 border-t pt-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-60"
                style={{ borderColor: "rgba(11,11,11,0.3)" }}
              >
                <span className="opacity-55">Or take the</span>
                <span className="font-[family-name:var(--font-archivo)] text-[1.05rem] font-black uppercase tracking-[-0.02em]">
                  Resume
                </span>
              </a>
            ) : null}
          </div>
        </div>

      </div>

      {/* Its own row above the channels bar. A site wide like can only honestly
          mean "I liked this", so the end of the journey is the only place to
          ask for it. The portrait sits opposite it, in what was dead corner. */}
      <div className="flex items-end justify-between gap-6 px-[5.5vw] pb-6">
        <LikeButton tone={INK} />

        {/* Greyscaled and multiplied so it reads as ink on the magenta rather
            than as a sticker: its own Game Boy greens are this ground's
            complement and fight it badly left alone. Sized to an exact quarter
            of the 512px source, because nearest neighbour scaling at a
            fractional ratio drops pixel rows unevenly and the grid stops being
            square. */}
        <Image
          src="/avatar.png"
          alt={"Pixel portrait of " + person.full}
          width={512}
          height={512}
          unoptimized
          className="hidden h-32 w-32 shrink-0 rounded-full sm:block"
          style={{ imageRendering: "pixelated", mixBlendMode: "multiply", filter: "grayscale(1) contrast(1.15)" }}
        />
      </div>

      <div
        className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t px-[5.5vw] py-7 font-mono text-[11px] uppercase tracking-[0.18em]"
        style={{ borderColor: "rgba(11,11,11,0.3)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition-opacity duration-200 hover:opacity-55"
            >
              {c.label}
            </a>
          ))}
        </div>
        <span className="opacity-55">{person.location}</span>
      </div>

      <div
        ref={discRef}
        aria-hidden
        className="cursor-disc pointer-events-none fixed left-0 top-0 z-10 rounded-full bg-white"
        style={{
          width: "clamp(240px, 30vw, 480px)",
          height: "clamp(240px, 30vw, 480px)",
          mixBlendMode: "difference",
        }}
      />
    </section>
  );
}
