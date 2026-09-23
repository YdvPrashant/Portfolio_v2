import Link from "next/link";
import type { Project } from "@/lib/content";

export function NextProject({ project }: { project: Project }) {
  return (
    <section data-theme="paper" aria-label="Next project" className="px-pad pb-[clamp(72px,12vh,140px)]">
      <Link
        href={`/work/${project.slug}`}
        transitionTypes={["nav-forward"]}
        className="group block border-t border-fg pt-6"
      >
        <span className="t-mono text-muted">Next project, {project.index}</span>
        <span className="t-xxl mt-4 block transition-transform duration-700 ease-out-quint group-hover:translate-x-3">
          {project.title} <span className="inline-block">&rarr;</span>
        </span>
        <span className="serif t-m mt-4 block text-muted">{project.kicker}</span>
      </Link>
      <Link
        href="/#work"
        transitionTypes={["nav-back"]}
        className="t-small link-line hit mt-10 inline-block font-[560]"
      >
        &larr; All work
      </Link>
    </section>
  );
}
