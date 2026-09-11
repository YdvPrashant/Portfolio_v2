// Single source of truth for site copy. Everything here comes from
// prashant-yadav-resume.tex so no page ever invents a fact.

export const person = {
  first: "Prashant",
  last: "Yadav",
  full: "Prashant Yadav",
  role: "Software engineer working across full-stack web and applied ML",
  shortRole: "Full-stack & applied ML",
  location: "Lucknow, Uttar Pradesh, India",
  email: "ydvprashant0508@gmail.com",
  linkedin: "https://linkedin.com/in/pr7nt/",
  github: "https://github.com/YdvPrashant",
  degree: "B.Tech Computer Science Engineering",
  school: "Lovely Professional University",
  graduated: "July 2025",
} as const;

export type NavItem = {
  n: string;
  label: string;
  href: string;
  note: string;
  ink: string;
  /** Foreground to use when `ink` is the ground. Chosen for contrast, not taste. */
  on: string;
};

export const CARBON = "#0e0e0e";
export const ULTRAMARINE = "#1400c8";

// Every page owns one colour. This is the spine of the whole system.
export const nav: NavItem[] = [
  { n: "01", label: "About", href: "/about", note: "Where the work comes from", ink: "#FF3B1F", on: "#FFFFFF" },
  { n: "02", label: "Skills", href: "/skills", note: "Twenty six tools, no adjectives", ink: "#00C08B", on: CARBON },
  { n: "03", label: "Projects", href: "/projects", note: "Three shipped, one live", ink: "#FFB100", on: CARBON },
  { n: "04", label: "DSA", href: "/dsa", note: "300 solved, 1600 rated", ink: "#7B2FF7", on: "#FFFFFF" },
  { n: "05", label: "Work", href: "/work", note: "Photography and graphic design", ink: "#00A3FF", on: CARBON },
  { n: "06", label: "Contact", href: "/contact", note: "Reply within a day", ink: "#E8005A", on: "#FFFFFF" },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  period: string;
  stack: string[];
  link: { label: string; href: string };
  summary: string;
  points: string[];
  metric: { value: string; label: string };
  ink: string;
};

export const projects: Project[] = [
  {
    id: "prism",
    index: "01",
    title: "Prism",
    kicker: "News transparency & bias analysis",
    period: "April 2026 to present",
    stack: ["Next.js", "TypeScript", "React", "Tailwind", "Node.js", "Gemini", "Groq", "RAG"],
    link: { label: "prismrefractor.in", href: "https://www.prismrefractor.in/" },
    summary:
      "Refracts any article URL, YouTube link or pasted text into a six stage analysis: sentence level claim, opinion and rhetoric classification, source provenance, live fact checking and coverage gaps.",
    points: [
      "Five API routes orchestrate four external APIs behind one provider agnostic call site.",
      "Fact checking measured at 93.3 percent, 28 of 30 labelled claims, with zero incorrect verdicts. Every decisive verdict has to carry resolved citations from two independent owner groups, and every downgrade path routes to unverified instead of an adverse ruling.",
      "Cut a full run to roughly 13 model requests and held 18 of 18 concurrent analyses at HTTP 200 after reverse engineering Google's undocumented 15 requests per minute ceiling from live 429 bodies, then adding Gemini to Groq failover, a four tier extraction fallback and an SSRF guard.",
    ],
    metric: { value: "93.3%", label: "fact check accuracy, zero incorrect verdicts" },
    ink: "#FFB100",
  },
  {
    id: "conflict",
    index: "02",
    title: "Conflict & Weapon Detection",
    kicker: "Real time cascaded vision pipeline",
    period: "March 2025 to September 2025",
    stack: ["Python", "PyTorch", "YOLOv8", "Swin Transformer", "OpenCV", "CUDA"],
    link: { label: "GitHub", href: "https://github.com/YdvPrashant/Ultimate_Conflict_Detection" },
    summary:
      "A three stage pipeline over live 1280 by 720 video: YOLOv8s person detection, a Swin Tiny conflict classifier, then a YOLOv8 weapon detector, with the heavy stages gated behind the cheap one.",
    points: [
      "Per frame latency cut 2.2 times, 228 to 104 ms on CPU and 59 to 26 ms on GPU at 38.4 FPS on an RTX 3060, by gating the heavy stages and scoring every third frame.",
      "Traced a reported 98.4 percent accuracy to a frame wise split that left 98.5 percent of validation clips inside training, then re established defensible baselines of PR-AUC 0.808 and 74.8 percent per video accuracy on 519 held out videos using StratifiedGroupKFold on source video and pruning 69,797 frames to 20,075.",
      "Set the threshold from the validation PR curve at 0.669 precision and 0.850 recall, cut calibration error from 0.065 to 0.023 with temperature scaling, and exposed 48.6 percent cross split contamination in the weapon dataset with perceptual hashing.",
    ],
    metric: { value: "2.2x", label: "faster per frame, and an honest baseline" },
    ink: "#FF3B1F",
  },
  {
    id: "ctximg",
    index: "03",
    title: "ctximg",
    kicker: "Contextual photo search for PC",
    period: "October 2025 to March 2026",
    stack: ["Python", "PyTorch", "OpenCLIP", "SigLIP 2", "FastAPI", "SQLite", "NumPy"],
    link: { label: "GitHub", href: "https://github.com/YdvPrashant/ctximg" },
    summary:
      "A fully offline photo search engine. Every image and every plain English query lands in one CLIP vector space and ranks by cosine similarity, with no tags, filenames or filters anywhere.",
    points: [
      "Ships as a tray resident FastAPI desktop app with 19 REST endpoints, a dependency free browser UI and an 11 command CLI.",
      "Reached 100, 49 and 32 images per second across three accuracy tiers, from 768-d at 224px up to SigLIP 2 1152-d at 384px, on a 6 GB RTX 3060, by moving inference to fp16 for a 3 times speedup, scaling batch size to available VRAM and recovering from CUDA OOM through recursive batch splitting.",
      "Indexing is incremental and crash safe, so an interrupt costs one batch instead of a full re embed. SQLite WAL with per batch commits, path, size and mtime change detection, threaded JPEG decode overlapped with GPU encode across 10 formats including HEIC. Covered by 203 pytest tests, green in 13 seconds.",
    ],
    metric: { value: "100/s", label: "images embedded per second, fully offline" },
    ink: "#00C08B",
  },
];

