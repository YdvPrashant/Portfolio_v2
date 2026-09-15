"use client";

import { useEffect, useRef, useState } from "react";
import { typing } from "@/lib/content";

/* A typing race against him.

   It says it is a race before anyone types: the headline asks whether you can
   type faster than him, and the line under the sentence keeps your speed beside
   his the whole way. The first key starts the clock. His pace, 74.8 wpm being
   74.8 × 5 characters a minute, runs in the background from that moment, so the
   line can say who is ahead.

   When the sentence is finished the result comes up over the sentence itself, in
   type the size of a headline, and the section keeps its height: the result used
   to arrive underneath and push the page down. The progress bars that stood
   above the sentence came out at his request.

   The typing rules are unchanged. Strict: a wrong key does not advance and the
   character you owe turns red until you hit it, so `typed` is always a correct
   prefix of the prompt. Net WPM is correct characters over five, per minute.
   Accuracy counts keystrokes, so a fixed mistake still costs. Paste is blocked.
   Input is a real textarea held invisible over the prompt, so phone keyboards,
   held keys and IMEs behave.

   Time is stamped on keystrokes, and while a race runs an interval ticks the
   clock into state ten times a second. Nothing reads the clock during render. */

const TARGET = typing.wpm;
const PROMPTS = typing.prompts;
// His pace in characters a second, a word being five characters.
const CPS = (TARGET * 5) / 60;

type Tone = "muted" | "accent" | "wrong" | "ink";

const TONE: Record<Tone, string> = {
  muted: "text-muted",
  accent: "text-accent",
  wrong: "text-(--wrong)",
  ink: "text-ink",
};

