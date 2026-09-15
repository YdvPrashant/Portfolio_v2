"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import Arrow from "@/components/Arrow";
import { labelFor } from "@/lib/sections";

/* Back to wherever the visitor actually came from.

   The galleries are reached from Skills and from Work, so a link hard coded to
   either one is wrong half the time; it used to send people from Skills to a
   Work page they had never seen. This reads the browser's own history through
   the Navigation API. If the entry behind this one is a page on this site, the
   link is named after it and following it is a real history step, which also
   lands you at the scroll position you left. Arriving from outside the site,
   or in a browser without the API, it is a plain link to the fallback. */

type Entry = { url: string | null; index: number };
type NavigationApi = EventTarget & { currentEntry: Entry | null; entries(): Entry[] };

function navigationApi(): NavigationApi | undefined {
  return (window as Window & { navigation?: NavigationApi }).navigation;
}

function subscribe(onChange: () => void) {
  const api = navigationApi();
  api?.addEventListener("currententrychange", onChange);
  return () => api?.removeEventListener("currententrychange", onChange);
}

function previousPath(): string | null {
  const api = navigationApi();
  const current = api?.currentEntry;
  if (!api || !current || current.index < 1) return null;
  const url = api.entries()[current.index - 1]?.url;
  if (!url) return null;
  const previous = new URL(url);
  if (previous.origin !== window.location.origin) return null;
  if (previous.pathname === window.location.pathname) return null;
  return labelFor(previous.pathname) ? previous.pathname : null;
}

export default function BackLink({
  fallback = "/work",
  size = "large",
}: {
  fallback?: string;
  size?: "large" | "small";
}) {
  const router = useRouter();
  const previous = useSyncExternalStore(subscribe, previousPath, () => null);
  const href = previous ?? fallback;
  const label = labelFor(href) ?? "Back";

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // A modified click is asking for a new tab; the plain link does that.
    if (!previous || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    router.back();
  };

  if (size === "small") {
    return (
      <Link
        href={href}
        onClick={onClick}
        transitionTypes={["nav-back"]}
        className="group -my-3 inline-flex items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-ink"
      >
        <Arrow turn={180} className="size-3.5 transition-[translate] duration-300 group-hover:-translate-x-1" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      transitionTypes={["nav-back"]}
      className="group inline-flex items-center gap-4 border-t border-rule pt-5 font-mono text-[11px] uppercase tracking-[0.18em]"
    >
      <span className="text-muted">Back to</span>
      <span className="font-display text-[clamp(1.3rem,2.6vw,2rem)] font-black uppercase tracking-[-0.03em] transition-[translate,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2 group-hover:text-accent">
        {label}
      </span>
    </Link>
  );
}
