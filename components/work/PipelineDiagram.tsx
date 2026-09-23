/* The conflict detection pipeline has no interface to screenshot, so it is
   drawn instead, and labelled as a diagram. Every figure on it is from the
   resume: three cascaded stages over 1280 by 720 video, the heavy stages gated
   behind the cheap person detector, every third frame scored. */

type Props = { className?: string; title: string };

export function PipelineDiagram({ className, title }: Props) {
  const box = { w: 300, h: 150 };
  const y = 250;
  const stages = [
    { x: 330, name: "YOLOv8s", role: "finds people", note: "cheap, runs first" },
    { x: 770, name: "Swin Tiny", role: "scores conflict", note: "heavy, gated" },
    { x: 1210, name: "YOLOv8", role: "looks for weapons", note: "heavy, gated" },
  ];

  return (
    <svg
      viewBox="0 0 1560 640"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* incoming video: three offset frames */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={40 + i * 22}
          y={y + 10 - i * 22}
          width={170}
          height={96}
          fill="var(--bg)"
          opacity={1 - i * 0.2}
        />
      ))}
      <text x={40} y={y + 160} fill="currentColor" stroke="none" fontSize={22}>
        1280 × 720 video
      </text>
      <text x={40} y={y + 192} fill="var(--muted)" stroke="none" fontSize={20}>
        every third frame
      </text>

      {/* the three stages */}
      {stages.map((s, i) => (
        <g key={s.name}>
          <rect
            x={s.x}
            y={y - 12}
            width={box.w}
            height={box.h}
            stroke={i === 0 ? "currentColor" : "var(--accent)"}
          />
          <text x={s.x + 24} y={y + 38} fill="currentColor" stroke="none" fontSize={30} fontWeight={600}>
            {s.name}
          </text>
          <text x={s.x + 24} y={y + 76} fill="currentColor" stroke="none" fontSize={22}>
            {s.role}
          </text>
          <text x={s.x + 24} y={y + 112} fill="var(--muted)" stroke="none" fontSize={20}>
            {s.note}
          </text>
        </g>
      ))}

      {/* arrows between stages */}
      {[
        [250, 330],
        [630, 770],
        [1070, 1210],
      ].map(([a, b], i) => (
        <g key={i}>
          <line x1={a} y1={y + 63} x2={b - 6} y2={y + 63} />
          <path d={`M${b - 18} ${y + 53} L${b - 4} ${y + 63} L${b - 18} ${y + 73}`} />
        </g>
      ))}

      {/* the gate: frames without people stop here */}
      <path d={`M700 ${y + 63} L700 ${y + 250}`} strokeDasharray="6 8" />
      <text x={716} y={y + 214} fill="var(--muted)" stroke="none" fontSize={20}>
        no people: the heavy
      </text>
      <text x={716} y={y + 242} fill="var(--muted)" stroke="none" fontSize={20}>
        stages never run
      </text>

      {/* result */}
      <text x={40} y={80} fill="currentColor" stroke="none" fontSize={22}>
        Per frame: 228 → 104 ms on CPU, 59 → 26 ms on GPU
      </text>
      <text x={40} y={116} fill="var(--muted)" stroke="none" fontSize={20}>
        38.4 FPS on an RTX 3060
      </text>
      <text x={1520} y={620} fill="var(--muted)" stroke="none" fontSize={18} textAnchor="end">
        Diagram, not a screenshot
      </text>
    </svg>
  );
}
