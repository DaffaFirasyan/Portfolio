import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { skillCategories } from '@/data/skills';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import Chip from '@/motion/Chip';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one category card arriving and the next. */
const STEP = 0.06;

export default function Skills() {
  const { setActive, clear } = useSkillHighlight();

  return (
    <SectionShell {...shellProps('skills')}>
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
                {category.skills.map((skill) => (
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
                      <Chip>{skill.name}</Chip>
                    </button>
                  </li>
                ))}
              </ul>
            </Surface>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
