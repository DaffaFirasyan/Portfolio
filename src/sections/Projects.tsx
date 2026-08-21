import { useMemo, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import FeaturedProject from '@/components/ui/FeaturedProject';
import { shellProps } from '@/data/sections';
import { projects } from '@/data/projects';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import type { Project } from '@/types';
import { ALL, categoriesOf, filterByCategory } from '@/lib/filter';
import Chip from '@/motion/Chip';
import Dialog from '@/motion/Dialog';
import ProjectFlow from '@/motion/ProjectFlow';
import Reveal from '@/motion/Reveal';

export default function Projects() {
  const { isDimmed } = useSkillHighlight();
  const [category, setCategory] = useState(ALL);
  const [selected, setSelected] = useState<Project | null>(null);

  const categories = useMemo(() => categoriesOf(projects), []);
  const visible = useMemo(() => filterByCategory(projects, category), [category]);

  // Featuring is a judgement about the whole body of work, so it is dropped the
  // moment a filter narrows that body. Inside "3 of 8 match Web" a featured row
  // would claim an importance it does not have, and with a single match the
  // page would show one enormous row above an empty grid.
  const split = category === ALL;
  const featured = useMemo(() => (split ? visible.filter((p) => p.featured) : []), [visible, split]);
  const rest = useMemo(
    () => (split ? visible.filter((p) => !p.featured) : visible),
    [visible, split],
  );

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
      <>
      {featured.length > 0 && (
        <div className="mb-10 space-y-4">
          {featured.map((p, index) => (
            <Reveal key={p.id} delay={0.06 * index}>
              <FeaturedProject
                project={p}
                index={index}
                dimmed={isDimmed(p.id)}
                onOpen={setSelected}
              />
            </Reveal>
          ))}
        </div>
      )}

      {/* The quieter projects, as rows that show their screenshot on hover.
          They were tiles: five of them at 285px each took 1425px, 57% of the
          section, for the tier that is meant to be the quiet one. Rows put
          every name on screen at once and hold the image back until a reader
          reaches for it, which is the curiosity the tiles never created.

          Each row is an article with an h3 inside, so the cross-highlight can
          dim them one by one and a screen reader can still navigate the
          projects by heading. The vendored component was edited for both;
          without that, five of eight projects lost their heading and the
          highlight could only dim the whole block. */}
      <ProjectFlow
        items={rest.map((p) => ({
          id: p.id,
          title: p.title,
          image: p.thumbnail,
          dimmed: isDimmed(p.id),
          onSelect: () => setSelected(p),
        }))}
      />
      </>
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
