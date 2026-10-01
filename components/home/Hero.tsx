import Link from "next/link";
import { preload } from "react-dom";
import { projects } from "@/lib/content";
import { photoUrl, type Photo } from "@/lib/unsplash";
import { PosterName } from "./PosterName";

/* The first screen, set like a Swiss poster: one line about the work hung from
   the top, the name in lowercase filling the rest, and the three projects in
   the room its second line leaves. One of Prashant's photographs shows through
   the letters. The sources are in docs/design.md. */

const LINES = ["prashant", "yadav"] as const;

export function Hero({ photo }: { photo: Photo | null }) {
  const sizes = photo ? { small: photoUrl(photo.src, 1200, 80), large: photoUrl(photo.src, 2400, 80) } : null;
  if (sizes) {
    // The same breakpoint as the stylesheet, so only one size is fetched.
    preload(sizes.small, { as: "image", fetchPriority: "high", media: "(max-width: 767px)" });
    preload(sizes.large, { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });
  }

  return (
    <section id="hero" data-theme="paper" className="hero">
      <h1 className="sr-only">Prashant Yadav, software engineer</h1>

      <p className="t-m max-w-[30ch] text-pretty">
        Software engineer in Lucknow, working across full-stack web and applied machine learning.
      </p>

      <PosterName lines={LINES} photo={sizes}>
        <nav aria-label="Selected work">
          <ol>
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="group grid grid-cols-[2em_1fr_auto] items-baseline gap-3 border-t border-rule py-2"
                >
                  <span className="t-mono text-muted">{p.index}</span>
                  <span
                    data-baseline
                    className="whitespace-nowrap text-[15px] font-[580] tracking-[-0.01em] transition-[translate,color] duration-500 ease-out-quint group-hover:translate-x-1.5 group-hover:text-accent"
                  >
                    {p.title}
                  </span>
                  <span className="t-mono text-muted">{p.year}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </PosterName>
    </section>
  );
}
