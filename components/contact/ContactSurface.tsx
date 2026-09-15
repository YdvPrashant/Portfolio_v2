"use client";

import Image from "next/image";
import { useState } from "react";
import LikeButton from "@/components/contact/LikeButton";
import NextLink from "@/components/NextLink";
import SectionTitle from "@/components/SectionTitle";
import RollText from "@/components/type/RollText";
import { person } from "@/lib/content";
import { UNSPLASH_PROFILE } from "@/lib/unsplash";

/* Contact. The address is the page.

   Pointing at it rolls every character over, left to right, into the accent
   (components/type/RollText.tsx). It used to swell in weight under the pointer,
   but that was the name on Home doing the same thing twice, so Contact now has
   a motion of its own. Before that it had a large inverting disc that followed
   the cursor, which read as a gimmick; that version is at /archive/v3.

   Sized to the longer line, the fifteen characters before the @, which want
   about 8.6em against an 89vw measure; at a larger size it overran and the
   section clipped the end of the word. */

const CHANNELS = [
  { label: "LinkedIn", href: person.linkedin },
  { label: "GitHub", href: person.github },
  { label: "Unsplash", href: UNSPLASH_PROFILE },
];

const [LOCAL, DOMAIN] = person.email.split("@");

export default function ContactSurface({ resume }: { resume: string | null }) {
  const [copied, setCopied] = useState(false);

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
    <section className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden pt-(--nav-h)">
      <div className="flex flex-1 items-center px-[5.5vw] pb-[4vh] pt-[3vh]">
        <div className="w-full">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tabular-nums text-muted">06</span>
            <SectionTitle slug="contact">
              <h1 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
                Contact
              </h1>
            </SectionTitle>
          </div>

          <a href={"mailto:" + person.email} className="group mt-[6vh] block">
            <span className="sr-only">{person.email}</span>
            <RollText
              lines={[LOCAL, "@" + DOMAIN]}
              className="font-display text-[clamp(1.6rem,9.6vw,9rem)] font-black leading-[0.84] tracking-[-0.05em]"
            />
          </a>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-4">
            <button
              onClick={copy}
              className="group inline-flex items-baseline gap-3 border-t border-rule pt-4 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <span className="text-muted">{copied ? "Copied" : "Or copy it"}</span>
              <span
                aria-live="polite"
                className="font-display text-[1.05rem] font-black uppercase tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent"
              >
                {copied ? "Done" : "Copy"}
              </span>
            </button>

            {resume ? (
              <a
                href={resume}
                download="Prashant-Yadav-Resume.pdf"
                className="group inline-flex items-baseline gap-3 border-t border-rule pt-4 font-mono text-[11px] uppercase tracking-[0.18em]"
              >
                <span className="text-muted">Or take the</span>
                <span className="font-display text-[1.05rem] font-black uppercase tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
                  Resume
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* The like sits above the channels: a site wide like can only honestly
          mean "I liked this", so the end of the journey is the place to ask.
          The portrait sits opposite, sized to an exact quarter of its 512px
          source, because nearest neighbour scaling at a fractional ratio drops
          pixel rows unevenly. Its filter and blend come from the theme, so it
          reads as ink on a light ground and as light on a dark one. */}
      <div className="flex items-end justify-between gap-6 px-[5.5vw] pb-6">
        <LikeButton />
        <Image
          src="/avatar.png"
          alt={"Pixel portrait of " + person.full}
          width={512}
          height={512}
          unoptimized
          className="hidden h-32 w-32 shrink-0 rounded-full [filter:var(--avatar-filter)] [image-rendering:pixelated] [mix-blend-mode:var(--avatar-blend)] sm:block"
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule px-[5.5vw] py-6 font-mono text-[11px] uppercase tracking-[0.18em]">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="-my-3 py-3 transition-colors duration-200 hover:text-accent"
            >
              {c.label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <span className="text-muted">{person.location}</span>
          <NextLink from="/contact" compact />
        </div>
      </div>
    </section>
  );
}
