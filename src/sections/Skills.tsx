import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';

/**
 * Every skill, every category, as a credits table: the category on the left,
 * the names running beside it, a hairline between rows.
 *
 * Each skill is still a button, because hovering or focusing one lights the
 * projects it appears in. That is information, not decoration, so it stays. The
 * state is carried by colour, weight and an underline, never by colour alone.
 */
export default function Skills() {
  const { skillCategories, sections } = useLanguage();
  const { activeSkill, setActive, clear } = useSkillHighlight();
  const shell = shellPropsFrom(sections, 'skills');

  return (
    <SectionShell {...shell}>
      <dl>
        {skillCategories.map((category) => (
          <div
            key={category.id}
            className="grid gap-3 border-b border-edge py-6 sm:grid-cols-[10rem_1fr] sm:gap-8"
          >
            <dt className="font-medium text-primary">{category.name}</dt>
            <dd>
              <ul className="flex flex-wrap gap-x-6 gap-y-1">
                {category.skills.map((skill) => {
                  const active = activeSkill === skill.name;
                  return (
                    <li key={skill.name}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                        onFocus={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                        onMouseLeave={clear}
                        onBlur={clear}
                        className={`inline-flex min-h-8 items-center text-base transition-colors ${
                          active
                            ? 'font-medium text-accent underline underline-offset-4'
                            : 'text-muted hover:text-primary'
                        }`}
                      >
                        {skill.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}
