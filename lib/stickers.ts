import {
  siCplusplus,
  siCss,
  siDocker,
  siExpress,
  siFastapi,
  siGit,
  siGithub,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siLinux,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siOpencv,
  siPostman,
  siPython,
  siPytorch,
  siReact,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";

/* The CV as a laptop lid covered in stickers. Seven large stickers carry the
   facts; small ones carry the stack, a real logo where one exists and a word
   where it does not. Everything is placed here, on the server, with a seeded
   shuffle, so the page renders the same arrangement every time and the
   browser only has to handle the dragging.

   Two arrangements: `wide` for a landscape lid and `tall` for a phone. Sizes
   are in cqw, hundredths of the lid's width, so the whole lid scales as one. */

export type Place = { x: number; y: number; w: number; r: number };

export type FactKind = "seal" | "holo" | "block" | "keycap" | "stamp" | "pill" | "prism";

export type Sticker =
  | { kind: "fact"; id: FactKind; wide: Place; tall: Place; h: { wide: number; tall: number } }
  | { kind: "logo"; id: string; name: string; path: string; ink: Ink; round: boolean; wide: Place; tall: Place }
  | { kind: "word"; id: string; text: string; tone: number; wide: Place; tall: Place };

// Width over height, as .lid sets it in globals.css.
export const LID = { wide: 1.85, tall: 0.48 };

// Word stickers are set in the mono at these sizes (.sticker-word in globals.css).
const WORD_FONT = { wide: 1.12, tall: 2.9 };

/* The site's inks, and nothing else: logos are printed in one colour on one
   of these, like a short print run, rather than in their brand colours. */
export type Ink = { fill: string; on: string };
const INK = {
  ink: { fill: "#0f0f0f", on: "#f0efeb" },
  white: { fill: "#fbfbf8", on: "#0f0f0f" },
  blue: { fill: "#2b2bff", on: "#f0efeb" },
  yellow: { fill: "#ffe600", on: "#0f0f0f" },
  cyan: { fill: "#00a0e9", on: "#0f0f0f" },
  magenta: { fill: "#e4007f", on: "#fbfbf8" },
} satisfies Record<string, Ink>;
// Mostly black and white, with the colours used sparingly.
const RUN: (keyof typeof INK)[] = [
  "ink", "white", "blue", "white", "ink", "yellow", "white", "ink", "cyan", "white",
  "ink", "magenta", "white", "ink", "blue", "white", "ink", "yellow", "white", "ink",
  "blue", "white", "ink", "cyan", "magenta",
];

// The facts, placed by hand. x and y are percent of the lid; w and h are cqw.
// On a phone they fill the top 70 percent, and the stack gets the bottom.
const FACTS: { id: FactKind; wide: Place & { h: number }; tall: Place & { h: number } }[] = [
  { id: "seal", wide: { x: 3.5, y: 6, w: 18, h: 18, r: -9 }, tall: { x: 3, y: 1.5, w: 38, h: 38, r: -8 } },
  { id: "holo", wide: { x: 26, y: 3, w: 16, h: 16, r: 8 }, tall: { x: 58, y: 2.9, w: 33, h: 33, r: 9 } },
  { id: "block", wide: { x: 46.5, y: 8, w: 23, h: 12.5, r: -3 }, tall: { x: 5, y: 22, w: 52, h: 28, r: -4 } },
  { id: "prism", wide: { x: 72, y: 4.5, w: 25, h: 12.5, r: 5 }, tall: { x: 34, y: 58.6, w: 58, h: 29, r: -4 } },
  { id: "keycap", wide: { x: 11, y: 54, w: 12, h: 12, r: 10 }, tall: { x: 64, y: 23, w: 27, h: 27, r: 10 } },
  { id: "pill", wide: { x: 32, y: 63, w: 28, h: 8, r: -5 }, tall: { x: 36, y: 44.2, w: 60, h: 17, r: 5 } },
  { id: "stamp", wide: { x: 68, y: 49, w: 13, h: 16, r: 6 }, tall: { x: 5, y: 40.3, w: 28, h: 34, r: -6 } },
];

const LOGOS = [
  { id: "cpp", name: "C++", icon: siCplusplus },
  { id: "python", name: "Python", icon: siPython },
  { id: "javascript", name: "JavaScript", icon: siJavascript },
  { id: "typescript", name: "TypeScript", icon: siTypescript },
  { id: "react", name: "React", icon: siReact },
  { id: "next", name: "Next.js", icon: siNextdotjs },
  { id: "tailwind", name: "Tailwind CSS", icon: siTailwindcss },
  { id: "html", name: "HTML", icon: siHtml5 },
  { id: "css", name: "CSS", icon: siCss },
  { id: "node", name: "Node.js", icon: siNodedotjs },
  { id: "express", name: "Express", icon: siExpress },
  { id: "fastapi", name: "FastAPI", icon: siFastapi },
  { id: "jwt", name: "JWT auth", icon: siJsonwebtokens },
  { id: "mongodb", name: "MongoDB", icon: siMongodb },
  { id: "mysql", name: "MySQL", icon: siMysql },
  { id: "sqlite", name: "SQLite", icon: siSqlite },
  { id: "pytorch", name: "PyTorch", icon: siPytorch },
  { id: "opencv", name: "OpenCV", icon: siOpencv },
  { id: "gemini", name: "Gemini", icon: siGooglegemini },
  { id: "git", name: "Git", icon: siGit },
  { id: "github", name: "GitHub", icon: siGithub },
  { id: "docker", name: "Docker", icon: siDocker },
  { id: "vercel", name: "Vercel", icon: siVercel },
  { id: "postman", name: "Postman", icon: siPostman },
  { id: "linux", name: "Linux", icon: siLinux },
];

// Resume skills that are techniques, or have no logo in the set.
const WORDS = ["SQL", "REST APIs", "RAG", "CLIP", "Computer vision", "Groq"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Box = { w: number; h: number; word: boolean };

/** A word's box in cqw: the mono advances 0.61em a letter, with 1em of padding each side. */
function wordBox(text: string, layout: "wide" | "tall"): Box {
  const em = WORD_FONT[layout];
  return { w: (text.length * 0.61 + 2) * em, h: 2.2 * em, word: true };
}

type Rect = { l: number; r: number; t: number; b: number };

/** The upright bounds, in cqw, of a box turned about its centre. */
function bounds(x: number, y: number, w: number, h: number, deg: number): Rect {
  const a = (Math.abs(deg) * Math.PI) / 180;
  const hw = (w * Math.cos(a) + h * Math.sin(a)) / 2;
  const hh = (w * Math.sin(a) + h * Math.cos(a)) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { l: cx - hw, r: cx + hw, t: cy - hh, b: cy + hh };
}

const overlaps = (a: Rect, b: Rect, gap: number) =>
  a.l < b.r + gap && b.l < a.r + gap && a.t < b.b + gap && b.t < a.b + gap;

/** Free cells of a jittered grid, skipping any whose centre is under a fact.
    A logo may tuck under the edge of a fact, but a word has to stay readable,
    so a word that would touch a fact or another word moves to the first cell
    where it clears them. */
function scatter(
  boxes: Box[],
  aspect: number,
  cols: number,
  rows: number,
  layout: "wide" | "tall",
  seed: number,
): Place[] {
  const rand = seeded(seed);
  const blocked = (cx: number, cy: number) =>
    FACTS.some((f) => {
      const p = f[layout];
      const w = p.w;
      const h = p.h * aspect;
      return cx > p.x - 2 && cx < p.x + w + 2 && cy > p.y - 3 && cy < p.y + h + 3;
    });
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = ((c + 0.5) / cols) * 100;
      const cy = ((r + 0.5) / rows) * 100;
      if (!blocked(cx, cy)) cells.push({ x: cx, y: cy });
    }
  }
  // Seeded shuffle, then take as many cells as there are stickers.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const cw = 100 / cols;
  const ch = 100 / rows;
  // y is a percent of the lid's height; dividing by the aspect turns it into cqw.
  const facts = FACTS.map((f) => {
    const p = f[layout];
    return bounds(p.x, p.y / aspect, p.w, p.h, p.r);
  });
  const words: Rect[] = [];
  return boxes.map((box, i) => {
    const jx = (rand() - 0.5) * cw * 0.5;
    const jy = (rand() - 0.5) * ch * 0.5;
    const r = Math.round((rand() - 0.5) * 36);
    const h = box.h * aspect;
    const at = (cell: { x: number; y: number }): Place => ({
      x: Math.min(100 - box.w, Math.max(0.5, cell.x - box.w / 2 + jx)),
      y: Math.min(100 - h, Math.max(1, cell.y - h / 2 + jy)),
      w: box.w,
      r,
    });
    let place = at(cells[i % cells.length]);
    if (box.word) {
      const edge = (p: Place) => bounds(p.x, p.y / aspect, box.w, box.h, p.r);
      const clear = (p: Place) => ![...facts, ...words].some((o) => overlaps(o, edge(p), 1.5));
      if (!clear(place)) place = cells.map(at).find(clear) ?? place;
      words.push(edge(place));
    }
    return place;
  });
}

