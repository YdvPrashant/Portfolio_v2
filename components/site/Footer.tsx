import { LikeButton } from "./LikeButton";
import { TearTabs } from "./TearTabs";
import { contact, person } from "@/lib/content";

/* The contact section at the foot of every page, set as a flyer on a
   noticeboard: the address to read and the other ways to reach him above the
   perforation, and a fringe of tabs below it that each copy the address. The
   sheet is paper on the ink wall, so the slits between the tabs and the gaps
   where tabs were taken show the wall through. The sources are in
   docs/design.md. */

export function Footer() {
  return (
    <footer id="contact" data-theme="ink" className="flyer px-pad">
      <div className="flyer-sheet" data-theme="paper">
        <h2 className="flyer-title t-xxl">{contact.headline}</h2>
        <div className="flyer-body">
          <div className="flyer-main">
            <a href={`mailto:${person.email}`} className="flyer-address link-line">
              {person.email}
            </a>
            <p className="t-small mt-3 max-w-[44ch] text-muted">{contact.note}</p>
          </div>
          <ul className="flyer-ways t-m">
            <li>
              <a href={person.cv.href} download={person.cv.file}>
                CV <small>one page, PDF &#8595;</small>
              </a>
            </li>
            {person.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener me">
                  {l.label} <small>&#8599;</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TearTabs email={person.email} name={person.name}>
        <LikeButton />
      </TearTabs>

      <div className="t-mono flex flex-wrap justify-between gap-x-8 gap-y-1 pb-6 pt-3 text-muted">
        <p>
          © {new Date().getFullYear()} {person.name}. {person.location}.
        </p>
        <p>Set in Mona Sans, Newsreader and JetBrains Mono.</p>
      </div>
    </footer>
  );
}
