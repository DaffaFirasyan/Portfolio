import { useMemo, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { projects } from '@/data/projects';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { ALL, categoriesOf, filterByCategory } from '@/lib/filter';
import Chip from '@/motion/Chip';

export default function Projects() {
  const { isDimmed } = useSkillHighlight();
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(() => categoriesOf(projects), []);
  const visible = useMemo(() => filterByCategory(projects, category), [category]);

  return (
    <SectionShell {...shellProps('projects')}>
      <ul className="mb-8 flex flex-wrap gap-2">
        {categories.map((name) => (
          <li key={name}>
            <button
              type="button"
              aria-pressed={name === category}
              onClick={() => setCategory(name)}
              className="rounded-full"
            >
              <Chip className={name === category ? 'border-accent text-accent' : undefined}>
                {name}
              </Chip>
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        // Never a blank area. An empty grid reads as a broken page rather than
        // as an answer, so it says what happened and offers the way back.
        <div className="rounded-xl border border-edge bg-surface p-8 text-center">
          <p className="text-muted">{`No projects in ${category} yet.`}</p>
          <button
            type="button"
            onClick={() => setCategory(ALL)}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-accent px-5 text-sm font-semibold text-accent"
          >
            Show all projects
          </button>
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          // Only opacity changes while a skill is active. Anything touching
          // size, margin or position would shift the grid under the reader's
          // cursor, which the design forbids outright.
          <article
            key={p.id}
            data-dimmed={isDimmed(p.id) ? 'true' : undefined}
            className={`rounded-xl border border-edge bg-surface p-5 transition-opacity duration-150 ${
              isDimmed(p.id) ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <img
              src={p.thumbnail}
              alt={`${p.title} preview`}
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              className="mb-4 w-full rounded-lg border border-edge"
            />
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${p.category} · ${p.year}`}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold break-words text-primary">
              {p.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{p.problem}</p>
            {p.outcome && <p className="mt-2 text-sm text-accent-2">{p.outcome}</p>}

            <ul className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-xs text-muted"
                >
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-4 text-sm">
              {p.links.repo && (
                <a
                  href={p.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Repository
                </a>
              )}
              {p.links.demo && (
                <a
                  href={p.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Live demo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      )}
    </SectionShell>
  );
}
