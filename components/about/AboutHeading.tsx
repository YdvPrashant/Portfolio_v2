import SectionTitle from "@/components/SectionTitle";

/* The About page's numbered heading, shared by the directions on trial so they
   all sit in the same place in the site's sequence. */
export default function AboutHeading() {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-[11px] tabular-nums text-muted">01</span>
      <SectionTitle slug="about">
        <h1 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
          About
        </h1>
      </SectionTitle>
    </div>
  );
}
