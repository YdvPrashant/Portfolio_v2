"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/lib/unsplash";
import { UNSPLASH_PROFILE } from "@/lib/unsplash";
import { unsplashLoader } from "@/lib/unsplash-loader";
import { PhotoViewer } from "./PhotoViewer";

/* Every photograph on one endless field you can drag in any direction (after
   Gionatan Nese's creative space and the Getty's Tracing Art). The field is a
   grid of equal frames, a little larger than the screen, and each frame wraps
   to the far side as it leaves, so it never ends and there are never more
   frames in the page than it takes to cover the screen twice over. Columns
   drift at slightly different speeds for depth. Drag, scroll, or use the
   arrow keys; a click opens the photograph whole. */

type Layout = {
  cols: number;
  rows: number;
  tileW: number;
  tileH: number;
  pitchX: number;
  pitchY: number;
  width: number;
  height: number;
};

function plan(n: number, vw: number, vh: number): Layout {
  const tileW = Math.round(Math.min(300, Math.max(132, vw * 0.17)));
  const tileH = Math.round(tileW * 4 / 3);
  const pitchX = tileW + Math.round(Math.max(20, vw * 0.028));
  const pitchY = tileH + Math.round(Math.max(28, vw * 0.04));
  // Big enough that a frame is fully off screen before it wraps.
  let cols = Math.max(Math.ceil((vw + 2 * pitchX) / pitchX), 3);
  let rows = Math.max(Math.ceil((vh + 2 * pitchY) / pitchY), 3);
  while (cols * rows < n) {
    if (cols * pitchX <= rows * pitchY) cols++;
    else rows++;
  }
  return { cols, rows, tileW, tileH, pitchX, pitchY, width: cols * pitchX, height: rows * pitchY };
}

