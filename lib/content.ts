/* Everything the site says, in one place. Every fact traces to
   resume/prashant-yadav-resume.tex, apart from two figures Prashant gave
   directly: 700+ problems solved across platforms, and 74.8 wpm on keybr.com.
   The phone number on the original resume is deliberately absent. */

export const person = {
  name: "Prashant Yadav",
  first: "Prashant",
  last: "Yadav",
  intro:
    "Software engineer in Lucknow, India. I build web applications and machine learning systems end to end, from the interface down to the model.",
  location: "Lucknow, Uttar Pradesh, India",
  email: "ydvprashant0508@gmail.com",
  cv: { href: "/prashant-yadav-resume.pdf", file: "Prashant-Yadav-CV.pdf" },
  links: [
    { label: "GitHub", href: "https://github.com/YdvPrashant" },
    { label: "LinkedIn", href: "https://linkedin.com/in/pr7nt/" },
    { label: "Unsplash", href: "https://unsplash.com/@pr7nt" },
  ],
} as const;

export type Highlight = {
  /** The number that leads the paragraph. */
  figure: string;
  caption: string;
  text: string;
};

export type Media =
  | { kind: "image"; src: string; alt: string; width: number; height: number; tone: "light" | "dark" }
  | { kind: "diagram"; alt: string };

export type Project = {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  period: string;
  year: string;
  stack: string[];
  link: { label: string; href: string };
  summary: string;
  metric: { value: string; label: string };
  highlights: Highlight[];
  media: Media;
};

