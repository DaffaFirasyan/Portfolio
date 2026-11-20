import { useLanguage } from '@/context/LanguageContext';
import type { Project } from '@/types';

interface ProjectTileProps {
  project: Project;
  /** True while a hovered skill does not appear in this project. */
  dimmed: boolean;
  /** The first project is set a little larger; it is the one that carries the argument. */
  lead?: boolean;
}

const LABEL = 'font-mono text-xs uppercase tracking-[0.14em] text-muted';

/**
 * One project, set as a plate: the screenshot in a hairline frame with a
 * crosshair on each corner, then a caption row (title, category and year, role)
 * and the account in three short columns. There is nothing to open: the problem,
 * the solution and the outcome are on the page.
 *
 * `data-dimmed` and the `<article>` are load-bearing:
 * `cross-highlight.test.tsx` finds the tile by them when a skill is hovered.
 */
export default function ProjectTile({ project, dimmed, lead = false }: ProjectTileProps) {
  const { t } = useLanguage();
  const meta = [project.category, project.year, project.role].filter(Boolean).join(' · ');

  return (
    <article
      data-dimmed={dimmed ? 'true' : undefined}
      className={`transition-opacity duration-200 ${dimmed ? 'opacity-40' : 'opacity-100'}`}
    >
      <div className="plate bg-surface p-3 sm:p-4">
        <img
          src={project.thumbnail}
          alt=""
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover object-top"
        />
      </div>

      <div className="mt-8 grid gap-1 border-t border-edge pt-5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8">
        <h3
          className={`font-medium tracking-[-0.02em] break-words text-primary text-balance ${
            lead ? 'text-3xl' : 'text-2xl'
          }`}
        >
          {project.title}
        </h3>
        <p className="text-sm text-muted">{meta}</p>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-3">
        <div>
          <dt className={LABEL}>{t.problem}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">{project.problem}</dd>
        </div>
        <div>
          <dt className={LABEL}>{t.solution}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">{project.solution}</dd>
        </div>
        {project.outcome && (
          <div>
            <dt className={LABEL}>{t.outcome}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-primary">{project.outcome}</dd>
          </div>
        )}
      </dl>

      <p className="mt-6 text-sm text-primary">{project.stack.join(' · ')}</p>

      {(project.links.repo || project.links.demo) && (
        <p className="mt-2 flex flex-wrap gap-x-5">
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4"
            >
              {t.repository} ↗
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4"
            >
              {t.liveDemo} ↗
            </a>
          )}
        </p>
      )}
    </article>
  );
}
