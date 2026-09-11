import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { person } from "@/lib/content";

/* Graphic design, on hold at his request while he works out what to show. It
   exists as a real page rather than a 404 because Skills and Work both link
   here, and a dead link reads worse than an honest one. */

const BONE = "#f4f1e9";
const INK = "#0b0b0b";

export const metadata: Metadata = {
  title: "Graphic design / " + person.full,
};

export default function DesignPage() {
  return (
    <main style={{ background: BONE, color: INK }} className="flex min-h-dvh w-full flex-col">
      <SiteNav tone={INK} />

      <div className="flex flex-1 flex-col justify-center px-[5.5vw] py-[10vh]">
        <h1 className="font-[family-name:var(--font-archivo)] text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
          Graphic
          <br />
          design
        </h1>
        <p className="mt-8 max-w-[42ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.6]">
          Being put together. Posters, type and composition, mostly in Photoshop.
        </p>
      </div>

      <footer className="px-[5.5vw] pb-[7vh]">
        <div className="flex flex-wrap items-baseline justify-between gap-6 border-t pt-5" style={{ borderColor: "rgba(11,11,11,0.22)" }}>
          <Link href="/work" className="group inline-flex items-baseline gap-4 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="opacity-50">Back</span>
            <span className="font-[family-name:var(--font-archivo)] text-[clamp(1.3rem,2.6vw,2rem)] font-black uppercase tracking-[-0.03em] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2">
              Work
            </span>
          </Link>
          <Link href="/work/photography" className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-55 transition-opacity hover:opacity-100">
            Photography instead
          </Link>
        </div>
      </footer>
    </main>
  );
}
