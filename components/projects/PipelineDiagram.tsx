/* Art for the conflict detection panel.

   Deliberately a diagram, not a fabricated screenshot. Mocking up bounding
   boxes over stock footage with "weapon detected" on them would be inventing
   results the system never produced, and a portfolio is exactly the wrong place
   for that. This draws the architecture instead, which is the interesting part
   anyway: the cheap stage runs on every scored frame and the two expensive ones
   only run when it fires.

   Pure SVG with no client JavaScript, so it scales to any panel size and costs
   nothing to render. */

const BONE = "#f4f1e9";
const ACID = "#e9ff3d";
const DIM = "rgba(244,241,233,0.28)";
const INK = "#0b0b0b";

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
      <rect width="800" height="560" fill={INK} />

      <text x="48" y="62" fill={BONE} fontSize="15" letterSpacing="3" opacity="0.55" style={{ fontFamily: "var(--font-geist-mono)" }}>
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
            fill={scored ? ACID : DIM}
          />
        );
      })}

      <text x="48" y="158" fill={BONE} fontSize="14" letterSpacing="2" opacity="0.45" style={{ fontFamily: "var(--font-geist-mono)" }}>
        EVERY THIRD FRAME SCORED
      </text>

      {STAGES.map((s, i) => {
        const y = 208 + i * 104;
        return (
          <g key={s.n}>
            {/* Solid for the stage that always runs, outlined for the two that
                only run when the one above it fires. */}
            <rect
              x="48"
              y={y}
              width="704"
              height="72"
              fill={s.gated ? "none" : ACID}
              stroke={s.gated ? BONE : ACID}
              strokeOpacity={s.gated ? 0.5 : 1}
              strokeWidth="1.5"
            />
            <text x="76" y={y + 44} fill={s.gated ? BONE : INK} fontSize="15" letterSpacing="3" opacity={s.gated ? 0.5 : 1} style={{ fontFamily: "var(--font-geist-mono)" }}>
              {s.n}
            </text>
            <text x="132" y={y + 46} fill={s.gated ? BONE : INK} fontSize="30" style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              {s.name}
            </text>
            <text x="724" y={y + 44} textAnchor="end" fill={s.gated ? BONE : INK} fontSize="15" letterSpacing="2" opacity={s.gated ? 0.5 : 0.75} style={{ fontFamily: "var(--font-geist-mono)" }}>
              {s.model}
            </text>

            {i < STAGES.length - 1 ? (
              <>
                <line x1="88" y1={y + 72} x2="88" y2={y + 104} stroke={BONE} strokeOpacity="0.45" strokeWidth="1.5" />
                <text x="104" y={y + 96} fill={BONE} fontSize="13" letterSpacing="2" opacity="0.4" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  ONLY IF IT FIRES
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      <text x="48" y="540" fill={BONE} fontSize="14" letterSpacing="2" opacity="0.45" style={{ fontFamily: "var(--font-geist-mono)" }}>
        DIAGRAM, NOT A SCREENSHOT
      </text>
    </svg>
  );
}
