"use client";

import { useEffect, useRef, useState } from "react";

/* The area the stickers are stuck in, and everything the pointer does to them.

   The stickers slap on one after another the first time the area scrolls into
   view. With a mouse or pen, pointing lifts a sticker and dragging moves it;
   the one you pick up comes to the top. On a touch screen a drag would fight
   the page scroll, so a tap lifts a sticker instead. Nothing moves unless you
   move it. */

export function StickerSurface({ children }: { children: React.ReactNode }) {
  const lid = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const el = lid.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    let z = 100;
    let held: {
      node: HTMLElement;
      id: number;
      x: number;
      y: number;
      dx: number;
      dy: number;
      travel: number;
    } | null = null;

    const offset = (node: HTMLElement) => ({
      dx: parseFloat(node.style.getPropertyValue("--dx")) || 0,
      dy: parseFloat(node.style.getPropertyValue("--dy")) || 0,
    });

    const down = (e: PointerEvent) => {
      const node = (e.target as Element).closest<HTMLElement>("[data-sticker]");
      if (!node || !el.contains(node)) return;
      if (e.pointerType === "touch") {
        // Tap to lift; tap again, or another sticker, to set it down.
        const lifted = node.dataset.lift === "true";
        el.querySelectorAll<HTMLElement>("[data-lift='true']").forEach((n) => delete n.dataset.lift);
        if (!lifted) {
          node.dataset.lift = "true";
          node.style.zIndex = String(++z);
        }
        return;
      }
      if (e.button !== 0) return;
      e.preventDefault();
      const { dx, dy } = offset(node);
      held = { node, id: e.pointerId, x: e.clientX, y: e.clientY, dx, dy, travel: 0 };
      node.style.zIndex = String(++z);
      node.dataset.held = "true";
    };

    const move = (e: PointerEvent) => {
      if (!held || e.pointerId !== held.id) return;
      const box = el.getBoundingClientRect();
      const r = held.node.getBoundingClientRect();
      let dx = held.dx + (e.clientX - held.x);
      let dy = held.dy + (e.clientY - held.y);
      // The collage has no frame to hang off, so the sticker stays inside it.
      const cur = offset(held.node);
      const left = r.left - cur.dx;
      const top = r.top - cur.dy;
      dx = Math.min(box.right - left - r.width, Math.max(box.left - left, dx));
      dy = Math.min(box.bottom - top - r.height, Math.max(box.top - top, dy));
      held.travel = Math.max(held.travel, Math.hypot(e.clientX - held.x, e.clientY - held.y));
      // Capture only once it is a drag: capturing on press would send a plain
      // click to the sticker instead of the link inside it.
      if (held.travel > 4 && !held.node.hasPointerCapture(e.pointerId)) {
        try {
          held.node.setPointerCapture(e.pointerId);
        } catch {}
      }
      held.node.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      held.node.style.setProperty("--dy", `${dy.toFixed(1)}px`);
    };

    const up = (e: PointerEvent) => {
      if (!held || e.pointerId !== held.id) return;
      const { node, travel } = held;
      held = null;
      delete node.dataset.held;
      if (travel > 5) {
        setMoved(true);
        // A drag should not also follow the link on the Prism sticker.
        const block = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        node.addEventListener("click", block, { capture: true, once: true });
        window.setTimeout(() => node.removeEventListener("click", block, { capture: true }), 0);
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    // Stop the browser's own image and link dragging from stealing the gesture.
    const noDrag = (e: DragEvent) => e.preventDefault();
    el.addEventListener("dragstart", noDrag);

    return () => {
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("dragstart", noDrag);
    };
  }, []);

  const tidy = () => {
    lid.current?.querySelectorAll<HTMLElement>("[data-sticker]").forEach((n) => {
      n.style.removeProperty("--dx");
      n.style.removeProperty("--dy");
      n.style.removeProperty("z-index");
      delete n.dataset.lift;
    });
    setMoved(false);
  };

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-6">
        <p className="t-mono text-muted" aria-hidden="true">
          <span className="pointer-coarse:hidden">Point at a sticker to lift it, drag it anywhere</span>
          <span className="hidden pointer-coarse:inline">Tap a sticker to lift it</span>
        </p>
        <button
          type="button"
          onClick={tidy}
          className={`t-mono hit link-line transition-opacity duration-500 ${moved ? "opacity-100" : "pointer-events-none opacity-0"}`}
          tabIndex={moved ? 0 : -1}
        >
          Tidy up
        </button>
      </div>
      <div ref={lid} className="lid" data-in="false">
        {children}
      </div>
    </div>
  );
}
