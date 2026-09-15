import Link from "next/link";
import { Fragment } from "react";

/* The About copy in lib/content.ts marks names [like this](key). This turns each
   mark into a link to where that thing lives on the site, and leaves any key it
   does not know as plain text. */

const HREFS: Record<string, string> = {
  prism: "/projects#prism",
  ctximg: "/projects#ctximg",
  conflict: "/projects#conflict",
  photos: "/work/photography",
};

const MARK = /\[([^\]]+)\]\(([a-z]+)\)/g;

export default function Marked({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const href = HREFS[m[2]];
    nodes.push(
      href ? (
        <Link
          href={href}
          transitionTypes={["nav-forward"]}
          className="underline decoration-muted decoration-1 underline-offset-[5px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
        >
          {m[1]}
        </Link>
      ) : (
        m[1]
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}
