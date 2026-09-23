"use client";

import { useEffect, useRef, useState } from "react";
import { typing } from "@/lib/content";

/* A race against Prashant's typing speed. His pace starts with your first key
   and moves through the sentence as a second caret, so it is obvious you are
   racing. A wrong key does not advance: it marks the character you owe and
   counts against your accuracy. Paste is blocked.

   Net speed is correct characters / 5 / minutes, and every character typed is
   correct by construction, so mashing keys cannot score. */

const HIS_CPS = (typing.wpm * 5) / 60;

type Phase = "idle" | "racing" | "done";

export function TypeRace() {
  const [round, setRound] = useState(0);
  const prompt = typing.prompts[round % typing.prompts.length];
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ghost, setGhost] = useState(0);
  const [miss, setMiss] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [result, setResult] = useState<{ wpm: number; accuracy: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const clock = useRef({ start: 0, keys: 0, wrong: 0 });
  const live = useRef<HTMLSpanElement>(null);
  const posRef = useRef(0);

  // His caret, and your live speed, while the race runs.
  useEffect(() => {
    if (phase !== "racing") return;
    let frame = 0;
    const tick = () => {
      const seconds = (performance.now() - clock.current.start) / 1000;
      setGhost(Math.min(prompt.length, Math.floor(seconds * HIS_CPS)));
      if (live.current && seconds > 0.4) {
        live.current.textContent = ((posRef.current / 5) / (seconds / 60)).toFixed(1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, prompt.length]);

  const reset = (next: number) => {
    setRound(next);
    setPos(0);
    posRef.current = 0;
    setPhase("idle");
    setGhost(0);
    setMiss(-1);
    setResult(null);
    clock.current = { start: 0, keys: 0, wrong: 0 };
    if (live.current) live.current.textContent = "0.0";
    input.current?.focus();
  };

  const type = (ch: string) => {
    if (phase === "done") return;
    const now = performance.now();
    if (phase === "idle") {
      clock.current.start = now;
      setPhase("racing");
    }
    clock.current.keys += 1;
    const at = posRef.current;
    if (ch === prompt[at]) {
      const next = at + 1;
      posRef.current = next;
      setPos(next);
      setMiss(-1);
      if (next === prompt.length) {
        const minutes = (now - clock.current.start) / 60000;
        const wpm = next / 5 / Math.max(minutes, 1e-6);
        const accuracy = (clock.current.keys - clock.current.wrong) / clock.current.keys;
        setResult({ wpm: minutes > 0 ? wpm : 0, accuracy });
        setGhost(Math.min(prompt.length, Math.floor(((now - clock.current.start) / 1000) * HIS_CPS)));
        setPhase("done");
      }
    } else {
      clock.current.wrong += 1;
      setMiss(at);
    }
  };

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    e.currentTarget.value = "";
    // One event can carry several characters (fast typing, some keyboards).
    for (const ch of value) type(ch);
  };

  const verdict = (() => {
    if (!result) return null;
    const diff = result.wpm - typing.wpm;
    if (Math.abs(diff) < 0.05) return "A dead heat.";
    return diff > 0 ? `You win by ${diff.toFixed(1)} wpm.` : `I win by ${(-diff).toFixed(1)} wpm.`;
  })();

  return (
    <section
      id="race"
      data-theme="blue"
      aria-labelledby="race-title"
      className="px-pad py-[clamp(80px,13vh,168px)]"
    >
      <div className="grid grid-cols-12 items-end gap-x-[var(--gap)] gap-y-6">
        <h2 id="race-title" className="t-xxl col-span-12 lg:col-span-6">
          Race me
        </h2>
        <p className="t-m col-span-12 max-w-[36ch] lg:col-span-5 lg:col-start-8">
          I type {typing.wpm} words a minute on {typing.source}. Type the sentence below; my pace starts
          with your first key.
        </p>
      </div>

      <div className="relative mt-[clamp(40px,7vh,88px)] border-t border-rule pt-8">
        <div className="relative">
        {phase === "done" && result ? (
          <div aria-live="polite">
            <p className="t-xl max-w-[18ch]">{verdict}</p>
            <p className="t-m mt-5 text-muted">
              You {result.wpm.toFixed(1)} wpm at {Math.round(result.accuracy * 100)}% accuracy. Me{" "}
              {typing.wpm} wpm.
            </p>
          </div>
        ) : (
          <label className="race-text t-l block max-w-[40ch] cursor-text select-none" htmlFor="race-input">
            {Array.from(prompt).map((ch, i) => (
              <span
                key={i}
                className={[
                  "race-ch",
                  i < pos ? "is-typed" : "",
                  i === pos && focused ? "is-caret" : "",
                  i === ghost && phase === "racing" ? "is-ghost" : "",
                  i === miss ? "is-miss" : "",
                ].join(" ")}
              >
                {ch}
              </span>
            ))}
          </label>
        )}

        <input
          ref={input}
          id="race-input"
          aria-label="Type the sentence shown"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="race-input"
          onInput={onInput}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") reset(round);
          }}
        />
        </div>

        <div className="t-mono mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <p>
            You <span ref={live}>0.0</span> wpm
          </p>
          <p className="text-muted">
            <span className="race-swatch" aria-hidden="true" />
            Me {typing.wpm} wpm
          </p>
          <p className="text-muted">
            {phase === "idle" && !focused ? "Click the sentence to start" : phase === "idle" ? "Start typing" : phase === "racing" ? "Esc restarts" : ""}
          </p>
          <button
            type="button"
            onClick={() => reset(round + 1)}
            className="hit link-line ml-auto font-[600]"
          >
            {phase === "done" ? "Race again" : "New sentence"}
          </button>
        </div>
      </div>
    </section>
  );
}
