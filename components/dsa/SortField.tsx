"use client";

import { useEffect, useRef, useState } from "react";

/* A field of bars that sorts itself, forever.

   The animation is the content here rather than decoration: this is the page
   about algorithms, so it runs one. Four of them, in turn, then a shuffle and
   round again.

   Each algorithm is recorded to a list of write operations first, then replayed
   at a rate of totalOps / (seconds * 60). That normalisation is the whole trick
   for making it pleasant. Played at a fixed operations-per-frame, selection
   sort finishes in a blink at about 150 writes while insertion sort grinds
   through five thousand, and the page would lurch between the two. Normalised,
   every algorithm takes the same calm eight seconds and you can actually watch
   what each one does differently.

   Touched bars flare white and decay back to acid over a few frames, which is
   what makes the shape of each algorithm legible: insertion's slow crawl,
   selection's single long reach, merge's tidy sweeps, quicksort's scatter. */

const GROUND = "#053c2b";
const ACID = [233, 255, 61] as const;

const SECONDS = 8;
const HOLD = 90; // frames to admire the sorted ramp
const SHUFFLE_FRAMES = 70;

type Op = { t: 0; i: number; j: number } | { t: 1; i: number; v: number };

function insertion(src: number[]): Op[] {
  const a = src.slice();
  const ops: Op[] = [];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      ops.push({ t: 1, i: j + 1, v: a[j] });
      j--;
    }
    a[j + 1] = key;
    ops.push({ t: 1, i: j + 1, v: key });
  }
  return ops;
}

function selection(src: number[]): Op[] {
  const a = src.slice();
  const ops: Op[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
    if (m !== i) {
      const tmp = a[i];
      a[i] = a[m];
      a[m] = tmp;
      ops.push({ t: 0, i, j: m });
    }
  }
  return ops;
}

function merge(src: number[]): Op[] {
  const a = src.slice();
  const buf = a.slice();
  const ops: Op[] = [];
  const go = (lo: number, hi: number) => {
    if (hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    go(lo, mid);
    go(mid, hi);
    for (let k = lo; k < hi; k++) buf[k] = a[k];
    let i = lo;
    let j = mid;
    for (let k = lo; k < hi; k++) {
      const v = i < mid && (j >= hi || buf[i] <= buf[j]) ? buf[i++] : buf[j++];
      a[k] = v;
      ops.push({ t: 1, i: k, v });
    }
  };
  go(0, a.length);
  return ops;
}

function quick(src: number[]): Op[] {
  const a = src.slice();
  const ops: Op[] = [];
  const go = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) {
        if (i !== j) {
          const tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
          ops.push({ t: 0, i, j });
        }
        i++;
      }
    }
    if (i !== hi) {
      const tmp = a[i];
      a[i] = a[hi];
      a[hi] = tmp;
      ops.push({ t: 0, i, j: hi });
    }
    go(lo, i - 1);
    go(i + 1, hi);
  };
  go(0, a.length - 1);
  return ops;
}

const ALGOS = [
  { name: "Insertion sort", note: "O(n²)", run: insertion },
  { name: "Selection sort", note: "O(n²)", run: selection },
  { name: "Merge sort", note: "O(n log n)", run: merge },
  { name: "Quicksort", note: "O(n log n)", run: quick },
];

