"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/unsplash";

/* Two ways to look at the same photographs, switched by the viewer.

   MOSAIC is justified rows. Each photograph grows in proportion to its own
   aspect ratio from a basis of zero, so a row fills the measure exactly and
   every frame in it comes out the same height. Nothing is cropped and no height
   is chosen: it falls out of how many photographs share the row, which is what
   makes the rhythm. The rows are divided up on the server, by intoRows() in
   lib/unsplash.ts.

   REEL centres one photograph with its neighbours falling away either side, and
   never ends: scroll past the last and the first comes round again. It is a
   scroll-snap track rather than transforms computed in JavaScript, because the
   widths vary with each photograph's aspect ratio and the browser can centre a
   variable width item natively.

   The reel is adapted from a reference he supplied, not copied: that one had
   rounded corners, drop shadows and gradients, none of which belong on a site
   built out of flat colour and square edges. */

type Mode = "mosaic" | "reel";

export default function Gallery({ rows }: { rows: Photo[][] }) {
  const [mode, setMode] = useState<Mode>("mosaic");
  // The reel wants one run of photographs; the rows are only the mosaic's
  // business, so it is flattened here rather than passed down twice.
  const photos = useMemo(() => rows.flat(), [rows]);

  return (
    <>
      <div className="flex items-center gap-5 px-[3vw] pb-[3vh]">
        {(["mosaic", "reel"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={
              "-my-2 py-2 font-mono text-[11px] uppercase tracking-[0.2em] underline-offset-[5px] transition-colors duration-200 " +
              (mode === m ? "text-accent underline" : "text-muted hover:text-ink")
            }
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "mosaic" ? <Mosaic rows={rows} /> : <Reel photos={photos} />}
    </>
  );
}

// Enough that even a very tall crop grows by more than one. See the note below.
const GROW = 4;

function Mosaic({ rows }: { rows: Photo[][] }) {
  return (
    <div className="flex flex-col gap-[1.1vw] px-[3vw] pb-[12vh]">
      {rows.map((row, r) => (
        /* The row lengths are chosen for a desktop measure, where five
           photographs across is a rhythm. On a phone the same five came out
           67px wide and 89px tall, which is not a gallery. Wrapping plus a
           floor of 44% lets at most two share a line below sm, and because
           each still grows by its aspect ratio from nothing, every line that
           results is justified exactly as a row is. An odd one over takes the
           full measure on its own, which is the best a phone can give it. */
        <div key={r} className="flex flex-wrap gap-[1.1vw] sm:flex-nowrap">
          {row.map((p) => {
            const aspect = p.width / p.height;
            return (
              <a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="group block min-w-[44%] overflow-hidden sm:min-w-0"
                /* Grow by the aspect ratio from nothing, so the widths in a row
                   come out in proportion to the pictures and the heights match.

                   Scaled by a constant, which changes none of those proportions
                   but keeps every grow factor above one. Flex hands out all the
                   free space only when the factors on a line sum to at least
                   one; below that it hands out that fraction of it and leaves
                   the rest. It never showed on a desktop row of three, and then
                   a single portrait left over on a phone line came out a
                   quarter short of the measure. */
                style={{ flex: `${aspect * GROW} 1 0%`, background: p.color }}
              >
                <span className="block" style={{ aspectRatio: aspect }}>
                  <Image
                    src={p.url}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(max-width: 640px) 100vw, (max-width: 1023px) 33vw, 25vw"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </span>
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* The reel runs three copies of the set end to end and keeps the viewer in the
   middle one. When a move ends in an outer copy the track is rebased by exactly
   one copy width, which is invisible because the copies are identical and the
   offset is exact.

   For that offset to be exact the copies have to stay the same width, which is
   why the centred photograph is matched modulo the set rather than by its
   position in the track: all three of its twins grow at once, so every copy
   always holds exactly one enlarged frame. Enlarging a single twin would make
   its copy wider than the other two, and the rebase would jump by the
   difference.

   Three more decisions are load bearing, and all three were arrived at the
   hard way, by arrow presses that did nothing at all.

   Positions are read off the layout — offsetLeft and offsetWidth against the
   track's own scrollLeft — and never from getBoundingClientRect. A rect is
   relative to the viewport, so it depends on the scroll position, and the
   value you read in the same task as a write to scrollLeft can still be the
   one from before the write. Everything here measures immediately after moving
   the track, so that stale rect was being used to decide where to move next.
   Layout offsets do not shift when the track scrolls, so there is nothing to
   go stale. It is also why the track is `relative`: offsetLeft is measured
   from the nearest positioned ancestor, and that has to be the scroller for
   these numbers to share a coordinate system with scrollLeft.

   The frames off to the side are scaled down into full height slots rather
   than laid out smaller. Animating height reflows the strip for the half
   second the centred frame takes to grow, and a transform does not. Scaling
   about the centre also leaves the middle of each frame exactly where it was,
   so the track's geometry is fixed from the moment it renders. The small gap
   follows from that: the slots are full width even while the frame in them is
   not.

   And the track does its own scrolling rather than using scroll-snap and
   scrollIntoView. A mandatory snap container reacts to any change under it by
   re-snapping, and a re-snap cancels whatever programmatic scroll was running,
   so a press that landed while the last one was still settling was swallowed.
   Writing scrollLeft frame by frame is never refused. What snapping was there
   for — a free wheel or swipe ending with a photograph centred rather than
   half off the edge — is done in settle() below. */
const COPIES = 3;
const GLIDE = 420;
const REST = 160;

// Where a frame's middle sits in the track's own coordinates.
function centreOf(child: HTMLElement) {
  return child.offsetLeft + child.offsetWidth / 2;
}

// Where the track has to be scrolled to for that frame to be under the middle.
function restFor(track: HTMLDivElement, i: number) {
  const child = track.children[i] as HTMLElement | undefined;
  return child ? centreOf(child) - track.clientWidth / 2 : track.scrollLeft;
}

// And which frame is under the middle now.
function middleOf(track: HTMLDivElement) {
  const middle = track.scrollLeft + track.clientWidth / 2;
  let best = 0;
  let bestGap = Infinity;
  Array.from(track.children).forEach((c, i) => {
    const gap = Math.abs(centreOf(c as HTMLElement) - middle);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  });
  return best;
}

/* Back into the middle copy, by the distance between the centred photograph
   and its own twin a copy away. Nothing on screen changes: the twin is the
   same photograph and every copy is laid out identically. */
function rebase(track: HTMLDivElement, count: number) {
  const place = middleOf(track);
  if (place >= count && place < count * 2) return;
  const here = track.children[place] as HTMLElement | undefined;
  const twin = track.children[place + (place < count ? count : -count)] as
    | HTMLElement
    | undefined;
  if (!here || !twin) return;

  const next = track.scrollLeft + centreOf(twin) - centreOf(here);
  // A rebase that would run off either end is refused. The browser would clamp
  // it, and that clamp is the one jump that would be visible. Only a set small
  // enough to leave the track barely scrollable gets there.
  if (next < 0 || next > track.scrollWidth - track.clientWidth) return;
  track.scrollLeft = next;
}

function Reel({ photos }: { photos: Photo[] }) {
  const count = photos.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  /* Where the reel is heading, and until when. The settle below has to keep
     its hands off the scroll position while a glide is still arriving, or it
     reads whichever frame happens to be passing the middle and pulls back to
     centre that one, which looks exactly like the arrows not working.

     A deadline rather than a flag, because a flag has to be cleared when the
     glide lands and there is no reliable moment to do that: a browser that is
     not drawing the tab does not animate, it simply arrives. A deadline lapses
     on its own. */
  const glide = useRef({ until: 0, target: 0 });

  const strip = useMemo(
    () => Array.from({ length: COPIES * count }, (_, i) => photos[i % count]),
    [photos, count],
  );

  // Slide the track until frame i is under the middle.
  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(track.children.length - 1, i));

      const from = track.scrollLeft;
      /* Clamped to what the track can actually reach. The frames at either end
         of the strip cannot be brought to the middle — there is no scroll left
         to give — and without this the settle below would ask for that
         position, fail, be woken by its own scroll, and ask again forever. */
      const to = Math.max(
        0,
        Math.min(track.scrollWidth - track.clientWidth, restFor(track, clamped)),
      );
      const distance = to - from;
      if (Math.abs(distance) < 1) {
        rebase(track, count);
        return;
      }

      glide.current.until = performance.now() + GLIDE;
      glide.current.target = clamped;
      /* The browser's own smooth scroll rather than a hand written one on
         requestAnimationFrame. Both look the same when the tab is on screen,
         but a frame loop stops dead in a background tab, which left presses
         doing nothing until you came back and then doing nothing still. This
         is a request for a scroll position: the browser owes you that position
         whether or not it ever draws a frame of the journey. */
      track.scrollTo({ left: to, behavior: "smooth" });
    },
    [count],
  );

  /* The arrows and the arrow keys move one frame from wherever the reel is
     going. Mid glide that is the frame it is heading for, not the one passing
     the middle, so holding an arrow down advances one photograph per press
     rather than losing most of them. */
  const step = useCallback(
    (by: number) => {
      const track = trackRef.current;
      if (!track) return;
      const gliding = performance.now() < glide.current.until;
      goTo((gliding ? glide.current.target : middleOf(track)) + by);
    },
    [goTo],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let idle = 0;

    // A wheel, a swipe or the scrollbar stops wherever it stops. Once it has,
    // the nearest photograph comes to the middle.
    const settle = () => {
      if (performance.now() < glide.current.until) return;
      rebase(track, count);
      goTo(middleOf(track));
    };

    // Whichever photograph is nearest the middle is the active one, however the
    // track was moved: arrows, keys, trackpad or the scrollbar itself.
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCurrent(middleOf(track) % count));
      clearTimeout(idle);
      idle = window.setTimeout(settle, REST);
    };

    track.addEventListener("scroll", onScroll, { passive: true });

    // Open on the first photograph of the middle copy, so there is a whole set
    // to scroll back through before the first rebase is needed. Assigned, not
    // nudged by a delta, so that running the effect twice lands in the same
    // place rather than twice as far along.
    track.scrollLeft = restFor(track, count);

    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(idle);
    };
  }, [count, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="pb-[7vh]">
      <div
        ref={trackRef}
        className="relative flex items-center gap-[0.5vw] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: "clamp(280px, 54vh, 560px)" }}
      >
        {strip.map((p, i) => {
          const on = i % count === current;
          return (
            <a
              key={`${p.id}-${Math.floor(i / count)}`}
              href={p.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                // A photograph off to the side brings itself to the middle
                // first; only the centred one opens.
                if (!on) {
                  e.preventDefault();
                  goTo(i);
                }
              }}
              className="relative block shrink-0 overflow-hidden transition-[transform,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: "100%",
                aspectRatio: p.width / p.height,
                transform: on ? "none" : "scale(0.74)",
                opacity: on ? 1 : 0.4,
                background: p.color,
              }}
            >
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="40vw"
                className="object-cover"
              />
            </a>
          );
        })}
      </div>

      <div className="mt-[3vh] flex items-center justify-between gap-6 px-[3vw]">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted">
          {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>

        <div className="flex items-center gap-5 text-ink">
          <button
            onClick={() => step(-1)}
            aria-label="Previous photograph"
            className="-m-3 p-3 font-mono text-[15px] transition-opacity duration-200 hover:opacity-60"
          >
            &larr;
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next photograph"
            className="-m-3 p-3 font-mono text-[15px] transition-opacity duration-200 hover:opacity-60"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
