"use client";

import Link from "next/link";
import { Fragment, useRef } from "react";
import { projects, statement } from "@/lib/content";
import { useScrollProgress } from "@/lib/scroll";

/* The statement reads itself in as you scroll: each word goes from grey to ink
   a little after the one before it (after Artiom Yakushev and Cerebrium). The
   words in the serif italic carry the weight of the sentence. */

type Word = { text: string; serif: boolean; trail: string };

/* Splits the lead into words. Punctuation after an italic phrase attaches to
   its last word, so it never wraps alone or gains a space of its own. */
function words(source: string): Word[] {
  const out: Word[] = [];
  source.split(/(\*[^*]+\*)/).forEach((part) => {
    if (!part) return;
    const serif = part.startsWith("*");
    part
      .replace(/\*/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((text) => {
        const last = out[out.length - 1];
        if (/^[,.;:!?]+$/.test(text) && last) last.trail += text;
        else out.push({ text, serif, trail: "" });
      });
  });
  return out;
}

const LEAD = words(statement.lead);

export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  useScrollProgress(ref, "read");

  return (
    <section
      id="about"
      data-theme="paper"
      aria-label="About"
      className="px-pad pb-[clamp(88px,14vh,180px)] pt-[clamp(72px,12vh,160px)]"
    >
      <p
        ref={ref}
        className="statement t-xl max-w-[26ch] text-pretty"
        style={{ "--n": LEAD.length } as React.CSSProperties}
      >
        {LEAD.map((w, i) => (
          <Fragment key={i}>
            <span className="word" style={{ "--i": i } as React.CSSProperties}>
              {w.serif ? <span className="serif">{w.text}</span> : w.text}
              {w.trail}
            </span>{" "}
          </Fragment>
        ))}
      </p>

      <ul className="mt-[clamp(56px,9vh,120px)] grid gap-x-[var(--gap)] gap-y-8 md:grid-cols-3">
        {statement.examples.map((example, i) => {
          const project = projects.find((p) => p.slug === example.slug);
          return (
            <li key={i} className="border-t border-rule pt-4">
              <p className="t-m max-w-[24ch]">{example.text}</p>
              {project && (
                <Link
                  href={`/work/${project.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="t-mono hit mt-4 inline-block text-muted transition-colors hover:text-fg"
                >
                  {project.index} {project.title} &rarr;
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