export const projects: Project[] = [
  {
    slug: "prism",
    index: "01",
    title: "Prism",
    kicker: "News transparency and bias analysis",
    period: "April 2026 to present",
    year: "2026",
    stack: ["Next.js", "TypeScript", "React", "Tailwind", "Node.js", "Gemini", "Groq", "RAG"],
    link: { label: "prismrefractor.in", href: "https://www.prismrefractor.in/" },
    summary:
      "A web app that refracts any article URL, YouTube link or pasted text into a six stage analysis: sentence level claim, opinion and rhetoric classification, source provenance, live fact checking and coverage gaps.",
    metric: { value: "93.3%", label: "fact checks correct, zero incorrect verdicts" },
    highlights: [
      {
        figure: "93.3%",
        caption: "28 of 30 labelled claims, zero incorrect verdicts",
        text: "Measured on an offline evaluation harness built with no new dependencies. Every decisive verdict has to carry resolved citations from two independent owner groups, and every downgrade path routes to unverified instead of an adverse ruling.",
      },
      {
        figure: "18 of 18",
        caption: "concurrent analyses held at HTTP 200",
        text: "Google's 15 requests a minute ceiling is undocumented, so I worked it out from live 429 bodies. A full run now takes roughly 13 model requests, with Gemini to Groq failover, a four tier article extraction fallback and an SSRF guard on the URL fetch.",
      },
      {
        figure: "4 APIs",
        caption: "behind one provider agnostic call site",
        text: "Five API routes orchestrate four external APIs. Swapping the model provider changes one call site, not every stage of the analysis.",
      },
    ],
    media: {
      kind: "image",
      src: "/projects/prism.jpg",
      alt: "Prism's landing page: the word PRISM with a refracted M, above the line One story. Every angle it was told from.",
      width: 1512,
      height: 787,
      tone: "light",
    },
  },
  {
    slug: "conflict-detection",
    index: "02",
    title: "Conflict & Weapon Detection",
    kicker: "A real time, three stage vision pipeline",
    period: "March 2025 to September 2025",
    year: "2025",
    stack: ["Python", "PyTorch", "YOLOv8", "Swin Transformer", "OpenCV", "CUDA"],
    link: { label: "GitHub", href: "https://github.com/YdvPrashant/Ultimate_Conflict_Detection" },
    summary:
      "A cascaded pipeline over live 1280 by 720 video. YOLOv8s finds people, a Swin Tiny classifier scores conflict, and a YOLOv8 detector looks for weapons, with the heavy stages gated behind the cheap one.",
    metric: { value: "2.2×", label: "faster per frame, with an honest baseline" },
    highlights: [
      {
        figure: "2.2×",
        caption: "lower per frame latency",
        text: "228 to 104 ms on CPU and 59 to 26 ms on GPU, 38.4 FPS on an RTX 3060, by gating the heavy stages behind the cheap one and scoring every third frame.",
      },
      {
        figure: "0.808",
        caption: "PR-AUC on 519 held out videos",
        text: "The first model reported 98.4 percent accuracy and I did not believe it. A frame wise split had left 98.5 percent of validation clips inside training. Regrouping with StratifiedGroupKFold on source video, and pruning near duplicate frames from 69,797 to 20,075, gave baselines I can defend: PR-AUC 0.808 and 74.8 percent per video accuracy.",
      },
      {
        figure: "0.023",
        caption: "calibration error, down from 0.065",
        text: "The threshold comes from the validation PR curve, at 0.669 precision and 0.850 recall. Temperature scaling cut the calibration error, and perceptual hashing exposed 48.6 percent cross split contamination in the weapon dataset.",
      },
    ],
    media: {
      kind: "diagram",
      alt: "Diagram of the pipeline: video frames pass a person detector, and only frames with people reach the conflict classifier and the weapon detector.",
    },
  },
  {
    slug: "ctximg",
    index: "03",
    title: "ctximg",
    kicker: "Photo search that runs entirely offline",
    period: "October 2025 to March 2026",
    year: "2026",
    stack: ["Python", "PyTorch", "OpenCLIP", "SigLIP 2", "FastAPI", "SQLite", "NumPy"],
    link: { label: "GitHub", href: "https://github.com/YdvPrashant/ctximg" },
    summary:
      "Every image and every plain English query lands in one CLIP vector space and ranks by cosine similarity. No tags, no filenames, no filters. You describe what you remember and it finds the photo.",
    metric: { value: "100/s", label: "images embedded per second, fully offline" },
    highlights: [
      {
        figure: "100/s",
        caption: "images embedded per second, fastest tier",
        text: "100, 49 and 32 images a second across three accuracy tiers, from 768-d at 224px up to SigLIP 2 at 1152-d and 384px, on a 6 GB RTX 3060. fp16 inference gave a 3× speedup, batch size scales to free VRAM, and a CUDA out of memory error recovers by splitting the batch.",
      },
      {
        figure: "1 batch",
        caption: "is all an interrupt costs",
        text: "Indexing is incremental and crash safe: SQLite WAL with per batch commits, change detection on path, size and mtime, and threaded JPEG decode overlapped with GPU encode across 10 formats including HEIC.",
      },
      {
        figure: "203",
        caption: "pytest tests, green in 13 seconds",
        text: "It ships as a tray resident FastAPI desktop app with 19 REST endpoints, a dependency free browser UI and an 11 command CLI.",
      },
    ],
    media: {
      kind: "image",
      src: "/projects/ctximg.jpg",
      alt: "ctximg's search screen: a large Describe a photo field above example searches such as a narrow street in the rain.",
      width: 1467,
      height: 812,
      tone: "dark",
    },
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The project after this one, wrapping to the first. */
export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

/* The statement on the home page. Words wrapped in *asterisks* are set in the
   serif italic. The three examples each point at the project they come from. */
export const statement = {
  lead: "I build web applications and machine learning systems, usually *end to end*, from the interface down to the model. Most of my time goes on things nobody notices *unless they break*.",
  examples: [
    { text: "Indexing that survives being interrupted without starting over.", slug: "ctximg" },
    { text: "Failover to a second model provider when the first one starts rate limiting.", slug: "prism" },
    { text: "A fact check that says it could not verify something instead of guessing.", slug: "prism" },
  ],
} as const;

/* The photograph set into "I take ... photographs." on the home page, by its
   Unsplash id (the last part of its unsplash.com/photos/ address). If it ever
   leaves the profile, the first landscape frame stands in. */
export const lensPhoto = "w3cuxkIR08s";

/* The measured section. Every value is from the resume. */
export type Bar = { label: string; value: number; display: string; muted?: boolean };

export type Benchmark =
  | {
      kind: "bars";
      id: string;
      slug: string;
      title: string;
      note: string;
      max: number;
      rows: { label: string; bars: Bar[] }[];
    }
  | {
      kind: "units";
      id: string;
      slug: string;
      title: string;
      note: string;
      total: number;
      filled: number;
      value: string;
    };

export const benchmarks: Benchmark[] = [
  {
    kind: "bars",
    id: "latency",
    slug: "conflict-detection",
    title: "Per frame latency",
    note: "Conflict detection, before and after gating the heavy stages. Milliseconds, lower is better.",
    max: 228,
    rows: [
      {
        label: "CPU",
        bars: [
          { label: "before", value: 228, display: "228 ms", muted: true },
          { label: "after", value: 104, display: "104 ms" },
        ],
      },
      {
        label: "GPU, RTX 3060",
        bars: [
          { label: "before", value: 59, display: "59 ms", muted: true },
          { label: "after", value: 26, display: "26 ms" },
        ],
      },
    ],
  },
  {
    kind: "units",
    id: "fact-checks",
    slug: "prism",
    title: "Fact checks",
    note: "Prism against 30 labelled claims. 28 correct, and neither miss was an incorrect verdict.",
    total: 30,
    filled: 28,
    value: "93.3%",
  },
  {
    kind: "bars",
    id: "throughput",
    slug: "ctximg",
    title: "Images embedded per second",
    note: "ctximg's three accuracy tiers on a 6 GB RTX 3060, timed by the app itself. Higher is better.",
    max: 100,
    rows: [
      { label: "768-d at 224px", bars: [{ label: "", value: 100, display: "100" }] },
      { label: "Middle tier", bars: [{ label: "", value: 49, display: "49" }] },
      { label: "SigLIP 2, 1152-d at 384px", bars: [{ label: "", value: 32, display: "32" }] },
    ],
  },
  {
    kind: "bars",
    id: "accuracy",
    slug: "conflict-detection",
    title: "Accuracy, before and after fixing the split",
    note: "The reported number came from a frame wise split that leaked 98.5 percent of validation clips into training. The honest one is per video, on 519 videos the model never saw.",
    max: 100,
    rows: [
      {
        label: "Reported",
        bars: [{ label: "leaked split", value: 98.4, display: "98.4%", muted: true }],
      },
      {
        label: "Honest",
        bars: [{ label: "per video", value: 74.8, display: "74.8%" }],
      },
    ],
  },
  {
    kind: "units",
    id: "concurrency",
    slug: "prism",
    title: "Concurrent analyses",
    note: "Prism held 18 of 18 simultaneous runs at HTTP 200 against a 15 requests a minute ceiling.",
    total: 18,
    filled: 18,
    value: "18/18",
  },
];

/* The Measured section on the home page: four figures set huge, and a line
   of smaller ones. `before` is where a figure started, struck through and
   shown again when you point at it. `mark` rings or underlines one word of
   the caption, as a proofreader would. Every value is from the resume. */
export type Figure = {
  value: string;
  unit?: string;
  before?: string;
  label: string;
  slug: string;
  mark?: { word: string; kind: "ring" | "underline" };
};

export const figures: { lead: Figure[]; more: { value: string; label: string }[] } = {
  lead: [
    {
      value: "104",
      unit: "ms",
      before: "228",
      label: "per frame on CPU, once the heavy stages waited behind a cheap one",
      slug: "conflict-detection",
    },
    {
      value: "93.3",
      unit: "%",
      label: "of fact checks correct, and none of them wrong",
      slug: "prism",
      mark: { word: "none", kind: "ring" },
    },
    {
      value: "100",
      unit: "/s",
      label: "images embedded a second, fully offline",
      slug: "ctximg",
      mark: { word: "offline", kind: "underline" },
    },
    {
      value: "74.8",
      unit: "%",
      before: "98.4",
      label: "per video, on 519 videos the model never saw. The 98.4 came from a leaky split",
      slug: "conflict-detection",
    },
  ],
  more: [
    { value: "18/18", label: "concurrent analyses at HTTP 200" },
    { value: "26 ms", label: "per frame on GPU, 38.4 FPS" },
    { value: "0.808", label: "PR-AUC on held out videos" },
    { value: "0.023", label: "calibration error, from 0.065" },
    { value: "203", label: "tests, green in 13 seconds" },
  ],
};

/* The CV facts, used by the sticker wall and written out for screen readers. */
export const cv = {
  education: {
    school: "Lovely Professional University",
    degree: "B.Tech, Computer Science Engineering",
    place: "Phagwara, Punjab",
    graduated: "Graduated July 2025",
    coursework: "Data structures and algorithms, operating systems, database management systems",
  },
  stack: [
    { label: "Languages", items: "C++, Python, JavaScript, TypeScript, SQL" },
    { label: "Frontend", items: "React, Next.js, Tailwind CSS, HTML, CSS" },
    {
      label: "Backend and data",
      items: "Node.js, Express, FastAPI, REST APIs, JWT auth, MongoDB, MySQL, SQLite",
    },
    {
      label: "AI and ML",
      items: "PyTorch, OpenCV, CLIP embeddings, computer vision, RAG, Gemini, Groq",
    },
    { label: "Tools", items: "Git, GitHub, Docker, Vercel, Postman, Linux" },
  ],
  problems: [
    { value: "700+", label: "problems solved across platforms" },
    { value: "300+", label: "of them on LeetCode" },
    { value: "1600+", label: "LeetCode contest rating" },
  ],
  volunteer: {
    role: "Web developer, Aurora",
    note: "Built and maintained the website of Aurora, a student organisation at LPU, for a year as a volunteer.",
  },
} as const;

/* The typing race. His pace is from keybr.com and is edited here by hand,
   because keybr has no public API. Prompts are lowercase with no punctuation
   so the race measures typing, not hunting for the shift key, and each is
   true of something on this site. */
export const typing = {
  wpm: 74.8,
  source: "keybr.com",
  prompts: [
    "the photographs on this site come straight from an unsplash profile so uploading a new one there is all it takes to change the page",
    "indexing a folder of photographs is incremental and crash safe so an interrupt costs one batch of work rather than the whole afternoon",
    "a fact check that cannot find two independent sources says it could not verify the claim instead of guessing at an answer",
    "the first model reported ninety eight percent accuracy and the honest number was lower because the split had leaked clips into training",
    "gating the heavy stages behind a cheap person detector and scoring every third frame made the pipeline more than twice as fast",
  ],
} as const;
