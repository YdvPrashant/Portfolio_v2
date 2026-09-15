"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { DEFAULT_PALETTE, PALETTES, PALETTE_KEY, isPalette, type PaletteId } from "@/lib/palette";

/* The colour theme, chosen by the visitor.

   A small swatch in the nav opens a panel of the themes; picking one repaints
   the whole site at once and is remembered in this browser. The panel stays open
   while you compare and closes on a click outside, Escape, or a scroll. It
   replaced a strip of three buttons that sat over every page all the time.

   The stored theme is applied before first paint by the head script in
   app/layout.tsx, so a returning visitor never sees the default flash first. */

const html = () => document.documentElement;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(html(), { attributes: true, attributeFilter: ["data-palette"] });
  return () => observer.disconnect();
}

function read(): PaletteId {
  const p = html().getAttribute("data-palette");
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

function apply(id: PaletteId) {
  html().setAttribute("data-palette", id);
  try {
    localStorage.setItem(PALETTE_KEY, id);
  } catch {
    // Storage blocked: the choice lasts until reload.
  }
}

export default function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, read, () => DEFAULT_PALETTE);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* The head script sets the stored theme before first paint. In development
     React's strict remount resets <html> to its JSX attributes and wipes that,
     so it is applied again here, still before paint. A no-op in production. */
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(PALETTE_KEY);
      if (isPalette(stored)) html().setAttribute("data-palette", stored);
    } catch {
      // Storage blocked: the default theme stands.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const current = PALETTES.find((p) => p.id === theme) ?? PALETTES[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-panel"
        aria-label="Colour theme"
        className="-my-3 flex items-center gap-2 py-3 text-muted transition-colors duration-200 hover:text-ink"
      >
        <Chips colours={current.chips} className="h-3 w-4 sm:w-5" />
        <span className="hidden sm:inline">Colours</span>
      </button>

      {open ? (
        <div
          id="theme-panel"
          role="group"
          aria-label="Colour themes"
          className="absolute right-0 top-[calc(100%+0.9rem)] z-10 w-[min(17rem,89vw)] animate-[rise-in_240ms_cubic-bezier(0.22,1,0.36,1)_both] border border-rule bg-ground p-1.5 normal-case tracking-normal text-ink shadow-[0_14px_40px_rgb(0_0_0/0.3)]"
        >
          {PALETTES.map((p) => {
            const on = p.id === theme;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => apply(p.id)}
                aria-pressed={on}
                className={
                  "flex w-full items-center gap-3 px-2.5 py-2.5 text-left transition-colors duration-200 " +
                  (on ? "bg-raised" : "hover:bg-raised")
                }
              >
                <Chips colours={p.chips} className="h-6 w-9" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] uppercase tracking-[0.16em]">{p.name}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">{p.note}</span>
                </span>
                <span aria-hidden className={"size-1.5 shrink-0 " + (on ? "bg-accent" : "")} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* A theme drawn as its colours side by side. */
function Chips({ colours, className }: { colours: readonly string[]; className: string }) {
  return (
    <span aria-hidden className={"flex shrink-0 overflow-hidden ring-1 ring-rule " + className}>
      {colours.map((c) => (
        <span key={c} className="flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}
