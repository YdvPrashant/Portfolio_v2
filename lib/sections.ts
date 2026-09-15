/* The site as a sequence: Home, then six sections in order, which is also the
   order the Next links walk. The galleries belong to Work.

   Plain data and pure functions with no imports, so the navigation logic can be
   checked outside the browser. */

/** `short` is for the nav, where seven items have to hold one line on a phone. */
export type Section = { n: string; slug: string; label: string; short?: string; href: string };

export const SECTIONS: readonly Section[] = [
  { n: "01", slug: "about", label: "About", href: "/about" },
  { n: "02", slug: "skills", label: "Skills", href: "/skills" },
  { n: "03", slug: "projects", label: "Projects", href: "/projects" },
  { n: "04", slug: "dsa", label: "DSA", href: "/dsa" },
  { n: "05", slug: "work", label: "Creative work", short: "Creative", href: "/work" },
  { n: "06", slug: "contact", label: "Contact", href: "/contact" },
];

// Pages that are not sections but can still be somewhere a visitor came from.
const PAGES: Record<string, string> = {
  "/": "Home",
  "/work/photography": "Photography",
  "/work/design": "Graphic design",
};

function clean(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/** The name of a page on this site, or null if the path is not one. */
export function labelFor(pathname: string): string | null {
  const p = clean(pathname);
  return PAGES[p] ?? SECTIONS.find((s) => s.href === p)?.label ?? null;
}

/** 0 for Home, 1 to 6 for the sections (a gallery counts as Work), -1 otherwise. */
export function positionOf(pathname: string): number {
  const p = clean(pathname);
  if (p === "/") return 0;
  const i = SECTIONS.findIndex((s) => p === s.href || p.startsWith(s.href + "/"));
  return i === -1 ? -1 : i + 1;
}

export function currentSection(pathname: string): Section | null {
  const position = positionOf(pathname);
  return position > 0 ? SECTIONS[position - 1] : null;
}

export type TransitionType = "nav-forward" | "nav-back";

/** Later in the sequence slides forward, earlier slides back. */
export function directionTo(from: string, to: string): TransitionType {
  return positionOf(to) < positionOf(from) ? "nav-back" : "nav-forward";
}

export type Onward = { eyebrow: string; label: string; href: string; type: TransitionType };

/** Where the end of a page leads. The last section returns to the start. */
export function onwardFrom(pathname: string): Onward {
  const position = positionOf(pathname);
  if (position >= 0 && position < SECTIONS.length) {
    const next = SECTIONS[position];
    return { eyebrow: "Next", label: next.label, href: next.href, type: "nav-forward" };
  }
  return { eyebrow: "Back to", label: "Start", href: "/", type: "nav-back" };
}

/** The key a page's theme overrides hang on: "home", or the section's slug. */
export function pageFor(pathname: string): string | null {
  if (clean(pathname) === "/") return "home";
  return currentSection(pathname)?.slug ?? null;
}

export type Tone = "base" | "deep" | "dsa";

/** The tone of the ground at the top of a page, which the fixed nav matches. */
export function toneFor(pathname: string): Tone {
  const p = clean(pathname);
  if (p === "/dsa") return "dsa";
  if (p === "/work/photography") return "deep";
  return "base";
}
