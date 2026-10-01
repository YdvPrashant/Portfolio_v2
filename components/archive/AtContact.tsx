import { CopyEmail } from "@/components/site/CopyEmail";
import { LikeButton } from "@/components/site/LikeButton";
import { person } from "@/lib/content";
import { AtGlyph } from "./AtGlyph";

/* The contact section as it was proposed beside the tear-off flyer on
   2 October 2026, kept at /archive/contact-at. The address reads across one
   screen with its @ as large as the screen allows and one of Prashant's
   photographs inside it, after Josef Müller-Brockmann's der Film (one thing
   huge, the rest small) and Armin Hofmann's theatre posters for Basel (a
   letterform as the picture). To put it back at the foot of every page,
   render it in place of Footer. */

export function AtContact({ photo }: { photo: { small: string; large: string } | null }) {
  const [user, domain] = person.email.split("@");

  return (
    <footer id="contact" data-theme="ink" className="at px-pad">
      <p className="t-m max-w-[30ch] text-muted">Email is the quickest way to reach me.</p>

      <a href={`mailto:${person.email}`} className="at-line" aria-label={`Email ${person.email}`}>
        <span className="at-part at-user" aria-hidden="true">
          {user}
        </span>
        <AtGlyph photo={photo} />
        <span className="at-part at-domain" aria-hidden="true">
          {domain}
        </span>
      </a>

      <div className="at-foot t-small">
        <CopyEmail email={person.email} />
        <a href={person.cv.href} download={person.cv.file} className="hit link-line font-[560]">
          Download CV
        </a>
        {person.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener me" className="hit link-line">
            {l.label} &#8599;
          </a>
        ))}
        <span className="ml-auto">
          <LikeButton />
        </span>
      </div>

      <div className="t-mono flex flex-wrap justify-between gap-x-8 gap-y-1 py-6 text-muted">
        <p>
          © {new Date().getFullYear()} {person.name}. {person.location}.
        </p>
        <p>Set in Mona Sans, Newsreader and JetBrains Mono.</p>
      </div>
    </footer>
  );
}
