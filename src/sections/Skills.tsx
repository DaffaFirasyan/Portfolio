import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { skillCategories } from '@/data/skills';
import Chip from '@/motion/Chip';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one category card arriving and the next. */
const STEP = 0.06;

export default function Skills() {
  return (
    <SectionShell {...shellProps('skills')}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((category, index) => (
          <Reveal key={category.id} delay={STEP * index}>
            <Surface className="h-full p-6">
              <h3 className="font-display text-lg font-bold text-primary">{category.name}</h3>

              {/* Still no percentage bars. Levels stay qualitative in the data
                  and unrendered — a made-up "Python 85%" is the kind of thing
                  an engineer reading this page discounts the section for. */}
              <ul className="mt-4 flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <li key={skill.name}>
                    <Chip>{skill.name}</Chip>
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
