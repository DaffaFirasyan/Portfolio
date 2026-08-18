import { useMemo, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { projects } from '@/data/projects';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import type { Project } from '@/types';
import { ALL, categoriesOf, filterByCategory } from '@/lib/filter';
import Chip from '@/motion/Chip';
import Dialog from '@/motion/Dialog';

export default function Projects() {
  const { isDimmed } = useSkillHighlight();
  const [category, setCategory] = useState(ALL);
  const [selected, setSelected] = useState<Project | null>(null);

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
            {/* The title is both the heading and the control. Making the whole
                card a button is not an option — it contains links, and a button
                containing links is invalid. */}
            <h3 className="mt-2 font-display text-lg font-bold break-words text-primary">
              <button type="button" onClick={() => setSelected(p)} className="text-left">
                {p.title}
              </button>
            </h3>
            <p className="mt-2 text-sm text-muted">{p.problem}</p>
            {p.outcome && <p className="mt-2 text-sm text-accent-2">{p.outcome}</p>}

            <ul className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s}>
                  <Chip size="sm">{s}</Chip>
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

      {/* One dialog for the whole section rather than one per card. */}
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        label={selected?.title ?? ""}
      >
        {selected && (
          <div className="max-h-[85vh] overflow-y-auto p-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${selected.category} · ${selected.year} · ${selected.role}`}
            </p>
            {/* h2, not h3: the card titles are level 3 and a dialog heading at
                the same level would join their outline. */}
            <h2 className="mt-2 font-display text-h2 font-bold break-words text-primary">
              {selected.title}
            </h2>

            <img
              src={selected.thumbnail}
              alt={`${selected.title} preview`}
              width={800}
              height={500}
              decoding="async"
              className="mt-4 w-full rounded-lg border border-edge"
            />

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  Problem
                </dt>
                <dd className="mt-1 max-w-[68ch] text-muted">{selected.problem}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  Approach
                </dt>
                <dd className="mt-1 max-w-[68ch] text-muted">{selected.solution}</dd>
              </div>
              {selected.outcome && (
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    Outcome
                  </dt>
                  <dd className="mt-1 max-w-[68ch] text-accent-2">{selected.outcome}</dd>
                </div>
              )}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {selected.stack.map((tech) => (
                <li key={tech}>
                  <Chip size="sm">{tech}</Chip>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {selected.links.repo && (
                <a
                  href={selected.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-accent"
                >
                  Repository
                </a>
              )}
              {selected.links.demo && (
                <a
                  href={selected.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-accent"
                >
                  Live demo
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </SectionShell>
  );
}
