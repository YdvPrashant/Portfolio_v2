import Link from "next/link";
import { projects } from "@/lib/content";
import { StripeName } from "./StripeName";

const LINES = ["PRASHANT", "YADAV"] as const;
const ALIGN = ["left", "right"] as const;

export function Hero() {
  return (
    <section
      id="hero"
      data-theme="paper"
      className="relative flex flex-col px-pad pb-10 pt-[calc(var(--header)+clamp(24px,5vh,72px))] md:landscape:min-h-svh"
    >
      <h1 className="sr-only">Prashant Yadav, software engineer</h1>

      <p className="t-l mb-[clamp(40px,8vh,96px)] max-w-[24ch] text-balance">
        Software engineer in Lucknow, working across full-stack web and applied{" "}
        <span className="serif">machine learning</span>.
      </p>

      <div className="relative mt-auto" style={{ touchAction: "pan-y" }}>
        <StripeName lines={LINES} align={ALIGN} className="hero-name" />
        {/* On wide screens the index sits in the space left of YADAV, its
            last rule on YADAV's baseline; elsewhere it follows the name. */}
        <nav aria-label="Selected work" className="hero-index">
          <p className="t-mono mb-3 text-muted">Selected work</p>
          <ol className="border-t border-rule">
            {projects.map((p) => (
              <li key={p.slug} className="border-b border-rule">
                <Link
                  href={`/work/${p.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="group flex items-baseline gap-4 py-[9px]"
                >
                  <span className="t-mono text-muted">{p.index}</span>
                  <span className="t-small font-[560] transition-transform duration-500 ease-out-quint group-hover:translate-x-1.5">
                    {p.title}
                  </span>
                  <span className="t-mono ml-auto text-muted">{p.year}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
