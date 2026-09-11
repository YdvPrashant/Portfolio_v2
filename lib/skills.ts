import {
  siCplusplus,
  siPython,
  siJavascript,
  siTypescript,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siHtml5,
  siCss,
  siNodedotjs,
  siExpress,
  siFastapi,
  siJsonwebtokens,
  siMongodb,
  siMysql,
  siSqlite,
  siPytorch,
  siOpencv,
  siGooglegemini,
  siGit,
  siGithub,
  siDocker,
  siVercel,
  siPostman,
  siLinux,
} from "simple-icons";

/* Skills, from the resume's technical list.

   Names are written out here rather than taken from each icon's own title,
   because the icon titles are brand strings and a few of them are not what you
   would call the thing in conversation.

   Everything in the resume that has no logo lives in `concepts` instead of
   being given a fake one. SQL, REST APIs, computer vision, CLIP embeddings and
   RAG are techniques rather than products, and Groq has no icon in the set. A
   made up badge for each would be four more boxes saying nothing. */

export type Logo = { name: string; path: string };

export type SkillRow = { label: string; items: Logo[] };

const logo = (icon: { path: string }, name: string): Logo => ({ name, path: icon.path });

export const skillRows: SkillRow[] = [
  {
    label: "Languages",
    items: [
      logo(siCplusplus, "C++"),
      logo(siPython, "Python"),
      logo(siJavascript, "JavaScript"),
      logo(siTypescript, "TypeScript"),
    ],
  },
  {
    label: "Frontend",
    items: [
      logo(siReact, "React"),
      logo(siNextdotjs, "Next.js"),
      logo(siTailwindcss, "Tailwind CSS"),
      logo(siHtml5, "HTML"),
      logo(siCss, "CSS"),
    ],
  },
  {
    label: "Backend & data",
    items: [
      logo(siNodedotjs, "Node.js"),
      logo(siExpress, "Express"),
      logo(siFastapi, "FastAPI"),
      logo(siJsonwebtokens, "JWT auth"),
      logo(siMongodb, "MongoDB"),
      logo(siMysql, "MySQL"),
      logo(siSqlite, "SQLite"),
    ],
  },
  {
    label: "AI & ML",
    items: [logo(siPytorch, "PyTorch"), logo(siOpencv, "OpenCV"), logo(siGooglegemini, "Gemini")],
  },
  {
    label: "Tools",
    items: [
      logo(siGit, "Git"),
      logo(siGithub, "GitHub"),
      logo(siDocker, "Docker"),
      logo(siVercel, "Vercel"),
      logo(siPostman, "Postman"),
      logo(siLinux, "Linux"),
    ],
  },
];

export const concepts = [
  "SQL",
  "REST APIs",
  "Computer vision",
  "CLIP embeddings",
  "RAG",
  "Groq",
];

export const disciplines = [
  {
    name: "Photography",
    note: "Shot on my own time, not for clients",
    href: "/work/photography",
  },
  {
    name: "Graphic design",
    note: "Posters, type and composition, mostly in Photoshop",
    href: "/work/design",
  },
];
