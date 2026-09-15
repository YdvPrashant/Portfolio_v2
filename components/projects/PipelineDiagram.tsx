/* Art for the conflict detection project.

   Deliberately a diagram, not a fabricated screenshot. Mocking up bounding
   boxes over stock footage with "weapon detected" on them would be inventing
   results the system never produced, and a portfolio is exactly the wrong place
   for that. This draws the architecture instead, which is the interesting part
   anyway: the cheap stage runs on every scored frame and the two expensive ones
   only run when it fires.

   Pure SVG with no client JavaScript, so it scales to any plate and costs nothing
   to render. It has no background of its own and takes every colour from the
   page's tokens, so it sits on whichever plate holds it, on Projects or About. */

const MONO = "var(--font-geist-mono)";

const FRAMES = 27;

const STAGES = [
  { n: "01", name: "Person", model: "YOLOv8s", gated: false },
  { n: "02", name: "Conflict", model: "Swin-Tiny", gated: true },
  { n: "03", name: "Weapon", model: "YOLOv8", gated: true },
];

export default function PipelineDiagram() {
  return (
    <svg
      viewBox="0 0 800 560"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Diagram of the three stage cascade: person detection on every third frame, with conflict and weapon detection gated behind it"
    >
      <text x="48" y="62" fontSize="15" letterSpacing="3" style={{ fontFamily: MONO, fill: "var(--muted)" }}>
        1280 × 720 IN
      </text>

      {/* Incoming frames. Every third is scored, the rest are skipped. */}
      {Array.from({ length: FRAMES }).map((_, i) => {
        const scored = i % 3 === 0;
        return (
          <rect
            key={i}
            x={48 + i * 26}
            y={84}
            width={12}
            height={scored ? 46 : 30}
            style={{ fill: scored ? "var(--accent)" : "var(--muted)", opacity: scored ? 1 : 0.35 }}
          />
        );
      })}

      <text x="48" y="158" fontSize="14" letterSpacing="2" style={{ fontFamily: MONO, fill: "var(--muted)" }}>
        EVERY THIRD FRAME SCORED
      </text>

      {STAGES.map((s, i) => {
        const y = 208 + i * 104;
        const fg = s.gated ? "var(--ink)" : "var(--on-accent)";
        return (
          <g key={s.n}>
            {/* Solid for the stage that always runs, outlined for the two that
                only run when the one above it fires. */}
            <rect
              x="48"
              y={y}
              width="704"
              height="72"
              strokeWidth="1.5"
              style={{
                fill: s.gated ? "none" : "var(--accent)",
                stroke: s.gated ? "var(--ink)" : "var(--accent)",
                strokeOpacity: s.gated ? 0.4 : 1,
              }}
            />
            <text
              x="76"
              y={y + 44}
              fontSize="15"
              letterSpacing="3"
              style={{ fontFamily: MONO, fill: fg, opacity: s.gated ? 0.55 : 1 }}
            >
              {s.n}
            </text>
            <text
              x="132"
              y={y + 46}
              fontSize="30"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                fill: fg,
                opacity: s.gated ? 0.8 : 1,
              }}
            >
              {s.name}
            </text>
            <text
              x="724"
              y={y + 44}
              textAnchor="end"
              fontSize="15"
              letterSpacing="2"
              style={{ fontFamily: MONO, fill: fg, opacity: s.gated ? 0.55 : 0.75 }}
            >
              {s.model}
            </text>

            {i < STAGES.length - 1 ? (
              <>
                <line
                  x1="88"
                  y1={y + 72}
                  x2="88"
                  y2={y + 104}
                  strokeWidth="1.5"
                  style={{ stroke: "var(--ink)", strokeOpacity: 0.4 }}
                />
                <text
                  x="104"
                  y={y + 96}
                  fontSize="13"
                  letterSpacing="2"
                  style={{ fontFamily: MONO, fill: "var(--muted)" }}
                >
                  ONLY IF IT FIRES
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      <text x="48" y="540" fontSize="14" letterSpacing="2" style={{ fontFamily: MONO, fill: "var(--muted)" }}>
        DIAGRAM, NOT A SCREENSHOT
      </text>
    </svg>
  );
}
