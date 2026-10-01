"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { subscribe } from "@/lib/scroll";

/* The @ of the archived contact section. A photograph shows through it once
   it has loaded and drifts a little against the pointer, like the name on the
   first screen. The @ turns upright as it climbs from the foot of the screen
   to the middle, scrubbed by the scroll rather than played on a timer. */

type Props = { photo: { small: string; large: string } | null };

export function AtGlyph({ photo }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  // The @ stays in paper until the photograph is ready, then it fades in.
  useEffect(() => {
    const el = ref.current;
    if (!el || !photo) return;
    let alive = true;
    const img = new Image();
    img.src = window.matchMedia("(max-width: 1023px)").matches ? photo.small : photo.large;
    img
      .decode()
      .then(() => {
        if (alive) el.dataset.lit = "";
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [photo]);

  useEffect(() => {
    const el = ref.current;
    const line = el?.parentElement;
    if (!el || !line) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Rotation leaves the centre where it was, so the box is safe to measure.
    let centre = 0;
    const stop = subscribe({
      measure() {
        const r = el.getBoundingClientRect();
        centre = (r.top + r.bottom) / 2 + window.scrollY;
      },
      update(y, vh) {
        const t = Math.min(1, Math.max(0, (vh - (centre - y)) / (vh * 0.5)));
        el.style.setProperty("--p", (1 - (1 - t) ** 2).toFixed(3));
      },
    });

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !photo) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--dx", (((e.clientX - r.left) / r.width - 0.5) * -24).toFixed(1));
      el.style.setProperty("--dy", (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1));
    };
    const leave = () => {
      el.style.setProperty("--dx", "0");
      el.style.setProperty("--dy", "0");
    };
    line.addEventListener("pointermove", move);
    line.addEventListener("pointerleave", leave);
    return () => {
      stop();
      line.removeEventListener("pointermove", move);
      line.removeEventListener("pointerleave", leave);
    };
  }, [photo]);

  const style = photo
    ? ({ "--photo-small": `url("${photo.small}")`, "--photo-large": `url("${photo.large}")` } as CSSProperties)
    : undefined;

  return (
    <span ref={ref} className={photo ? "at-glyph has-photo" : "at-glyph"} style={style} aria-hidden="true">
      @
    </span>
  );
}