// Fills slots so a photograph's neighbours differ from one pass to the next.
function slotPhoto(slot: number, n: number): number {
  return (slot * 7 + Math.floor(slot / n) * 3) % n;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function PhotoField({ photos }: { photos: Photo[] }) {
  const field = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const layoutRef = useRef<Layout | null>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  const layout = useMemo(
    () => (size ? plan(photos.length, size.w, size.h) : null),
    [photos.length, size],
  );

  const place = useCallback(() => {
    const L = layoutRef.current;
    if (!L || !size) return;
    const { x, y } = offset.current;
    const padX = (L.width - size.w) / 2;
    const padY = (L.height - size.h) / 2;
    for (let slot = 0; slot < L.cols * L.rows; slot++) {
      const el = tiles.current[slot];
      if (!el) continue;
      const c = slot % L.cols;
      const r = Math.floor(slot / L.cols);
      // Odd columns sit half a row lower; each column drifts at its own rate.
      const depth = 1 + ((c * 37) % 5) * 0.035;
      const bx = c * L.pitchX + (L.pitchX - L.tileW) / 2;
      const by = r * L.pitchY + (c % 2 ? L.pitchY / 2 : 0);
      const sx = mod(bx + x, L.width) - padX;
      const sy = mod(by + y * depth, L.height) - padY;
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
    }
  }, [size]);

  useEffect(() => {
    layoutRef.current = layout;
    place();
  }, [layout, place]);

  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Drag, inertia, wheel and keys.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const v = { x: 0, y: 0 };
    let drag: { id: number; x: number; y: number; t: number; moved: number } | null = null;
    let wheelTarget = { x: 0, y: 0 };

    const quietHint = () => hint.current?.setAttribute("data-quiet", "true");

    const loop = () => {
      raf = 0;
      let moving = false;
      if (!drag && (Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05)) {
        offset.current.x += v.x;
        offset.current.y += v.y;
        v.x *= 0.935;
        v.y *= 0.935;
        moving = true;
      }
      if (Math.abs(wheelTarget.x) > 0.5 || Math.abs(wheelTarget.y) > 0.5) {
        const stepX = wheelTarget.x * 0.16;
        const stepY = wheelTarget.y * 0.16;
        offset.current.x += stepX;
        offset.current.y += stepY;
        wheelTarget.x -= stepX;
        wheelTarget.y -= stepY;
        moving = true;
      }
      place();
      if (moving) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      v.x = v.y = 0;
      el.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const now = performance.now();
      const dt = Math.max(1, now - drag.t);
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 6 && !el.hasPointerCapture(e.pointerId)) {
        try {
          el.setPointerCapture(e.pointerId);
        } catch {}
      }
      offset.current.x += dx;
      offset.current.y += dy;
      // Velocity in pixels per 60Hz frame, smoothed.
      v.x = v.x * 0.6 + (dx / dt) * 16.7 * 0.4;
      v.y = v.y * 0.6 + (dy / dt) * 16.7 * 0.4;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = now;
      place();
      quietHint();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = drag.moved;
      drag = null;
      delete el.dataset.dragging;
      if (reduced) v.x = v.y = 0;
      // A drag should not also count as a click on the frame under it.
      if (moved > 6) {
        const block = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener("click", block, { capture: true, once: true });
        window.setTimeout(() => el.removeEventListener("click", block, { capture: true }), 0);
      }
      kick();
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dx = (e.shiftKey ? e.deltaY : e.deltaX) * scale;
      const dy = (e.shiftKey ? 0 : e.deltaY) * scale;
      if (reduced) {
        offset.current.x -= dx;
        offset.current.y -= dy;
        place();
      } else {
        wheelTarget = { x: wheelTarget.x - dx, y: wheelTarget.y - dy };
        kick();
      }
      quietHint();
    };
    const key = (e: KeyboardEvent) => {
      if (open !== null) return;
      const step = 140;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      wheelTarget = { x: wheelTarget.x + d[0], y: wheelTarget.y + d[1] };
      kick();
      quietHint();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [place, open]);

  // A link such as /photography#<id> opens that photograph.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const i = photos.findIndex((p) => p.id === id);
    if (i >= 0) queueMicrotask(() => setOpen(i));
  }, [photos]);

  // Keyboard focus on a frame that is off screen pans the field to it.
  const focusTile = (slot: number) => {
    const el = tiles.current[slot];
    const L = layoutRef.current;
    if (!el || !L || !size) return;
    const r = el.getBoundingClientRect();
    const dx = size.w / 2 - (r.left + r.width / 2);
    const dy = size.h / 2 - (r.top + r.height / 2);
    if (Math.abs(dx) > size.w / 2 - r.width || Math.abs(dy) > size.h / 2 - r.height) {
      offset.current.x += dx;
      offset.current.y += dy;
      place();
    }
  };

  const openAt = (index: number) => {
    setOpen(index);
    history.replaceState(null, "", `#${photos[index].id}`);
  };
  const close = () => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname);
  };

  const slots = layout ? layout.cols * layout.rows : 0;
  const n = photos.length;

  return (
    <>
      <div
        ref={field}
        data-lenis-prevent
        className="photo-field"
        role="region"
        aria-label={`${n} photographs. Drag, scroll or use the arrow keys to move around; open any photograph to see it whole.`}
      >
        {layout &&
          Array.from({ length: slots }, (_, slot) => {
            const index = slotPhoto(slot, n);
            const photo = photos[index];
            // Slots beyond the first n repeat photographs; only the first
            // appearance of each is reachable with the keyboard.
            const first = slot < n;
            return (
              <button
                key={slot}
                ref={(node) => {
                  tiles.current[slot] = node;
                }}
                type="button"
                className="photo-tile"
                style={{ width: layout.tileW, height: layout.tileH, backgroundColor: photo.color }}
                tabIndex={first ? 0 : -1}
                aria-hidden={first ? undefined : true}
                aria-label={`Open photograph ${index + 1} of ${n}${photo.alt ? `: ${photo.alt}` : ""}`}
                onClick={() => openAt(index)}
                onFocus={() => focusTile(slot)}
              >
                <Image
                  loader={unsplashLoader}
                  src={photo.src}
                  alt=""
                  fill
                  sizes={`${layout.tileW}px`}
                  className="object-cover"
                  draggable={false}
                />
              </button>
            );
          })}
      </div>

      <div className="photo-title pointer-events-none fixed bottom-0 left-0 z-10 p-[var(--pad)]">
        <h1 className="t-xl">Photographs</h1>
        <p className="t-small mt-2">
          {n}, live from{" "}
          <a href={UNSPLASH_PROFILE} target="_blank" rel="noopener" className="link-line pointer-events-auto">
            unsplash.com/@pr7nt
          </a>
        </p>
        <p ref={hint} className="photo-hint t-mono mt-4">
          Drag, scroll or use the arrow keys
        </p>
      </div>

      <PhotoViewer
        photos={photos}
        index={open}
        onClose={close}
        onChange={(i) => openAt(i)}
      />
    </>
  );
}
