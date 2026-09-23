"use client";

import { useEffect, useState } from "react";

/* A like counter backed by Upstash Redis (app/api/likes). One like per
   browser. Outlined until pressed, solid after. When the store is not
   configured the button hides rather than showing a count that means nothing. */

type State = { count: number; liked: boolean; ready: boolean };

export function LikeButton() {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/likes")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: State | null) => {
        if (alive && data) setState(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!state?.ready) return null;

  const like = async () => {
    if (state.liked || busy) return;
    setBusy(true);
    setState({ ...state, liked: true, count: state.count + 1 });
    try {
      const r = await fetch("/api/likes", { method: "POST" });
      if (r.ok) setState(await r.json());
    } catch {
      // The optimistic count stays; the next visit shows the real one.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={like}
      aria-pressed={state.liked}
      aria-label={state.liked ? `You liked this site. ${state.count} likes` : `Like this site. ${state.count} likes`}
      className="like hit group inline-flex items-center gap-2.5"
    >
      <svg viewBox="0 0 24 22" className="size-[18px]" aria-hidden="true">
        <path
          d="M12 21s-8.5-5.2-10.6-10.3C-.2 6.8 2.4 1.5 7 1.5c2.2 0 3.8 1.2 5 3 1.2-1.8 2.8-3 5-3 4.6 0 7.2 5.3 5.6 9.2C20.5 15.8 12 21 12 21z"
          fill={state.liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          className="transition-[fill] duration-300"
        />
      </svg>
      <span className="t-mono tabular-nums">{state.count}</span>
    </button>
  );
}
