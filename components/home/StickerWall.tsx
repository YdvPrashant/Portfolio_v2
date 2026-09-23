import Link from "next/link";
import { cv, person, typing } from "@/lib/content";
import { stickers, type FactKind, type Place, type Sticker } from "@/lib/stickers";
import { StickerSurface } from "./StickerSurface";

/* The CV as a sheet of stickers (after the WC26 Player Album, an Awwwards
   Honorable Mention, Dave Holloway's tags you can grab, and Lando Norris's
   scattered collage). Seven large stickers carry the facts and the small ones
   the stack.

   They are printed the way the rest of the site is: flat, in its own inks
   (black, white, electric blue and the three process colours), with a white
   die-cut edge and a thin black cut line, and no shadow until one is lifted.
   PRISM is set in the same striped, misregistered inks as the name at the top
   of the page, and the rating burst carries the footer's halftone.

   Point at a sticker to lift it, drag it anywhere, or press Tidy up. The
   stickers are drawn here on the server; StickerSurface only handles the
   pointer. */

const INK = "#0f0f0f";
const WHITE = "#fbfbf8";

function placeVars(s: Sticker, i: number, h?: { wide: number; tall: number }) {
  const v = (p: Place, prefix: "w" | "t") => ({
    [`--${prefix}x`]: `${p.x}%`,
    [`--${prefix}y`]: `${p.y}%`,
    [`--${prefix}w`]: p.w,
    [`--${prefix}r`]: `${p.r}deg`,
  });
  return {
    ...v(s.wide, "w"),
    ...v(s.tall, "t"),
    "--i": i,
    ...(h ? { "--wh": h.wide, "--th": h.tall } : {}),
  } as React.CSSProperties;
}

/* A 24 point burst for the rating sticker. */
const BURST = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 43 : 49;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

