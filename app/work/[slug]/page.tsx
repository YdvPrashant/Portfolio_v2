import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BenchmarkRow } from "@/components/work/BenchmarkRow";
import { Footer } from "@/components/site/Footer";
import { PageTransition } from "@/components/site/PageTransition";
import { NextProject } from "@/components/work/NextProject";
import { PrismSpectrum } from "@/components/work/PrismSpectrum";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { benchmarks, nextProject, projectBySlug, projects } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: `${project.kicker}. ${project.summary}`,
  };
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const next = nextProject(slug);
  const measured = benchmarks.filter((b) => b.slug === slug);

  return (
    <PageTransition>
      <main id="main">
        <section
          data-theme="paper"
          aria-labelledby="case-title"
          className="px-pad pb-[clamp(56px,9vh,112px)] pt-[calc(var(--header)+clamp(32px,7vh,96px))]"
        >
          <p className="t-mono flex flex-wrap gap-x-6 gap-y-1 text-muted">
            <span>{project.index}</span>
            <span>{project.period}</span>
            <a href={project.link.href} target="_blank" rel="noopener" className="link-line hit text-fg">
              {project.link.label} &#8599;
            </a>
          </p>
          <h1 id="case-title" className="t-xxl mt-5 max-w-[14ch] text-balance">
            {project.title}
          </h1>
          <p className="serif t-l mt-4 text-muted">{project.kicker}</p>

          <div className="mt-[clamp(40px,7vh,88px)]">
            <ProjectMedia project={project} sizes="(min-width: 1440px) 1360px, 100vw" priority />
          </div>
        </section>

        <section
          data-theme="paper"
          aria-label="Overview"
          className="grid grid-cols-12 gap-x-[var(--gap)] gap-y-10 px-pad pb-[clamp(64px,10vh,128px)]"
        >
          <p className="t-l col-span-12 max-w-[30ch] text-pretty lg:col-span-7">{project.summary}</p>
          <dl className="t-mono col-span-12 grid content-start gap-y-4 border-t border-rule pt-4 text-[0.8rem] lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="text-muted">Period</dt>
              <dd>{project.period}</dd>
            </div>
            <div>
              <dt className="text-muted">Stack</dt>
              <dd>{project.stack.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-muted">{project.link.label === "GitHub" ? "Source" : "Live"}</dt>
              <dd>
                <a href={project.link.href} target="_blank" rel="noopener" className="link-line hit">
                  {project.link.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} &#8599;
                </a>
              </dd>
            </div>
          </dl>
        </section>

        {slug === "prism" && (
          <section
            data-theme="ink"
            aria-labelledby="stages-title"
            className="px-pad py-[clamp(72px,12vh,150px)]"
          >
            <div className="grid grid-cols-12 items-end gap-x-[var(--gap)] gap-y-5">
              <h2 id="stages-title" className="t-xl col-span-12 lg:col-span-6">
                One article, six readings
              </h2>
              <p className="t-m col-span-12 max-w-[34ch] text-muted lg:col-span-5 lg:col-start-8">
                Each sentence is classed as a claim, an opinion or rhetoric. Then Prism traces where the
                sources come from, fact checks the claims live and shows what the coverage left out. Move the
                pointer to aim the beam.
              </p>
            </div>
            <div className="mt-[clamp(32px,6vh,72px)]">
              <PrismSpectrum />
            </div>
          </section>
        )}

        <section
          data-theme="paper"
          aria-labelledby="highlights-title"
          className="px-pad py-[clamp(64px,10vh,128px)]"
        >
          <h2 id="highlights-title" className="t-mono mb-6 text-muted">
            What it took
          </h2>
          <ol className="border-t border-fg">
            {project.highlights.map((h) => (
              <li
                key={h.figure}
                className="grid grid-cols-12 gap-x-[var(--gap)] gap-y-4 border-b border-rule py-[clamp(28px,5vh,56px)]"
              >
                <p className="col-span-12 md:col-span-5">
                  <span className="t-xxl block">{h.figure}</span>
                  <span className="t-small mt-3 block text-muted">{h.caption}</span>
                </p>
                <p className="t-m col-span-12 max-w-[46ch] self-end text-pretty md:col-span-6 md:col-start-7">
                  {h.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {measured.length > 0 && (
          <section data-theme="paper" aria-labelledby="case-measured" className="px-pad pb-[clamp(64px,10vh,128px)]">
            <h2 id="case-measured" className="t-mono mb-6 text-muted">
              Measured
            </h2>
            <ol className="border-t border-fg">
              {measured.map((b) => (
                <BenchmarkRow key={b.id} b={b} showProject={false} />
              ))}
            </ol>
          </section>
        )}

        <NextProject project={next} />
      </main>
      <Footer />
    </PageTransition>
  );
}
