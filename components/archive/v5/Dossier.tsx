"use client";

import Link from "next/link";
import { useState } from "react";
import NextLink from "@/components/NextLink";
import AboutHeading from "@/components/about/AboutHeading";
import { about, dsa, person, projects } from "@/lib/content";

/* About as a file on him. One of three directions on trial
   (components/about/AboutSwitcher.tsx).

   A Swiss table, the device the Skills page is built on: one full width row per
   fact, the answer large on the left and its label at the far right. Pressing a
   row opens the longer version under it. Nothing moves until something is
   pressed, and the first row starts open so the device explains itself.

   Every answer comes from the resume through lib/content.ts. The first person
   voice is a draft for him to rewrite. */

type Row = {
  label: string;
  value: string;
  detail?: string;
  links?: { label: string; href: string }[];
};

function project(id: string) {
  const p = projects.find((x) => x.id === id);
  if (!p) throw new Error("No project with id " + id);
  return p;
}

const prism = project("prism");
// "April 2026 to present" has been live since April 2026.
const since = prism.period.split(" to ")[0];
// "Lucknow, Uttar Pradesh, India" reads as Lucknow, India.
const place = person.location.split(", ");

const ROWS: Row[] = [
  {
    label: "Based",
    value: `${place[0]}, ${place[place.length - 1]}`,
    // The lead without its first sentence, which the line above the table
    // already says.
    detail: about.lead.split(". ").slice(1).join(". "),
  },
  {
    label: "Building",
    value: `Prism, live since ${since}`,
    detail: "It takes a news article and pulls it apart into claims, sources and live fact checks.",
    links: [
      { label: prism.link.label, href: prism.link.href },
      { label: "The project", href: "/projects#prism" },
    ],
  },
  {
    label: "Before that",
    value: "ctximg, and a detection system for video",
    detail:
      "ctximg is a photo search app that runs completely offline: you describe what you remember about a photo and it finds it, with no tags or filenames involved. Before it came about six months on conflict detection for live video.",
    links: [
      { label: "ctximg", href: "/projects#ctximg" },
      { label: "Conflict detection", href: "/projects#conflict" },
    ],
  },
  {
    label: "Caught",
    value: "A 98.4 percent result that was wrong",
    detail:
      "I did not believe it. I had divided the data frame by frame, so almost every clip I was testing on had already been seen in training. Split by source video instead, the honest number came out at 0.808 PR-AUC across 519 videos the model had never seen.",
  },
  {
    label: "Most days",
    value: "Things nobody notices unless they break",
    detail:
      "Indexing that survives being interrupted without starting over. Failover to a second model provider when the first one starts rate limiting. A fact check that says it could not verify something instead of guessing.",
  },
  {
    label: "Studied",
    value: `${person.degree}, ${person.school}`,
    detail: `Graduated in ${person.graduated}. For a year I built and looked after the website of Aurora, a student organisation, as a volunteer.`,
  },
  {
    label: "Practice",
    value: `${dsa.total} problems solved, contest rating ${dsa.rating}`,
    links: [{ label: "DSA", href: "/dsa" }],
  },
  {
    label: "Outside code",
    value: "Photographs and graphic design",
    links: [
      { label: "Photography", href: "/work/photography" },
      { label: "Graphic design", href: "/work/design" },
    ],
  },
];

function RowLink({ link }: { link: { label: string; href: string } }) {
  const className =
    "-my-3 py-3 underline decoration-1 underline-offset-4 transition-colors duration-200 hover:text-accent";
  return link.href.startsWith("http") ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} transitionTypes={["nav-forward"]} className={className}>
      {link.label}
    </Link>
  );
}

export default function Dossier() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="px-[5.5vw] pb-[5vh] pt-[calc(var(--nav-h)+4vh)]">
        <AboutHeading />
        <p className="mt-[7vh] max-w-[36ch] font-serif text-[clamp(1.9rem,4vw,3.8rem)] leading-[1.06] tracking-[-0.01em]">
          {person.full}. {person.role}.
        </p>
      </section>

      <section className="px-[5.5vw]">
        <ul className="border-b border-rule">
          {ROWS.map((row, i) => {
            const isOpen = open === i;
            return (
              <li key={row.label} className="border-t border-rule">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-baseline gap-4 py-[2.6vh] text-left sm:gap-6"
                >
                  <span
                    className={
                      "flex-1 font-display text-[clamp(1.3rem,3vw,2.7rem)] font-black leading-[1.02] tracking-[-0.03em] transition-colors duration-300 " +
                      (isOpen ? "text-accent" : "group-hover:text-accent")
                    }
                  >
                    {row.value}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:inline">
                    {row.label}
                  </span>
                  <span
                    aria-hidden
                    className={
                      "shrink-0 font-mono text-[18px] leading-none transition-transform duration-300 " +
                      (isOpen ? "rotate-45 text-accent" : "")
                    }
                  >
                    +
                  </span>
                </button>

                {/* Grid rows from 0fr to 1fr animate to the content's own height
                    with no measuring. */}
                <div
                  className={
                    "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                    (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                  }
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <div className="grid gap-6 pb-[4vh] lg:grid-cols-12 lg:gap-x-[4vw]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:hidden">{row.label}</p>
                      {row.detail ? (
                        <p className="font-serif text-[clamp(1.2rem,1.9vw,1.75rem)] leading-[1.35] lg:col-span-8">
                          {row.detail}
                        </p>
                      ) : null}
                      {row.links ? (
                        <p className="flex flex-wrap items-end gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] lg:col-span-4 lg:col-start-9 lg:justify-end">
                          {row.links.map((link) => (
                            <RowLink key={link.href} link={link} />
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <NextLink from="/about" />
    </>
  );
}