function Misregistered({ text }: { text: string }) {
  return (
    <span className="misreg">
      <span className="mr mr-c" aria-hidden="true">
        {text}
      </span>
      <span className="mr mr-m" aria-hidden="true">
        {text}
      </span>
      <span className="mr mr-y" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

function Fact({ id }: { id: FactKind }) {
  switch (id) {
    case "seal":
      return (
        <svg viewBox="0 0 200 200" className="block h-full w-full" aria-hidden="true">
          <defs>
            <path id="seal-arc" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0" />
          </defs>
          <circle cx="100" cy="100" r="99" fill={WHITE} stroke={INK} strokeWidth="1.2" />
          <circle cx="100" cy="100" r="92" fill="#2b2bff" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#f0efeb" strokeWidth="1.2" />
          <text fill="#f0efeb" fontSize="12.5" fontWeight="600" letterSpacing="1" style={{ fontFamily: "var(--font-mono)" }}>
            <textPath href="#seal-arc" textLength="466" lengthAdjust="spacing">
              LOVELY PROFESSIONAL UNIVERSITY · PHAGWARA · 2025 ·
            </textPath>
          </text>
          <text x="100" y="101" textAnchor="middle" fill="#f0efeb" fontSize="35" fontWeight="820" style={{ fontFamily: "var(--font-mona)", fontStretch: "75%" }}>
            B.TECH
          </text>
          <text x="100" y="127" textAnchor="middle" fill="#f0efeb" fontSize="15" fontWeight="600" letterSpacing="3" style={{ fontFamily: "var(--font-mono)" }}>
            CSE
          </text>
        </svg>
      );
    case "holo":
      return (
        <div className="relative h-full w-full">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="halftone" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
                <circle cx="1.6" cy="1.6" r="0.62" fill={INK} fillOpacity="0.16" />
              </pattern>
            </defs>
            <polygon points={BURST} fill={WHITE} stroke={INK} strokeWidth="0.6" strokeLinejoin="round" />
            <polygon points={BURST} fill="#ffe600" transform="translate(50 50) scale(0.9) translate(-50 -50)" />
            <polygon points={BURST} fill="url(#halftone)" transform="translate(50 50) scale(0.9) translate(-50 -50)" />
          </svg>
          <div className="sticker-text absolute inset-0 flex flex-col items-center justify-center text-[#0f0f0f]">
            <span className="st-xs">LEETCODE</span>
            <span className="st-num">1600+</span>
            <span className="st-xs">CONTEST RATING</span>
          </div>
        </div>
      );
    case "block":
      return (
        <div className="die h-full w-full bg-[#0f0f0f] text-[#f0efeb]">
          <div className="sticker-text flex h-full flex-col justify-between p-[calc(var(--sw)*0.06)]">
            <span className="st-xs">PROBLEMS SOLVED</span>
            <span className="st-num text-[#ffe600]">700+</span>
            <span className="st-xs">300+ OF THEM ON LEETCODE</span>
          </div>
        </div>
      );
    case "keycap":
      return (
        <svg viewBox="0 0 100 100" className="block h-full w-full" aria-hidden="true">
          <rect x="0.6" y="0.6" width="98.8" height="98.8" rx="17" fill={WHITE} stroke={INK} strokeWidth="0.9" />
          <rect x="8" y="8" width="84" height="84" rx="12" fill={WHITE} stroke={INK} strokeWidth="2" />
          <rect x="16" y="12" width="68" height="64" rx="9" fill="none" stroke={INK} strokeWidth="1.4" />
          <path d="M8 8 L16 12 M92 8 L84 12 M8 92 L16 76 M92 92 L84 76" stroke={INK} strokeWidth="1.2" />
          <text x="50" y="52" textAnchor="middle" fill={INK} fontSize="26" fontWeight="820" style={{ fontFamily: "var(--font-mona)", fontStretch: "75%" }}>
            74.8
          </text>
          <text x="21" y="70" fill={INK} fontSize="7.5" fontWeight="600" style={{ fontFamily: "var(--font-mono)" }}>
            WPM
          </text>
          <text x="79" y="70" textAnchor="end" fill={INK} fillOpacity="0.6" fontSize="7.5" fontWeight="600" style={{ fontFamily: "var(--font-mono)" }}>
            KEYBR
          </text>
        </svg>
      );
    case "stamp":
      return (
        <div className="stamp h-full w-full">
          <div className="sticker-text flex h-full flex-col justify-between bg-[#00a0e9] p-[calc(var(--sw)*0.08)] text-[#0f0f0f] outline outline-1 -outline-offset-[calc(var(--sw)*0.045)] outline-[#0f0f0f]">
            <span className="st-xs">BASED IN</span>
            <span className="st-word">LUCKNOW</span>
            <span className="st-xs">UTTAR PRADESH, INDIA</span>
          </div>
        </div>
      );
    case "pill":
      return (
        <div className="die flex h-full w-full items-center rounded-full bg-[#e4007f] px-[calc(var(--sw)*0.08)] text-[#fbfbf8]">
          <div className="sticker-text flex flex-col">
            <span className="st-line">WEB DEVELOPER, AURORA</span>
            <span className="st-xs">A YEAR AS A VOLUNTEER AT LPU</span>
          </div>
        </div>
      );
    case "prism":
      return (
        <Link
          href="/work/prism"
          transitionTypes={["nav-forward"]}
          className="die block h-full w-full bg-[#fbfbf8] text-[#0f0f0f]"
          aria-label="Now building Prism, which is live. Read the case study"
          draggable={false}
        >
          <span className="sticker-text flex h-full flex-col justify-between p-[calc(var(--sw)*0.05)]">
            <span className="st-xs">NOW BUILDING</span>
            <span className="st-num">
              <Misregistered text="PRISM" />
            </span>
            <span className="st-xs flex items-center gap-[0.6em]">
              <span className="live-dot" aria-hidden="true" /> LIVE AT PRISMREFRACTOR.IN &#8599;
            </span>
          </span>
        </Link>
      );
  }
}

function Logo({ s }: { s: Extract<Sticker, { kind: "logo" }> }) {
  return (
    <div
      className={`die flex h-full w-full items-center justify-center ${s.round ? "rounded-full" : ""}`}
      style={{ background: s.ink.fill }}
      title={s.name}
    >
      <svg viewBox="0 0 24 24" className="h-[50%] w-[50%]" aria-hidden="true">
        <path d={s.path} fill={s.ink.on} />
      </svg>
    </div>
  );
}

const WORD_TONES = ["bg-[#0f0f0f] text-[#f0efeb]", "bg-[#2b2bff] text-[#f0efeb]", "bg-[#ffe600] text-[#0f0f0f]"];

export function StickerWall() {
  return (
    // Clipped sideways: Chrome keeps the page width from mid-slap, when edge
    // stickers were still scaled up, so a phone could scroll sideways after.
    <section
      id="cv"
      data-theme="paper"
      aria-labelledby="cv-title"
      className="overflow-x-clip px-pad py-[clamp(88px,14vh,180px)]"
    >
      <div className="mb-[clamp(28px,5vh,56px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <h2 id="cv-title" className="t-xxl">
          CV
        </h2>
        <a href={person.cv.href} download={person.cv.file} className="t-m link-line hit mb-2 font-[520]">
          Download the PDF &darr;
        </a>
      </div>

      <StickerSurface>
        {stickers.map((s, i) => {
          if (s.kind === "fact") {
            return (
              <div key={s.id} data-sticker data-kind="fact" data-fact={s.id} className="sticker" style={placeVars(s, i, s.h)}>
                <Fact id={s.id} />
              </div>
            );
          }
          if (s.kind === "logo") {
            return (
              <div key={s.id} data-sticker data-kind="logo" className="sticker sticker-small" style={placeVars(s, i)}>
                <Logo s={s} />
              </div>
            );
          }
          return (
            <div key={s.id} data-sticker data-kind="word" className="sticker sticker-word" style={placeVars(s, i)}>
              <span className={`die st-mono block whitespace-nowrap rounded-full ${WORD_TONES[s.tone]}`}>{s.text}</span>
            </div>
          );
        })}
      </StickerSurface>

      <div className="sr-only">
        <h3>Education</h3>
        <p>
          {cv.education.degree}, {cv.education.school}, {cv.education.place}. {cv.education.graduated}.
          Coursework: {cv.education.coursework}.
        </p>
        <h3>Problem solving</h3>
        <ul>
          {cv.problems.map((p) => (
            <li key={p.label}>
              {p.value} {p.label}
            </li>
          ))}
          <li>
            Typing: {typing.wpm} words a minute on {typing.source}
          </li>
        </ul>
        <h3>Stack</h3>
        <ul>
          {cv.stack.map((s) => (
            <li key={s.label}>
              {s.label}: {s.items}
            </li>
          ))}
        </ul>
        <h3>Volunteer</h3>
        <p>
          {cv.volunteer.role}. {cv.volunteer.note}
        </p>
        <h3>Now</h3>
        <p>Building Prism, which is live at prismrefractor.in. Based in {person.location}.</p>
      </div>
    </section>
  );
}
