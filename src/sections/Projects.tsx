import SectionShell from '@/components/layout/SectionShell';
import { projects } from '@/data/projects';

export default function Projects() {
  return (
    <SectionShell id="projects" index={4} label="Projects" title="Selected work">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <article key={p.id} className="rounded-xl border border-edge bg-surface p-5">
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
