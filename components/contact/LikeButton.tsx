"use client";

import { useEffect, useState } from "react";

/* The like count. A heart, at his request, outlined until you click it and solid
   in the accent afterwards. It takes the page's ink, so it needs no colour
   passed in.

   The count is fetched after mount rather than server rendered, so the page
   itself stays static and cacheable and only this number is live. Until it
   arrives the slot holds an em dash, so nothing shifts when it lands.

   The click is optimistic. The server is the authority on whether this browser
   has already liked, and it answers with the real count, but making someone
   wait on a round trip to see their own click land feels broken. */

export default function LikeButton() {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/likes")
      .then((r) => r.json())
      .then((d: { count: number; liked: boolean; ready: boolean }) => {
        if (cancelled) return;
        setCount(d.count);
        setLiked(d.liked);
        setReady(d.ready);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const like = async () => {
    if (liked || !ready) return;
    setLiked(true);
    setCount((c) => (c ?? 0) + 1);
    try {
      const d = await fetch("/api/likes", { method: "POST" }).then((r) => r.json());
      setCount(d.count);
      setLiked(d.liked);
    } catch {
      // Leave the optimistic state. The next visitor to load the page gets the
      // true number, and rolling the count backwards under someone who just
      // clicked is worse than being one out until reload.
    }
  };

  if (!ready) return null;

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={like}
        disabled={liked}
        aria-pressed={liked}
        aria-label={liked ? "You liked this site" : "Like this site"}
        className="transition-[scale,color] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:text-accent active:scale-95 disabled:text-accent disabled:hover:scale-100"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-[clamp(26px,2.6vw,34px)] w-[clamp(26px,2.6vw,34px)]"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={liked ? 0 : 1.7}
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <span
        className="font-display font-black leading-none tracking-[-0.04em] tabular-nums"
        style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.8rem)" }}
      >
        {count === null ? "—" : count.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
