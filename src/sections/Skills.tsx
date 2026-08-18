import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { skillCategories } from '@/data/skills';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { skillIcon } from '@/lib/skillIcon';
import Chip from '@/motion/Chip';
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

              {/* Still no percentage bars. Levels stay qualitative in the data
                  and unrendered — a made-up "Python 85%" is the kind of thing
                  an engineer reading this page discounts the section for. */}
              <ul className="mt-4 flex flex-wrap gap-2">
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
                        className="rounded-full"
                      >
                        {/* bg-accent/15 rather than a border or text-colour
                            override: Chip's base classes already set
                            border-edge and text-muted, and a second utility
                            for the same property is a coin flip on which one
                            wins — Tailwind resolves same-specificity classes
                            by their order in the generated stylesheet, not by
                            position in this string. Background has no such
                            competitor, so it is the one property that is safe
                            to add from outside. */}
                        <Chip
                          className={`transition-colors duration-150 ${isActive ? 'bg-accent/15' : ''}`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5" />}
                            {skill.name}
                          </span>
                        </Chip>
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