export default function TypingTest() {
  /* Starts on the same prompt for everyone and advances on "New sentence".
     Picking at random on mount would either mismatch what the server rendered
     or mean setting state in an effect for something nobody needs resolved. */
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = PROMPTS[promptIndex];

  const [typed, setTyped] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastAt, setLastAt] = useState<number | null>(null);
  const [tick, setTick] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const done = typed.length === prompt.length && prompt.length > 0;
  const racing = startedAt !== null && !done;

  // The race clock, running only between the first key and the last.
  useEffect(() => {
    if (!racing) return;
    const id = window.setInterval(() => setTick(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [racing]);

  // Live while racing, frozen at the last keystroke once the line is finished.
  const clock = done ? lastAt : Math.max(tick ?? 0, lastAt ?? 0);
  const seconds = startedAt !== null && clock ? Math.max(0, (clock - startedAt) / 1000) : 0;

  const wpm = seconds > 0 ? typed.length / 5 / (seconds / 60) : 0;
  const strokes = typed.length + errors;
  const accuracy = strokes > 0 ? (typed.length / strokes) * 100 : 100;

  const mine = typed.length / prompt.length;
  const his = startedAt === null ? 0 : Math.min(1, (seconds * CPS) / prompt.length);

  // Judged at the precision shown, so a tie on screen is a tie.
  const yours = Number(wpm.toFixed(1));
  const verdict = !done ? null : yours > TARGET ? "win" : yours < TARGET ? "lose" : "tie";

  const onChange = (value: string) => {
    if (done) return;
    const now = Date.now();

    // Backspace. Clears a block first, otherwise gives back one character.
    if (value.length < typed.length) {
      if (blocked) setBlocked(false);
      else setTyped(typed.slice(0, -1));
      return;
    }

    // Only ever consider the first new character, so a burst of input from
    // autofill or dictation cannot skip ahead.
    const char = value.slice(typed.length, typed.length + 1);
    if (!char) return;

    if (startedAt === null) setStartedAt(now);
    setLastAt(now);

    if (char === prompt[typed.length]) {
      setBlocked(false);
      setTyped(prompt.slice(0, typed.length + 1));
    } else {
      setBlocked(true);
      setErrors((n) => n + 1);
    }
  };

  const restart = (another: boolean) => {
    if (another) setPromptIndex((i) => (i + 1) % PROMPTS.length);
    setTyped("");
    setBlocked(false);
    setErrors(0);
    setStartedAt(null);
    setLastAt(null);
    setTick(null);
    inputRef.current?.focus();
  };

  let status: { text: string; tone: Tone };
  if (blocked) status = { text: "Wrong key, the red one is next", tone: "wrong" };
  else if (startedAt === null) status = { text: "Start typing to race", tone: "muted" };
  else if (his >= 1) status = { text: "I have finished. You can still finish", tone: "ink" };
  else if (mine > his) status = { text: "You are ahead", tone: "accent" };
  else if (mine < his) status = { text: "I am ahead", tone: "ink" };
  else status = { text: "Level", tone: "ink" };

  const buttonClass =
    "-my-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em] underline decoration-1 underline-offset-4 transition-colors duration-200";

  return (
    <section data-tone="deep" className="w-full bg-ground px-[5.5vw] py-[11vh] text-ink">
      <div className="grid gap-y-5 lg:grid-cols-12 lg:items-end lg:gap-x-[4vw]">
        <div className="lg:col-span-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Typing race</p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,5.4vw,4.8rem)] font-black uppercase leading-[0.88] tracking-[-0.04em]">
            Can you type faster than me?
          </h2>
        </div>
        <p className="max-w-[40ch] text-[clamp(1rem,1.15vw,1.12rem)] leading-[1.55] text-muted lg:col-span-4">
          My speed is {TARGET} wpm on {typing.source}. Type the sentence below. The race starts with your first key.
        </p>
      </div>

      {/* The sentence and its line of figures, with the result laid over both
          when the race is done, so the section never changes height. */}
      <div className="relative mt-[6vh]">
        <div className="relative cursor-text" onClick={() => inputRef.current?.focus()}>
          <p className="font-mono text-[clamp(0.95rem,1.9vw,1.6rem)] leading-[1.75] tracking-[0.01em]">
            {prompt.split("").map((char, i) => {
              const past = i < typed.length;
              const here = i === typed.length && !done;
              const space = char === " ";
              return (
                <span
                  key={i}
                  style={{
                    color: here && blocked ? "var(--wrong)" : "var(--ink)",
                    opacity: past || here ? 1 : 0.3,
                    background:
                      here && blocked
                        ? "color-mix(in oklab, var(--wrong) 22%, transparent)"
                        : here && space
                          ? "color-mix(in oklab, var(--accent) 25%, transparent)"
                          : undefined,
                    boxShadow: here && !blocked ? "inset 0 -2px 0 var(--accent)" : undefined,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </p>

          <textarea
            ref={inputRef}
            value={typed}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Enter after a finish races the same sentence again.
              if (done && e.key === "Enter") {
                e.preventDefault();
                restart(false);
              }
            }}
            onPaste={(e) => e.preventDefault()}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Type the sentence shown to race"
            className="absolute inset-0 h-full w-full resize-none opacity-0"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4 border-t border-rule pt-6 font-mono text-[11px] uppercase tracking-[0.2em]">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <span className="flex items-baseline gap-2">
              <span className="text-muted">You</span>
              <span className="text-[13px] tabular-nums text-accent">{startedAt === null ? "0.0" : wpm.toFixed(1)}</span>
              <span className="text-muted">wpm</span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-muted">Me</span>
              <span className="text-[13px] tabular-nums">{TARGET}</span>
              <span className="text-muted">wpm</span>
            </span>
            <span className="tabular-nums text-muted">{accuracy.toFixed(0)}% accurate</span>
            <span className="tabular-nums text-muted">
              {typed.length} / {prompt.length}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p aria-live="polite" className={TONE[status.tone]}>
              {status.text}
            </p>
            <button onClick={() => restart(true)} className={buttonClass + " text-muted hover:text-ink"}>
              New sentence
            </button>
          </div>
        </div>

        {verdict ? (
          <div
            role="status"
            className="absolute inset-0 z-10 flex animate-[rise-in_420ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col justify-center gap-4 bg-ground"
          >
            <p
              className={
                "font-display text-[clamp(2.4rem,5vw,4.5rem)] font-black uppercase leading-[0.86] tracking-[-0.05em] " +
                (verdict === "win" ? "text-accent" : verdict === "lose" ? "text-(--wrong)" : "text-ink")
              }
            >
              {verdict === "win" ? "You win" : verdict === "lose" ? "You lose" : "A tie"}
            </p>
            <p className="max-w-[52ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-[1.45]">
              {verdict === "win"
                ? `You typed ${yours} wpm. I type ${TARGET}, so you beat me.`
                : verdict === "lose"
                  ? `You typed ${yours} wpm. I type ${TARGET}, so I win this one.`
                  : `You typed ${yours} wpm, exactly my speed.`}{" "}
              <span className="text-muted">{accuracy.toFixed(0)}% accurate.</span>
            </p>
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <button onClick={() => restart(false)} className={buttonClass + " text-ink hover:text-accent"}>
                Race again
              </button>
              <button onClick={() => restart(true)} className={buttonClass + " text-muted hover:text-ink"}>
                New sentence
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
