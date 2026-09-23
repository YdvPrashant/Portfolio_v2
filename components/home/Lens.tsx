"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { lensPhoto } from "@/lib/content";
import type { Photo } from "@/lib/unsplash";
import { UNSPLASH_PROFILE } from "@/lib/unsplash";
import { unsplashLoader } from "@/lib/unsplash-loader";
import { pageTop, subscribe, useScrollProgress } from "@/lib/scroll";

/* Photography, in two moves.

   First a sentence with a photograph set into it like a word. Scrolling grows
   the photograph until it fills the screen (after Gianluca Gradogna's "Through
   this lens"). Then the photographs scatter around their heading at different
   depths, drifting with the scroll and the pointer (after Lando Norris,
   Floema and the Getty's Tracing Art). */

type Slot = { x: number; y: number; w: number; d: number };

// Positions in percent of the collage, widths in vw, d for depth.
const SLOTS: Slot[] = [
  { x: 3, y: 3, w: 17, d: 0.35 },
  { x: 27, y: 0, w: 11, d: 0.85 },
  { x: 63, y: 5, w: 15, d: 0.5 },
  { x: 84, y: 20, w: 13, d: 0.9 },
  { x: 7, y: 50, w: 13, d: 0.7 },
  { x: 79, y: 57, w: 17, d: 0.4 },
  { x: 29, y: 71, w: 15, d: 0.6 },
  { x: 57, y: 79, w: 11, d: 1 },
];

function Expanding({ photo }: { photo: Photo }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const geo = useRef({ W: 1, H: 1, x: 0, y: 0, w: 1, h: 1 });

  // The slot's rectangle inside the stage, measured when the layout changes.
  useEffect(() => {
    const measure = () => {
      const s = slot.current?.getBoundingClientRect();
      const st = stage.current?.getBoundingClientRect();
      if (!s || !st) return;
      geo.current = {
        W: st.width,
        H: st.height,
        x: s.left - st.left + s.width / 2,
        y: s.top - st.top + s.height / 2,
        w: s.width,
        h: s.height,
      };
    };
    return subscribe({ measure, update: () => {} });
  }, []);

  /* The full screen photograph is scaled down uniformly until it covers the
     slot, centred on it, and clipped to it, so the slot shows the whole
     picture rather than a crop of its middle. Scale, centre and clip all
     ease to full screen together, and nothing is ever stretched. */
  useScrollProgress(section, "pin", (p) => {
    const f = frame.current;
    const st = stage.current;
    if (!f || !st) return;
    const t = Math.min(1, Math.max(0, (p - 0.12) / 0.6));
    const e = 1 - Math.pow(1 - t, 3);
    const { W, H, x, y, w, h } = geo.current;
    const s0 = Math.max(w / W, h / H);
    const s = s0 + (1 - s0) * e;
    const vw = w + (W - w) * e;
    const vh = h + (H - h) * e;
    const cx = x + (W / 2 - x) * e;
    const cy = y + (H / 2 - y) * e;
    const ix = Math.max(0, (W - vw / s) / 2);
    const iy = Math.max(0, (H - vh / s) / 2);
    f.style.transform = `translate3d(${cx - W / 2}px, ${cy - H / 2}px, 0) scale(${s})`;
    f.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px)`;
    st.style.setProperty("--e", e.toFixed(4));
  });

  return (
    <section ref={section} data-theme="ink" aria-label="Photography" className="lens-expand">
      <div ref={stage} className="lens-stage">
        <p className="lens-line t-xl text-center">
          Away from the keyboard
          <br />I take{" "}
          <span ref={slot} className="lens-slot" aria-hidden="true" /> photographs.
        </p>
        <div ref={frame} className="lens-frame" aria-hidden="true">
          <Image
            loader={unsplashLoader}
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ backgroundColor: photo.color }}
          />
        </div>
      </div>
    </section>
  );
}

function Collage({ photos, total }: { photos: Photo[]; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "through");

  // Pointer drift, eased toward the pointer and asleep when it arrives.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let raf = 0;
    let visible = false;
    const tick = () => {
      now.x += (target.x - now.x) * 0.08;
      now.y += (target.y - now.y) * 0.08;
      el.style.setProperty("--mx", now.x.toFixed(4));
      el.style.setProperty("--my", now.y.toFixed(4));
      raf = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (!visible || e.pointerType !== "mouse") return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    let top = 0;
    let height = 0;
    const unsubscribe = subscribe({
      measure() {
        top = pageTop(el);
        height = el.offsetHeight;
      },
      update(y, vh) {
        visible = y + vh > top && y < top + height;
      },
    });
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <section
      data-theme="ink"
      aria-labelledby="photographs-title"
      className="px-pad pb-[clamp(72px,12vh,160px)] pt-[clamp(56px,9vh,112px)]"
    >
      <div ref={ref} className="collage">
        <div className="collage-title">
          <h2 id="photographs-title" className="t-xxl">
            Photographs
          </h2>
          <p className="t-m mt-4 text-muted">
            {total} on Unsplash, loaded live from{" "}
            <a href={UNSPLASH_PROFILE} className="link-line text-fg" target="_blank" rel="noopener">
              @pr7nt
            </a>
            .
          </p>
          <Link
            href="/photography"
            transitionTypes={["nav-forward"]}
            className="t-small link-line hit mt-6 inline-block font-[600]"
          >
            Walk through all {total} &rarr;
          </Link>
        </div>

        {photos.slice(0, SLOTS.length).map((photo, i) => {
          const s = SLOTS[i];
          return (
            <Link
              key={photo.id}
              href={`/photography#${photo.id}`}
              transitionTypes={["nav-forward"]}
              className="collage-item"
              style={
                {
                  "--x": `${s.x}%`,
                  "--y": `${s.y}%`,
                  "--w": s.w,
                  "--d": s.d,
                  aspectRatio: `${photo.width} / ${photo.height}`,
                  backgroundColor: photo.color,
                } as React.CSSProperties
              }
              aria-label={photo.alt ? `Photograph: ${photo.alt}` : `Photograph ${i + 1}`}
            >
              <Image
                loader={unsplashLoader}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 18vw, 44vw"
                className="object-cover"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function Lens({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return (
      <section id="lens" data-theme="ink" className="px-pad py-[clamp(88px,14vh,180px)]">
        <h2 className="t-xl max-w-[20ch]">Away from the keyboard I take photographs.</h2>
        <a href={UNSPLASH_PROFILE} className="t-m link-line mt-6 inline-block" target="_blank" rel="noopener">
          See them on Unsplash &rarr;
        </a>
      </section>
    );
  }

  // The chosen photograph, or failing that the first landscape frame.
  const hero =
    photos.find((p) => p.id === lensPhoto) ?? photos.find((p) => p.width > p.height) ?? photos[0];
  const rest = photos.filter((p) => p.id !== hero.id);

  return (
    <div id="lens">
      <Expanding photo={hero} />
      <Collage photos={rest} total={photos.length} />
    </div>
  );
}