function build(): Sticker[] {
  const boxes = (layout: "wide" | "tall", size: number): Box[] => [
    ...LOGOS.map(() => ({ w: size, h: size, word: false })),
    ...WORDS.map((text) => wordBox(text, layout)),
  ];
  const wide = scatter(boxes("wide", 6.2), LID.wide, 11, 5, "wide", 11);
  const tall = scatter(boxes("tall", 13), LID.tall, 7, 16, "tall", 29);

  const facts: Sticker[] = FACTS.map((f) => ({
    kind: "fact",
    id: f.id,
    wide: { x: f.wide.x, y: f.wide.y, w: f.wide.w, r: f.wide.r },
    tall: { x: f.tall.x, y: f.tall.y, w: f.tall.w, r: f.tall.r },
    h: { wide: f.wide.h, tall: f.tall.h },
  }));

  const logos: Sticker[] = LOGOS.map((l, i) => ({
    kind: "logo",
    id: l.id,
    name: l.name,
    path: l.icon.path,
    ink: INK[RUN[i % RUN.length]],
    round: i % 3 !== 1,
    wide: wide[i],
    tall: tall[i],
  }));

  // A word sizes itself to its text, so its width is left to the CSS.
  const words: Sticker[] = WORDS.map((text, k) => {
    const i = LOGOS.length + k;
    return {
      kind: "word",
      id: `word-${k}`,
      text,
      tone: k % 3,
      wide: { ...wide[i], w: 0 },
      tall: { ...tall[i], w: 0 },
    };
  });

  // Small stickers first, so the facts land on top of them.
  return [...logos, ...words, ...facts];
}

export const stickers = build();
