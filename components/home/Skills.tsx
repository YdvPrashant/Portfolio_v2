import { dsa, otherSkills, projects, skills, type Skill } from "@/lib/content";
import { SkillThreads } from "./SkillThreads";

/* Skills: web on the left, machine learning on the right, the projects
   between them, and a fine line for every skill a project was built with. It
   draws the intro's own line, full-stack web and applied machine learning,
   with the projects bridging the two halves.

   The words are set here on the server. SkillThreads draws the lines from
   wherever the words land, lets them draw out as the section scrolls in, and
   handles pointing. Screen readers get the same facts as a sentence after
   each skill. */

const contexts = [
  ...projects.map((p) => ({ slug: p.slug, index: p.index, name: p.title })),
  { slug: dsa.slug, index: "", name: dsa.name },
];
const nameOf = new Map(contexts.map((c) => [c.slug, c.name]));

/** "Prism", "Prism and ctximg", "Prism, Conflict & Weapon Detection and ctximg". */
function list(names: string[]) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function SkillItem({ skill }: { skill: Skill }) {
  return (
    <li className="threads-skill" data-skill={skill.name} data-used-in={skill.usedIn.join(" ")}>
      <span data-name>{skill.name}</span>
      <span className="sr-only"> Used in {list(skill.usedIn.map((slug) => nameOf.get(slug) ?? slug))}.</span>
    </li>
  );
}

export function Skills() {
  const side = (s: Skill["side"]) => skills.filter((skill) => skill.side === s);

  return (
    <section
      id="skills"
      data-theme="paper"
      aria-labelledby="skills-title"
      className="overflow-x-clip px-pad py-[clamp(88px,14vh,180px)]"
    >
      <div className="grid grid-cols-12 items-end gap-x-[var(--gap)]">
        <h2 id="skills-title" className="t-xxl col-span-12 lg:col-span-7">
          Skills
        </h2>
        <p className="t-m col-span-12 mt-5 max-w-[28ch] text-muted lg:col-span-4 lg:col-start-9 lg:mt-0 lg:pb-[0.35em]">
          Each line joins a project to something it was built with.{" "}
          <span className="pointer-coarse:hidden">Point at either end to follow it.</span>
          <span className="hidden pointer-coarse:inline">Tap either end to follow it.</span>
        </p>
      </div>

      <SkillThreads>
        <div className="threads-web">
          <h3 className="threads-label t-mono">web</h3>
          <ul>
            {side("web").map((s) => (
              <SkillItem key={s.name} skill={s} />
            ))}
          </ul>
        </div>

        <ul className="threads-projects" aria-label="Projects">
          {contexts.map((c) => (
            <li key={c.slug}>
              <button type="button" className="threads-project" data-project={c.slug}>
                {c.index && <span className="num">{c.index}</span>}
                <span className="nm">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="threads-ml">
          <h3 className="threads-label t-mono">machine learning</h3>
          <ul>
            {side("ml").map((s) => (
              <SkillItem key={s.name} skill={s} />
            ))}
          </ul>
        </div>

        <div className="threads-cpp">
          <ul>
            {side("dsa").map((s) => (
              <SkillItem key={s.name} skill={s} />
            ))}
          </ul>
          <p className="t-small mt-2.5 text-muted">{dsa.note}</p>
        </div>
      </SkillThreads>

      <p className="t-small mt-[clamp(48px,7vh,88px)] border-t border-rule pt-4 text-muted">
        <span className="font-[560] text-fg">Also</span>&nbsp; {otherSkills.join(", ")}
      </p>
    </section>
  );
}
