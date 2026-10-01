"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* The tear-off tabs along the foot of the contact flyer, each printed with the
   address. Pull one down (or click it, tap it, or press Enter on it) and it
   tears off and the address is copied.

   The gaps are real. app/api/taken counts each person who has taken the
   address once, and when a flyer runs out of tabs a fresh one goes up, so a
   fringe of n tabs shows the count mod n gaps, scattered the way people take
   them rather than left to right. A visitor's own tears join them, and the
   count beside the likes is the latest one. */

type Tally = { count: number; took: boolean; ready: boolean };
type Pull = { i: number; el: HTMLElement; id: number; y: number; dy: number; tore: boolean };
type Swallow = { i: number; at: number };

// Wide enough for the name and the address side by side, turned upright.
const TAB = { phone: 46, wide: 62 };
// How far a tab is pulled, in px of pointer travel, before it tears.
const TEAR = 90;
// Successive multiples of the golden ratio land evenly around a circle, so the
// first k positions of this order are evenly scattered for any k.
const PHI = 0.6180339887;

function scatter(n: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  for (let k = 1; out.length < n && k < n * 40; k++) {
    const i = Math.floor(((k * PHI) % 1) * n);
    if (!seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  }
  for (let i = 0; i < n; i++) if (!seen.has(i)) out.push(i);
  return out;
}

/** The torn piece falls away on its own layer, so the fringe keeps its gap. */
function drop(tab: HTMLElement, dy: number) {
  const r = tab.getBoundingClientRect();
  const piece = document.createElement("div");
  piece.className = "tab-fall";
  piece.setAttribute("aria-hidden", "true");
  piece.innerHTML = tab.querySelector(".tab-face")?.outerHTML ?? "";
  piece.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;font-size:${getComputedStyle(tab).fontSize}`;
  piece.style.transform = `translateY(${dy}px) rotate(${dy * 0.03}deg)`;
  document.body.appendChild(piece);
  piece.getBoundingClientRect();
  const side = Math.random() < 0.5 ? -1 : 1;
  piece.style.transform = `translate(${side * 36}px, ${window.innerHeight - r.top + 60}px) rotate(${side * (12 + Math.random() * 16)}deg)`;
  piece.style.opacity = "0";
  window.setTimeout(() => piece.remove(), 1300);
}

export function TearTabs({ email, name, children }: { email: string; name: string; children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const pull = useRef<Pull | null>(null);
  // The click that follows a pull is not a tap.
  const swallow = useRef<Swallow | null>(null);
  // Tabs torn in this event, before React has drawn them gone.
  const tornNow = useRef(new Set<number>());
  const posted = useRef(false);
  const focusNext = useRef<number | null>(null);
  const [n, setN] = useState(0);
  const [base, setBase] = useState(0);
  const [tally, setTally] = useState<Tally | null>(null);
  const [torn, setTorn] = useState<Set<number>>(() => new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  // As many tabs as the width holds.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // The observer also reports once as soon as it starts.
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setN(Math.max(6, Math.round(w / (w < 600 ? TAB.phone : TAB.wide))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/taken")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Tally | null) => {
        if (!alive || !data?.ready) return;
        setTally(data);
        setBase(data.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const gaps = new Set(n ? scatter(n).slice(0, base % n) : []);
  torn.forEach((i) => i < n && gaps.add(i));
  const firstOpen = Array.from({ length: n }, (_, i) => i).find((i) => !gaps.has(i)) ?? -1;

  // After a tab is torn from the keyboard, the next one takes the focus.
  useEffect(() => {
    if (focusNext.current === null) return;
    focusNext.current = null;
    box.current?.querySelector<HTMLElement>(`[data-tab="${firstOpen}"]`)?.focus();
  });

  useEffect(() => {
    if (copied === null) return;
    const t = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const tear = async (i: number, el: HTMLElement, dy = 0) => {
    if (gaps.has(i) || tornNow.current.has(i)) return;
    tornNow.current.add(i);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) drop(el, dy);
    el.style.translate = el.style.rotate = "";
    setTorn((t) => new Set(t).add(i));
    try {
      await navigator.clipboard.writeText(email);
      setCopied(i);
      setStatus(`Copied ${email}`);
    } catch {
      window.location.assign(`mailto:${email}`);
    }
    if (posted.current) return;
    posted.current = true;
    try {
      const r = await fetch("/api/taken", { method: "POST" });
      if (r.ok) {
        const data: Tally = await r.json();
        if (data.ready) setTally(data);
      }
    } catch {
      // The tab is torn either way; the next visit shows the real count.
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (e.button !== 0) return;
    swallow.current = null;
    pull.current = { i, el: e.currentTarget, id: e.pointerId, y: e.clientY, dy: 0, tore: false };
    // A finger swiping up or down is scrolling the page, so only a mouse or a
    // pen pulls; a tap tears.
    if (e.pointerType === "touch") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.pulling = "";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId || e.pointerType === "touch" || p.tore) return;
    p.dy = Math.max(0, e.clientY - p.y);
    p.el.style.translate = `0 ${(p.dy * 0.55).toFixed(1)}px`;
    p.el.style.rotate = `${(p.dy * 0.03).toFixed(2)}deg`;
    if (p.dy > TEAR) {
      p.tore = true;
      delete p.el.dataset.pulling;
      tear(p.i, p.el, p.dy * 0.55);
    }
  };

  const release = (e: React.PointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    pull.current = null;
    if (!p) return;
    delete p.el.dataset.pulling;
    if (!p.tore) p.el.style.translate = p.el.style.rotate = "";
    // A pull that tore, or one let go of before it tore, is not a click.
    if (p.tore || p.dy >= 6) swallow.current = { i: p.i, at: e.timeStamp };
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    const s = swallow.current;
    swallow.current = null;
    if (s && s.i === i && e.timeStamp - s.at < 600) return;
    if (e.detail === 0) focusNext.current = i;
    tear(i, e.currentTarget);
  };

  return (
    <>
      <div ref={box} className="tabs" role="group" aria-label="Tabs printed with the email address. Each one copies it.">
        {Array.from({ length: n }, (_, i) => {
          const gone = gaps.has(i);
          return (
            <button
              key={i}
              type="button"
              className="tab"
              data-tab={i}
              data-gone={gone ? "" : undefined}
              disabled={gone}
              aria-hidden={gone || undefined}
              tabIndex={i === firstOpen ? 0 : -1}
              aria-label={`Copy ${email}`}
              onPointerDown={(e) => onPointerDown(e, i)}
              onPointerMove={onPointerMove}
              onPointerUp={release}
              onPointerCancel={release}
              onClick={(e) => onClick(e, i)}
            >
              <span className="tab-face" aria-hidden="true">
                <b>{name}</b>
                {email}
              </span>
              {copied === i && <span className="tab-copied">Copied</span>}
            </button>
          );
        })}
      </div>
      <div className="flyer-row">
        {children}
        {tally?.ready && tally.count > 0 && <p className="t-mono text-muted">{tally.count} taken</p>}
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </>
  );
}
