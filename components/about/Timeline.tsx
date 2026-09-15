"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Arrow from "@/components/Arrow";
import NextLink from "@/components/NextLink";
import ScrollCue from "@/components/ScrollCue";
import AboutHeading from "@/components/about/AboutHeading";
import Motes from "@/components/about/Motes";
import { about, person, projects } from "@/lib/content";

/* About, told in order. Chosen on 2026-09-16 from three directions; the other
   two are at /archive/v5.

   The opening is the lead and the facts over a few slow motes. The pixel
   portrait stood beside the lead for a day and came out again, so the direction
   reads as it was meant to. Below it the story runs as a series of stops. On a wide
   screen the year stands on the left at headline size and holds still while the
   stops scroll past on the right, changing to the stop you are reading, and a
   rule beside the stops fills in as you go.

   Dates come from the resume through lib/content.ts. Aurora has no dates there,
   so it is folded into the graduation stop rather than given a year it may not
   have. The first person voice is a draft for him to rewrite. */

type Stop = {
  month: string;
  year: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
};

function project(id: string) {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error("No project with id " + id);
  return p;
}

// "March 2025 to September 2025" begins in March 2025.
function begins(period: string) {
  const [month, year] = period.split(" to ")[0].split(" ");
  return { month, year };
}

const conflict = project("conflict");
const ctximg = project("ctximg");
const prism = project("prism");

const STOPS: Stop[] = [
  {
    ...begins(conflict.period),
    title: "A number I did not believe",
    body: "About six months on a conflict detection system for video. It reported 98.4 percent accuracy and I did not believe it. The split was the problem: I had divided the data frame by frame, so almost every clip I tested on had already been seen in training. Split by source video instead, the honest number came out at 0.808 PR-AUC across 519 videos the model had never seen.",
    link: { label: "Conflict detection", href: "/projects#conflict" },
  },
  {
    ...begins(person.graduated),
    title: "Graduated",
    body: `${person.degree} from ${person.school}. For a year of it I built and looked after the website of Aurora, a student organisation, as a volunteer.`,
  },
  {
    ...begins(ctximg.period),
    title: "ctximg",
    body: "A photo search app that runs completely offline. You describe what you remember about a photo and it finds it, with no tags or filenames involved.",
    link: { label: "ctximg", href: "/projects#ctximg" },
  },
  {
    ...begins(prism.period),
    title: "Prism",
    body: "It takes a news article and pulls it apart into claims, sources and live fact checks. It is live, and it is what I am working on now.",
    link: { label: prism.link.label, href: prism.link.href },
  },
  {
    month: "",
    year: "Now",
    title: "Lucknow",
    body: "I build web applications and machine learning systems, usually end to end. Most of my time goes on things nobody notices unless they break. Outside of code I shoot photographs and do graphic design.",
    link: { label: "Photographs", href: "/work/photography" },
  },
];

function StopLink({ link }: { link: NonNullable<Stop["link"]> }) {
  const external = link.href.startsWith("http");
  const className = "group mt-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]";
  const inner = (
    <>
      <span className="transition-colors duration-300 group-hover:text-accent">{link.label}</span>
      <Arrow
        turn={external ? -45 : 0}
        className="size-4 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-accent"
      />
    </>
  );
  return external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={link.href} transitionTypes={["nav-forward"]} className={className}>
      {inner}
    </Link>
  );
}

// Where a stop's sticky year sits relative to the one being read.
function slide(i: number, active: number) {
  return i === active ? "translate-y-0 opacity-100" : i < active ? "-translate-y-full opacity-0" : "translate-y-full opacity-0";
}

export default function Timeline() {
  const [active, setActive] = useState(0);
  const stopRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The stop crossing the middle of the window is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stopRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="relative isolate flex min-h-dvh flex-col px-[5.5vw] pb-7 pt-[calc(var(--nav-h)+4vh)]">
        <Motes />
        <AboutHeading />

        <div className="flex flex-1 flex-col justify-center py-[6vh]">
          <p className="font-serif text-[clamp(2rem,4.6vw,4.3rem)] leading-[1.06] tracking-[-0.01em]">{about.lead}</p>
        </div>

        <dl className="grid grid-cols-1 gap-x-[3vw] border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
          {about.facts.map((f) => (
            <div key={f.label} className="pb-2 pt-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{f.label}</dt>
              <dd className="mt-2 text-[clamp(0.95rem,1.05vw,1.05rem)] leading-snug">{f.value}</dd>
            </div>
          ))}
        </dl>

        <ScrollCue className="mt-6" />
      </section>

      <section className="px-[5.5vw] pt-[8vh]">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-[4vw]">
          <div aria-hidden className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--nav-h)+22vh)]">
              <div className="relative h-[clamp(4.5rem,9.9vw,9rem)] overflow-hidden">
                {STOPS.map((s, i) => (
                  <span
                    key={i}
                    className={
                      "absolute inset-x-0 top-0 block font-display text-[clamp(5rem,11vw,10rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] transition-[translate,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                      slide(i, active)
                    }
                  >
                    {s.year}
                  </span>
                ))}
              </div>
              <div className="relative mt-4 h-5 overflow-hidden">
                {STOPS.map((s, i) => (
                  <span
                    key={i}
                    className={
                      "absolute inset-0 font-mono text-[12px] uppercase tracking-[0.2em] text-muted transition-[translate,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                      slide(i, active)
                    }
                  >
                    {s.month || "Today"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ol className="relative lg:col-span-7">
            {/* The rule, and the part of it filled in so far. */}
            <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-rule" />
            <span
              aria-hidden
              className="absolute left-0 top-0 w-px bg-accent transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ height: ((active + 1) / STOPS.length) * 100 + "%" }}
            />

            {STOPS.map((s, i) => (
              <li
                key={i}
                ref={(el) => {
                  stopRefs.current[i] = el;
                }}
                data-index={i}
                className="relative flex min-h-[56vh] flex-col justify-center py-[8vh] pl-[7vw] sm:pl-[5vw] lg:pl-[4vw]"
              >
                <span
                  aria-hidden
                  className={
                    "absolute left-0 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 transition-colors duration-500 " +
                    (i <= active ? "bg-accent" : "bg-rule")
                  }
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted lg:hidden">
                  {s.month ? s.month + " " + s.year : s.year}
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.92] tracking-[-0.035em] lg:mt-0">
                  {s.title}
                </h2>
                <p className="mt-5 max-w-[52ch] text-[clamp(1.02rem,1.25vw,1.2rem)] leading-[1.65]">{s.body}</p>
                {s.link ? <StopLink link={s.link} /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <NextLink from="/about" />
    </>
  );
}
