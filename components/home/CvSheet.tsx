import { cv, person, typing } from "@/lib/content";

/* The CV as a data sheet: dense columns set in mono (after Elliott Mangham's
   and Gil Huybrecht's information grids). The full PDF is one click away. */

function Column({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-t border-rule pt-4 ${className}`}>
      <h3 className="t-small mb-4 font-[620]">{title}</h3>
      <div className="t-mono grid gap-3 text-[0.8rem] leading-[1.55]">{children}</div>
    </div>
  );
}

export function CvSheet() {
  return (
    <section
      id="cv"
      data-theme="paper"
      aria-labelledby="cv-title"
      className="px-pad py-[clamp(88px,14vh,180px)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <h2 id="cv-title" className="t-xxl">
          CV
        </h2>
        <a
          href={person.cv.href}
          download={person.cv.file}
          className="t-m link-line hit mb-2 font-[520]"
        >
          Download the PDF &darr;
        </a>
      </div>

      <div className="mt-[clamp(40px,7vh,80px)] grid gap-x-[var(--gap)] gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
        <Column title="Education" className="lg:col-span-3">
          <p>
            {cv.education.school}
            <br />
            {cv.education.degree}
            <br />
            <span className="text-muted">{cv.education.place}</span>
          </p>
          <p>{cv.education.graduated}</p>
          <p className="text-muted">Coursework: {cv.education.coursework}.</p>
        </Column>

        <Column title="Stack" className="lg:col-span-4">
          {cv.stack.map((s) => (
            <p key={s.label}>
              <span className="text-muted">{s.label}: </span>
              {s.items}
            </p>
          ))}
        </Column>

        <Column title="Problem solving" className="lg:col-span-2">
          {cv.problems.map((p) => (
            <p key={p.label}>
              <span className="font-[700]">{p.value}</span> <span className="text-muted">{p.label}</span>
            </p>
          ))}
          <p>
            <span className="font-[700]">{typing.wpm}</span>{" "}
            <span className="text-muted">wpm typing, on {typing.source}</span>
          </p>
        </Column>

        <Column title="Volunteer" className="lg:col-span-3">
          <p>{cv.volunteer.role}</p>
          <p className="text-muted">{cv.volunteer.note}</p>
        </Column>
      </div>
    </section>
  );
}
