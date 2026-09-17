import { useMemo, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import ProjectTile from '@/components/ui/ProjectTile';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import type { Project } from '@/types';
import { ALL, categoriesOf, filterByCategory } from '@/lib/filter';
import Chip from '@/motion/Chip';
import Dialog from '@/motion/Dialog';
import FocusGrid, { FocusItem } from '@/motion/FocusGrid';
import Reveal from '@/motion/Reveal';

export default function Projects() {
  const { projects, sections, t } = useLanguage();
  const { isDimmed } = useSkillHighlight();
  const [category, setCategory] = useState(ALL);
  const [selected, setSelected] = useState<Project | null>(null);

  const shell = shellPropsFrom(sections, 'projects');
  const categories = useMemo(() => categoriesOf(projects), [projects]);
  const visible = useMemo(() => filterByCategory(projects, category), [projects, category]);

  // Featuring is a judgement about the whole body of work, so the *claim* is
  // dropped the moment a filter narrows that body — inside "2 of 4 match Web" a
  // featured badge asserts an importance it does not have. What is no longer
  // dropped is the projects themselves: they are one grid now, so there is
  // nothing to split apart, only a marker and a cell width to stop applying.
  const promoted = category === ALL;

  // Featured first while unfiltered, each group keeping its data order.
  // "Promoted, not merely reordered: they lead the section" is asserted by
  // projects-filter.test.tsx, and it is the reason featuring is visible at all
  // — a badge on a tile in the middle of a grid claims far less than a tile at
  // the front of one. Under a filter the order is left exactly as the data has
  // it, which the same file asserts separately.
  const ordered = useMemo(
    () =>
      promoted
        ? [...visible].sort((a, b) => Number(b.featured) - Number(a.featured))
        : visible,
    [visible, promoted],
  );

  // One lead, then a row of three. The first project spans the whole grid and
  // lays its image beside its text; the rest take a column each.
  //
  // This replaced an alternating 2+1 / 2+1 bento, and the reason is hierarchy:
  // two double-width tiles read as two leads competing, where the site's own
  // title claims one thing and exactly one project proves it. Which project
  // leads is decided in `src/data/projects.ts` by array order, not here.
  //
  // Under a filter every tile is equal. A lead tile in a set of two would be
  // claiming a rank inside a subset that does not have one, which is the same
  // reasoning that drops the Featured marker.
  const isLead = (index: number) => promoted && index === 0;

  return (
    <SectionShell {...shell}>
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
                {name === ALL ? t.all : name}
              </Chip>
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        // Never a blank area. An empty grid reads as a broken page rather than
        // as an answer, so it says what happened and offers the way back.
        <div className="rounded-xl border border-edge bg-surface p-8 text-center">
          <p className="text-muted">{t.noProjectsYet(category)}</p>
          <button
            type="button"
            onClick={() => setCategory(ALL)}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-accent px-5 text-sm font-semibold text-accent"
          >
            {t.showAllProjects}
          </button>
        </div>
      ) : (
        // One grid for every project, at three columns. The old section used a
        // different *component* per tier — 323px rows for featured, 76px flow
        // rows for the rest — which is why it read as two unrelated things and
        // ran to 1,720px for four projects.
        <FocusGrid className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ordered.map((p, index) => (
            // The span lives on this wrapper, not on Reveal. When Reveal
            // animates it renders AnimatedContent as its outermost element and
            // only forwards `className` to an inner div — so a col-span passed
            // to Reveal would land one level below the grid and do nothing.
            <div key={p.id} className={isLead(index) ? 'md:col-span-3' : undefined}>
              <Reveal
                delay={0.05 * index}
                // fill, because these are grid items: without it the Reveal
                // wrappers collapse and the tile stops filling its cell.
                fill
              >
                <FocusItem index={index} className="h-full">
                  <ProjectTile
                    project={p}
                    index={index}
                    lead={isLead(index)}
                    promoted={promoted}
                    dimmed={isDimmed(p.id)}
                    onOpen={setSelected}
                  />
                </FocusItem>
              </Reveal>
            </div>
          ))}
        </FocusGrid>
      )}

      {/* One dialog for the whole section rather than one per card. */}
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        label={selected?.title ?? ""}
      >
        {selected && (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {/* Same as the featured row: only the parts that exist, so a
                  project without a stated role does not show a dangling
                  separator. */}
              {[selected.category, selected.year, selected.role].filter(Boolean).join(' · ')}
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
                  {t.problem}
                </dt>
                <dd className="mt-1 max-w-[68ch] text-muted">{selected.problem}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {t.solution}
                </dt>
                <dd className="mt-1 max-w-[68ch] text-muted">{selected.solution}</dd>
              </div>
              {selected.outcome && (
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {t.outcome}
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
                  {t.repository}
                </a>
              )}
              {selected.links.demo && (
                <a
                  href={selected.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-accent"
                >
                  {t.liveDemo}
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </SectionShell>
  );
}
