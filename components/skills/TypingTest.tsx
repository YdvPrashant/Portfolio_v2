"use client";

import { useMemo, useRef, useState } from "react";
import { typing } from "@/lib/content";

/* Type the line, find out whether you are faster than he is.

   Strict: a wrong key does not advance. The character you owe turns red and
   stays there until you hit it. So `typed` only ever holds characters that were
   correct, which makes it a prefix of the prompt by construction and means the
   word count can never drift out of step with what is on screen.

   Net WPM, the standard definition: correct characters over five, per minute.
   Five characters is the conventional word length. Because wrong keys never
   land, every character counted is one that was actually right.

   Accuracy is measured on keystrokes, not on the final text. Getting a letter
   wrong and then fixing it should cost you something, or accuracy would always
   read a hundred percent.

   Timing is stamped on each keystroke rather than read during render. Reading
   the clock while rendering is impure, and it would also keep inflating the
   elapsed time while someone sits idle mid sentence.

   Paste is blocked; one ctrl+V would otherwise report thousands of words a
   minute. Input is a real textarea held invisible over the prompt rather than a
   keydown listener, so phone keyboards, held keys and IMEs all behave. */

const TARGET = typing.wpm;
const PROMPTS = typing.prompts;

const INK = "#0b0b0b";
const BONE = "#f4f1e9";
const ACID = "#e9ff3d";
const WRONG = "#ff3b1f";

export default function TypingTest() {
  /* Starts on the same prompt for everyone and advances on each retry. Picking
     at random on mount would either mismatch what the server rendered or mean
     setting state in an effect for something nobody needs resolved that way. */
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = PROMPTS[promptIndex];

  const [typed, setTyped] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastAt, setLastAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const done = typed.length === prompt.length && prompt.length > 0;

  const { wpm, accuracy } = useMemo(() => {
    const minutes = startedAt && lastAt ? (lastAt - startedAt) / 60000 : 0;
    const strokes = typed.length + errors;
    return {
      wpm: minutes > 0 ? typed.length / 5 / minutes : 0,
      accuracy: strokes > 0 ? (typed.length / strokes) * 100 : 100,
    };
  }, [typed, errors, startedAt, lastAt]);

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

  const nextSentence = () => {
    setPromptIndex((i) => (i + 1) % PROMPTS.length);
    setTyped("");
    setBlocked(false);
    setErrors(0);
    setStartedAt(null);
    setLastAt(null);
    inputRef.current?.focus();
  };

  const faster = wpm > TARGET;

  return (
    <section style={{ background: INK, color: BONE }} className="w-full px-[5.5vw] py-[11vh]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">
          Type this and find out
        </h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">
          Prashant: {TARGET} wpm on {typing.source}
        </p>
      </div>

      <div className="relative mt-7 cursor-text" onClick={() => inputRef.current?.focus()}>
        <p className="font-mono text-[clamp(0.95rem,1.9vw,1.6rem)] leading-[1.75] tracking-[0.01em]">
          {prompt.split("").map((char, i) => {
            const past = i < typed.length;
            const here = i === typed.length && !done;
            const space = char === " ";
            return (
              <span
                key={i}
                style={{
                  color: here && blocked ? WRONG : BONE,
                  opacity: past ? 1 : here ? 1 : 0.28,
                  background:
                    here && blocked
                      ? "rgba(255,59,31,0.22)"
                      : here && space
                        ? "rgba(233,255,61,0.25)"
                        : undefined,
                  boxShadow: here && !blocked ? `inset 0 -2px 0 ${ACID}` : undefined,
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
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Type the sentence shown"
          className="absolute inset-0 h-full w-full resize-none opacity-0"
        />
      </div>

      <div
        className="mt-8 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-5 border-t pt-5"
        style={{ borderColor: "rgba(244,241,233,0.25)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-9 gap-y-3">
          <span className="flex items-baseline gap-3">
            <span
              className="font-[family-name:var(--font-archivo)] font-black leading-none tabular-nums"
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)", color: done ? ACID : BONE }}
            >
              {startedAt ? wpm.toFixed(1) : "—"}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">wpm</span>
          </span>

          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] tabular-nums opacity-75">{accuracy.toFixed(0)}%</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-55">accurate</span>
          </span>

          <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-40 tabular-nums">
            {typed.length} / {prompt.length}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <p aria-live="polite" className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {done ? (
              <span style={{ color: faster ? ACID : BONE }}>
                {faster ? "You type faster than me" : "You type slower than me"}
              </span>
            ) : blocked ? (
              <span style={{ color: WRONG }}>Wrong key, the red one is next</span>
            ) : (
              <span className="opacity-45">{startedAt ? "Keep going" : "Start typing"}</span>
            )}
          </p>

          <button
            onClick={nextSentence}
            className="font-mono text-[11px] uppercase tracking-[0.18em] underline decoration-1 underline-offset-4 opacity-55 transition-opacity duration-200 hover:opacity-100"
          >
            New sentence
          </button>
        </div>
      </div>
    </section>
  );
}
