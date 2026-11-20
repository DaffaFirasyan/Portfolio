import { useMemo, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import ProjectTile from '@/components/ui/ProjectTile';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { ALL, categoriesOf, filterByCategory } from '@/lib/filter';

/**
 * Projects as a list of entries, with the category filter as a row of words.
 *
 * Featured work leads when the filter is on All, because which project comes
 * first is a content decision made in `src/data/projects.ts` and featured
 * simply sorts ahead of the rest. Under any other filter the order is the
 * data's own.
 */
export default function Projects() {
  const { projects, sections, t } = useLanguage();
  const { isDimmed } = useSkillHighlight();
  const [category, setCategory] = useState(ALL);

  const shell = shellPropsFrom(sections, 'projects');
  const categories = useMemo(() => categoriesOf(projects), [projects]);
  const visible = useMemo(() => filterByCategory(projects, category), [projects, category]);
  const promoted = category === ALL;
  const ordered = useMemo(
    () => (promoted ? [...visible].sort((a, b) => Number(b.featured) - Number(a.featured)) : visible),
    [visible, promoted],
  );

  return (
    <SectionShell
      {...shell}
      aside={
        <div className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-y-0">
                {categories.map((name) => {
                  const selected = name === category;
                  const count =
                    name === ALL ? projects.length : projects.filter((p) => p.category === name).length;
        
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(name)}
                      className={`inline-flex min-h-9 items-center gap-1.5 text-sm transition-colors ${
                        selected
                          ? 'font-medium text-primary underline decoration-accent decoration-2 underline-offset-8'
                          : 'text-muted hover:text-primary'
                      }`}
                    >
                      {name === ALL ? t.all : name}
                      <span aria-hidden="true" className="tabular-nums text-muted">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
      }
    >
      {visible.length === 0 ? (
        <div>
          <p className="text-muted">{t.noProjectsYet(category)}</p>
          <button
            type="button"
            onClick={() => setCategory(ALL)}
            className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4"
          >
            {t.showAllProjects}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-edge">
          {ordered.map((project, index) => (
            <li key={project.id} className="py-8 first:pt-0 last:pb-0">
              <ProjectTile
                project={project}
                dimmed={isDimmed(project.id)}
                lead={promoted && index === 0}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
