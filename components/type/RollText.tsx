/* Type that rolls over when pointed at.

   Each character is a window onto two copies of itself, one below the other.
   Hovering the parent, which must carry the `group` class, slides every column
   up by one copy, left to right on a small stagger, so the line turns over like
   a split flap board settling and comes up in the accent.

   Contact uses it for the address. Home's name answers the pointer with its
   weight; this answers it with motion instead, so the two ends of the site no
   longer do the same thing.

   CSS only. Each window is 1.5em tall so descenders are never clipped, and a
   negative margin gives the extra height back, so lines stack at 0.84em as the
   address always has. Renders aria-hidden; the caller supplies the accessible
   text. */

const STAGGER_MS = 14;

export default function RollText({ lines, className = "" }: { lines: readonly string[]; className?: string }) {
  // Where each line starts in the character count, so the stagger runs on across lines.
  const starts = lines.map((_, li) => lines.slice(0, li).reduce((n, line) => n + Array.from(line).length, 0));

  return (
    <span aria-hidden className="block">
      {lines.map((line, li) => (
        <span key={li} className={"flex " + className}>
          {Array.from(line).map((ch, i) => {
            const delay = { transitionDelay: (starts[li] + i) * STAGGER_MS + "ms" };
            return (
              <span
                key={i}
                className="relative -my-[0.33em] inline-block overflow-hidden whitespace-pre py-[0.25em] leading-none"
              >
                <span
                  className="block transition-transform duration-[560ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[1.5em]"
                  style={delay}
                >
                  {ch}
                </span>
                <span
                  className="absolute left-0 top-[1.75em] block text-accent transition-transform duration-[560ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[1.5em]"
                  style={delay}
                >
                  {ch}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
