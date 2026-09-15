import Link from "next/link";
import Arrow from "@/components/Arrow";
import { onwardFrom } from "@/lib/sections";

/* The way onward at the end of a page, so the site reads start to finish
   without a trip back up to the nav. Contact, the last page, points back to the
   start. `compact` is for the pages that are one fixed screen and have no end
   to put a large link at. */
export default function NextLink({ from, compact = false }: { from: string; compact?: boolean }) {
  const onward = onwardFrom(from);
  const turn = onward.type === "nav-back" ? 180 : 0;

  if (compact) {
    return (
      <Link
        href={onward.href}
        transitionTypes={[onward.type]}
        className="group -my-3 inline-flex items-center gap-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em]"
      >
        <span className="text-muted">{onward.eyebrow}</span>
        <span className="font-display text-[1.05rem] font-black tracking-[-0.02em] transition-colors duration-300 group-hover:text-accent">
          {onward.label}
        </span>
        <Arrow
          turn={turn}
          className="size-4 transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-accent"
        />
      </Link>
    );
  }

  return (
    <nav aria-label="Onward" className="px-[5.5vw] pb-[8vh] pt-[14vh]">
      <Link href={onward.href} transitionTypes={[onward.type]} className="group block border-t border-rule pt-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{onward.eyebrow}</span>
        <span className="mt-4 flex items-center justify-between gap-6">
          <span className="font-display text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.045em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-accent">
            {onward.label}
          </span>
          <Arrow
            turn={turn}
            className="size-[clamp(2rem,5vw,4.25rem)] shrink-0 transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-accent"
          />
        </span>
      </Link>
    </nav>
  );
}
