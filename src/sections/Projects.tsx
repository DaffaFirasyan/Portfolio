import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { projects } from '@/data/projects';
import { useSkillHighlight } from '@/highlight/SkillHighlight';

export default function Projects() {
  const { isDimmed } = useSkillHighlight();

  return (
    <SectionShell {...shellProps('projects')}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
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
    </SectionShell>
  );
}
