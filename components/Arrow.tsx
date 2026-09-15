/* Drawn rather than typed, so it has the same weight at every size and does not
   depend on which face happens to carry an arrow glyph. `turn` is in degrees:
   180 points back, -45 points out of the site. */
export default function Arrow({ className = "", turn = 0 }: { className?: string; turn?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      style={turn ? { rotate: turn + "deg" } : undefined}
    >
      <path d="M3.5 12h16M13.5 5.5 20 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}
