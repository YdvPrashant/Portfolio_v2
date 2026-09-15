"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import PipelineDiagram from "@/components/projects/PipelineDiagram";

/* The About story, with the things it mentions shown beside it.

   Names in the copy are marked [like this](key). Each marked name links to where
   that thing lives on the site, and a figure column beside the prose shows it:
   the Prism and ctximg screenshots, the detection pipeline, one of the
   photographs. The column follows the paragraph you are reading, and pointing
   at a name shows that one instead.

   This took the place of a swirl that followed the cursor over the flow field.
   Nothing chases the pointer here; the page answers what you point at. Below lg
   there is no room beside the prose, so the figures stand down and the names
   are simply links. */

export type Figure =
  | { kind: "image"; src: string; caption: string; href: string; fit: "contain" | "cover" }
  | { kind: "diagram"; caption: string; href: string };

type Piece = { text: string; key: string | null };

const MARK = /\[([^\]]+)\]\(([a-z]+)\)/g;

function parse(paragraph: string): Piece[] {
  const pieces: Piece[] = [];
  let last = 0;
  for (const m of paragraph.matchAll(MARK)) {
    if (m.index > last) pieces.push({ text: paragraph.slice(last, m.index), key: null });
    pieces.push({ text: m[1], key: m[2] });
    last = m.index + m[0].length;
  }
  if (last < paragraph.length) pieces.push({ text: paragraph.slice(last), key: null });
  return pieces;
}

export default function Story({
  paragraphs,
  figures,
}: {
  paragraphs: readonly string[];
  figures: Record<string, Figure>;
}) {
  const parsed = useMemo(() => paragraphs.map(parse), [paragraphs]);

  // What each paragraph shows while it is being read: the first thing it names
  // that has a figure.
  const leads = useMemo(
    () => parsed.map((pieces) => pieces.find((p) => p.key !== null && p.key in figures)?.key ?? null),
    [parsed, figures],
  );

  const [pointed, setPointed] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(() => leads.find((k) => k !== null) ?? null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    // The paragraph crossing a band a little above the middle of the window is
    // the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = leads[Number((entry.target as HTMLElement).dataset.index)];
          if (key) setReading(key);
        }
      },
      { rootMargin: "-38% 0px -52% 0px" },
    );
    paragraphRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [leads]);

  const shown = pointed ?? reading;

  return (
    <section className="px-[5.5vw] pt-[14vh]">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-[4vw]">
        <div className="lg:col-span-7">
          {parsed.map((pieces, i) => (
            <p
              key={i}
              ref={(el) => {
                paragraphRefs.current[i] = el;
              }}
              data-index={i}
              className="mb-8 max-w-[62ch] text-[clamp(1.05rem,1.3vw,1.28rem)] leading-[1.68] last:mb-0"
            >
              {pieces.map((piece, j) => {
                const key = piece.key;
                const figure = key ? figures[key] : undefined;
                if (!key || !figure) return <Fragment key={j}>{piece.text}</Fragment>;
                return (
                  <Link
                    key={j}
                    href={figure.href}
                    transitionTypes={["nav-forward"]}
                    onPointerEnter={() => setPointed(key)}
                    onPointerLeave={() => setPointed(null)}
                    onFocus={() => setPointed(key)}
                    onBlur={() => setPointed(null)}
                    className={
                      "underline decoration-1 underline-offset-[5px] transition-colors duration-300 " +
                      (pointed === key
                        ? "text-accent decoration-accent"
                        : shown === key
                          ? "decoration-accent"
                          : "decoration-muted hover:text-accent hover:decoration-accent")
                    }
                  >
                    {piece.text}
                  </Link>
                );
              })}
            </p>
          ))}
        </div>

        <aside aria-hidden className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--nav-h)+6vh)]">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-raised">
              {Object.entries(figures).map(([key, figure]) => (
                <div
                  key={key}
                  className={
                    "absolute inset-0 transition-opacity duration-500 ease-out " +
                    (shown === key ? "opacity-100" : "opacity-0")
                  }
                >
                  {figure.kind === "diagram" ? (
                    <PipelineDiagram />
                  ) : (
                    <Image
                      src={figure.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 38vw, 1px"
                      className={figure.fit === "cover" ? "object-cover" : "object-contain p-[5%]"}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 min-h-[1lh] font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {shown ? figures[shown]?.caption : null}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