export default function SortField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [algo, setAlgo] = useState(0);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let disposed = false;

    let values: number[] = [];
    let heat: Float32Array = new Float32Array(0);
    let ops: Op[] = [];
    let cursor = 0;
    let perFrame = 1;
    let carry = 0;
    let phase: "sorting" | "hold" | "shuffle" = "sorting";
    let timer = 0;
    let current = 0;

    const build = (n: number) => {
      values = Array.from({ length: n }, (_, i) => (i + 1) / n);
      for (let i = n - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = values[i];
        values[i] = values[j];
        values[j] = tmp;
      }
      heat = new Float32Array(n);
    };

    const start = (index: number) => {
      current = index;
      setAlgo(index);
      ops = ALGOS[index].run(values);
      cursor = 0;
      carry = 0;
      // The rate, not the step size, is what keeps every algorithm the same
      // length on screen.
      perFrame = Math.max(ops.length / (SECONDS * 60), 0.25);
      phase = "sorting";
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch) return;
      w = Math.floor(cw * dpr);
      h = Math.floor(ch * dpr);
      canvas.width = w;
      canvas.height = h;
      const n = Math.max(40, Math.min(200, Math.floor(cw / 11)));
      if (values.length !== n) {
        build(n);
        start(current);
      }
    };

    const apply = (op: Op) => {
      if (op.t === 0) {
        const tmp = values[op.i];
        values[op.i] = values[op.j];
        values[op.j] = tmp;
        heat[op.i] = 1;
        heat[op.j] = 1;
      } else {
        values[op.i] = op.v;
        heat[op.i] = 1;
      }
    };

    let shuffleOps: Op[] = [];

    const draw = () => {
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, 0, w, h);

      const n = values.length;
      const slot = w / n;
      const bar = Math.max(1.5 * dpr, slot - 2.2 * dpr);
      const top = h * 0.06;
      const span = h - top;

      for (let i = 0; i < n; i++) {
        const heightPx = values[i] * span;
        const t = heat[i];
        // Acid at rest, white at the moment it is touched.
        const r = ACID[0] + (255 - ACID[0]) * t;
        const g = ACID[1];
        const b = ACID[2] + (255 - ACID[2]) * t;
        ctx.fillStyle = `rgba(${r | 0},${g},${b | 0},${0.62 + 0.38 * t})`;
        ctx.fillRect(i * slot + (slot - bar) / 2, h - heightPx, bar, heightPx);
        heat[i] = t * 0.9;
      }
    };

    const step = () => {
      if (phase === "sorting") {
        carry += perFrame;
        while (carry >= 1 && cursor < ops.length) {
          apply(ops[cursor++]);
          carry -= 1;
        }
        if (cursor >= ops.length) {
          phase = "hold";
          timer = HOLD;
        }
      } else if (phase === "hold") {
        if (--timer <= 0) {
          shuffleOps = [];
          const n = values.length;
          for (let i = n - 1; i > 0; i--) shuffleOps.push({ t: 0, i, j: (Math.random() * (i + 1)) | 0 });
          cursor = 0;
          carry = 0;
          perFrame = shuffleOps.length / SHUFFLE_FRAMES;
          phase = "shuffle";
        }
      } else {
        carry += perFrame;
        while (carry >= 1 && cursor < shuffleOps.length) {
          apply(shuffleOps[cursor++]);
          carry -= 1;
        }
        if (cursor >= shuffleOps.length) start((current + 1) % ALGOS.length);
      }
      draw();
    };

    const loop = () => {
      if (disposed) return;
      step();
      raf = requestAnimationFrame(loop);
    };

    // Clicking the field jumps to the next algorithm rather than waiting.
    skipRef.current = () => {
      if (phase === "sorting") {
        while (cursor < ops.length) apply(ops[cursor++]);
        phase = "hold";
        timer = 8;
      }
    };

    const ro = new ResizeObserver(resize);
    resize();
    ro.observe(canvas);

    if (reduced) {
      values.sort((a, b) => a - b);
      draw();
    } else {
      loop();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="relative w-full flex-1"
      style={{ background: GROUND, minHeight: 0 }}
      onClick={() => skipRef.current()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Sits in the header's bottom padding, left aligned. It used to be fixed
          at the top left, but that corner now belongs to the wordmark that
          takes you home. */}
      <p className="pointer-events-none absolute left-[5.5vw] top-[-2.4rem] flex items-baseline gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em]">
        <span>{ALGOS[algo].name}</span>
        <span className="opacity-50">{ALGOS[algo].note}</span>
      </p>
    </div>
  );
}
