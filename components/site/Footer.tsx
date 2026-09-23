import { CopyEmail } from "./CopyEmail";
import { EmailLink } from "./EmailLink";
import { HalftoneName } from "./HalftoneName";
import { LikeButton } from "./LikeButton";
import { person } from "@/lib/content";

export function Footer() {
  return (
    <footer id="contact" data-theme="ink" className="px-pad pt-[clamp(88px,14vh,180px)]">
      <p className="t-m max-w-[30ch] text-muted">
        Email is the quickest way to reach me.
      </p>

      <div className="mt-8">
        <EmailLink email={person.email} />
      </div>

      <div className="t-small mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-rule pt-6">
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

      <div className="mt-[clamp(64px,12vh,140px)]">
        <HalftoneName />
      </div>

      <div className="t-mono flex flex-wrap justify-between gap-x-8 gap-y-2 py-6 text-muted">
        <p>© {new Date().getFullYear()} {person.name}. {person.location}.</p>
        <p>Set in Mona Sans, Newsreader and JetBrains Mono.</p>
      </div>
    </footer>
  );
}
