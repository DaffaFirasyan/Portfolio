import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { skillCategories } from '@/data/skills';

export default function Skills() {
  return (
    <SectionShell {...shellProps('skills')}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((category) => (
          <div key={category.id} className="rounded-xl border border-edge bg-surface p-6">
            <h3 className="font-display text-lg font-bold text-primary">{category.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="rounded-full border border-edge px-3 py-1 text-sm text-muted"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
