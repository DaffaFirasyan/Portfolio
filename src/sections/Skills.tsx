import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { skillCategories } from '@/data/skills';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { skillIcon } from '@/lib/skillIcon';
import LogoMarquee from '@/motion/LogoMarquee';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one category card arriving and the next. */
const STEP = 0.06;

export default function Skills() {
  const { activeSkill, setActive, clear } = useSkillHighlight();

  return (
    <SectionShell {...shellProps('skills')}>
      {/* overflow-hidden because the strip is wider than its column by design.
          It sits above the categorised chips rather than replacing them: the
          logos are recognised at a glance, the chips carry the detail and the
          cross-highlight. */}
      <div className="mb-12 overflow-hidden">
        <LogoMarquee />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* `fill` because each Reveal is the grid item here: without it the
            card inside cannot match the height of the others in its row. It is
            opt-in precisely because stacked Reveals must not claim height. */}
        {skillCategories.map((category, index) => (
          <Reveal key={category.id} delay={STEP * index} fill>
            <Surface className="h-full p-6">
              <h3 className="font-display text-lg font-bold text-primary">{category.name}</h3>

              {/* Rows, not wrapped pills. Pills of differing widths flowing
                  across a narrow column give a ragged right edge no amount of
                  spacing can tidy, and the longest name the data permits — 24
                  characters, which `Retrieval-Augmented LLMs` hits exactly —
                  wrapped *inside* its own pill, so one item in the set was two
                  lines tall and broke the rhythm outright. A single column
                  aligns every icon and every name, makes each row the same
                  height by construction, and hands the whole row width to the
                  hover target that drives the cross-highlight.

                  Still no percentage bars, and `level` stays unrendered: a
                  self-declared "Python — Advanced" invites exactly the
                  scepticism this section can least afford, and the projects
                  lighting up in the grid below are the evidence instead. */}
              <ul className="mt-4 space-y-0.5">
                {category.skills.map((skill) => {
                  const Icon = skillIcon(skill.icon);
                  // The cross-highlight this drives lands on Projects, which
                  // can be a full scroll away — nothing here previously said
                  // "yes, that registered" at the point of the hover itself.
                  const isActive = activeSkill === skill.name;

                  return (
                    <li key={skill.name}>
                      {/* A button, and an honest one: clicking gives it focus,
                          and focus is what keeps the related projects lit. That
                          also makes the whole thing reachable by keyboard rather
                          than hover only, which would hide it from anyone not
                          using a mouse. */}
                      <button
                        type="button"
                        onMouseEnter={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                        onFocus={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                        onMouseLeave={clear}
                        onBlur={clear}
                        className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors duration-150 ${
                          isActive ? 'bg-accent/10 text-primary' : 'text-muted'
                        }`}
                      >
                        {/* items-start, not items-center, so a name too long
                            for one line keeps its icon beside the *first* line
                            instead of drifting to the vertical middle and
                            breaking the icon column. mt-px optically centres it
                            on that line. shrink-0 so a long name squeezes the
                            text, never the icon — a half-width icon would undo
                            the alignment this layout exists for. */}
                        {Icon && <Icon aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />}
                        {skill.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Surface>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
