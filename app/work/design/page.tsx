import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { person } from "@/lib/content";

/* Graphic design, on hold at his request while he works out what to show. It
   exists as a real page rather than a 404 because Skills and Work both link
   here, and a dead link reads worse than an honest one. Like Photography, its
   back links follow the visitor's real history. */

export const metadata: Metadata = {
  title: "Graphic design / " + person.full,
};

export default function DesignPage() {
  return (
    <PageTransition>
      <main className="flex min-h-dvh w-full flex-col pt-(--nav-h)">
        <div className="flex flex-1 flex-col justify-center px-[5.5vw] py-[8vh]">
          <div>
            <BackLink size="small" />
          </div>
          <SectionTitle slug="design">
            <h1 className="mt-4 font-display text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
              Graphic
              <br />
              design
            </h1>
          </SectionTitle>
          <p className="mt-8 max-w-[42ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.6] text-muted">
            Being put together. Posters, type and composition, mostly in Photoshop.
          </p>
        </div>

        <footer className="flex flex-wrap items-end justify-between gap-6 px-[5.5vw] pb-[8vh]">
          <BackLink />
          <Link
            href="/work/photography"
            transitionTypes={["nav-forward"]}
            className="-my-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-ink"
          >
            Photography instead
          </Link>
        </footer>
      </main>
    </PageTransition>
  );
}