export const skillGroups = [
  { title: "Languages", items: ["C++", "Python", "JavaScript", "TypeScript", "SQL"] },
  { title: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"] },
  {
    title: "Backend & Databases",
    items: ["Node.js", "Express", "FastAPI", "REST APIs", "JWT Auth", "MongoDB", "MySQL", "SQLite"],
  },
  {
    title: "AI & ML",
    items: ["PyTorch", "OpenCV", "CLIP Embeddings", "Computer Vision", "RAG", "Gemini", "Groq"],
  },
  { title: "Tools", items: ["Git", "GitHub", "Docker", "Vercel", "Postman", "Linux"] },
] as const;

/* His typing speed, from keybr.com. Stored here rather than fetched: keybr has
   no public API, its public profiles are keyed by opaque generated ids rather
   than usernames, and the numbers on them load client side from /_/ paths that
   its robots.txt disallows. Edit this when it changes.

   Prompts are lowercase with no punctuation, so the test measures typing rather
   than how fast someone finds the shift and comma keys. Each is over twenty two
   words, long enough that a lucky burst does not decide the result. */
export const typing = {
  wpm: 74.8,
  source: "keybr.com",
  prompts: [
    "every page on this site was built by hand with no component library and no animation framework and no design system to fall back on",
    "the photographs on this site come from an unsplash profile rather than from files in the repository so uploading a new one is all it takes",
    "a sorting algorithm looks completely different when you watch it run instead of reading about it in a book that is full of diagrams and proofs",
    "indexing a folder of photographs is incremental and crash safe so an interrupt costs one batch of work rather than the whole afternoon",
    "there is a field of bars on another page that sorts itself forever and then shuffles and starts again with a different algorithm each time",
  ],
} as const;

/* The LeetCode figures are from the resume. The combined total is his, given
   2026-09-11: 300+ of the 700+ are on LeetCode, so the two are not additive. */
export const dsa = {
  total: "700+",
  solved: "300+",
  rating: "1600+",
  platform: "LeetCode",
} as const;

/* About copy. Plain and first person, no aphorisms: the story of catching his
   own bad number does the work, and stating the moral afterwards is what made
   the first draft read as cheesy. Every claim traces to the resume.

   `facts` and `body` deliberately do not overlap. The degree, the LeetCode
   figures and Aurora live only in the fact column; the prose stays narrative.
   The voice is still a draft of his and is his to rewrite. */
export const about = {
  lead: "I'm Prashant, a software engineer in Lucknow. I build web applications and machine learning systems, usually end to end, from the interface down to the model.",
  facts: [
    { label: "Based", value: "Lucknow, Uttar Pradesh, India" },
    {
      label: "Education",
      value: "B.Tech Computer Science Engineering, Lovely Professional University, 2025",
    },
    { label: "LeetCode", value: "300+ problems solved, contest rating above 1600" },
    { label: "Volunteer", value: "Web developer for Aurora, a student organisation, for a year" },
  ],
  body: [
    "Lately that has meant Prism, which takes a news article and pulls it apart into claims, sources and live fact checks, and ctximg, a photo search app that runs completely offline. You describe what you remember about a photo and it finds it, with no tags or filenames involved.",
    "Before those I spent about six months on a conflict detection system for video. It reported 98.4 percent accuracy and I did not believe it. The split was the problem. I had divided the data frame by frame, so almost every clip I was testing on had already been seen in training. I redid the split by source video, dropped the near duplicate frames, and the honest number came out at 0.808 PR-AUC across 519 videos the model had never seen.",
    "Most of my time goes on things nobody notices unless they break. Indexing that survives being interrupted without starting over. Failover to a second model provider when the first one starts rate limiting. A fact check that says it could not verify something instead of guessing.",
    "Outside of code I shoot photographs and do graphic design. Both are on this site.",
  ],
} as const;

export const achievements = [
  {
    title: "Competitive programming",
    body: "LeetCode 300+ problems solved, contest rating 1600+.",
  },
  {
    title: "Web developer, Aurora",
    body: "Built and maintained an LPU student organisation's website for a year, as a volunteer.",
  },
] as const;
