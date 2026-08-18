import type { Project } from '@/types';
import Chip from '@/motion/Chip';
import Surface from '@/motion/Surface';

interface FeaturedProjectProps {
  project: Project;
  /** Position among the featured entries, so they read as a ranked set. */
  index: number;
  dimmed: boolean;
  onOpen: (project: Project) => void;
}

/**
 * One of the at-most-three projects the data marks as featured.
 *
 * A full-width row rather than a grid cell, with the image on one side and the
 * story on the other, alternating by index. The point is contrast: eight cards
 * of equal weight tell a reader nothing about where to start, and `featured` is
 * an editorial judgement already recorded in the data and shown nowhere.
 *
 * Alternation is a wide-screen idea. Below `lg` both sides stack with the image
 * first — reversing the order on a phone would leave two layouts to debug for
 * no gain a reader could name.
 *
 * `data-dimmed` and the opacity classes live on the `<article>` because that is
 * where the skill cross-highlight looks for them, and only opacity may change
 * between the two states or the row shifts under the cursor.
 */
export default function FeaturedProject({
  project,
  index,
  dimmed,
  onOpen,
}: FeaturedProjectProps) {
  const imageFirst = index % 2 === 0;

  return (
    <Surface className="p-6 md:p-8">
      <article
        data-dimmed={dimmed ? 'true' : undefined}
        className={`grid items-center gap-8 transition-opacity duration-150 lg:grid-cols-2 ${
          dimmed ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <img
          src={project.thumbnail}
          alt={`${project.title} preview`}
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          className={`w-full rounded-lg border border-edge ${
            imageFirst ? 'lg:order-1' : 'lg:order-2'
          }`}
        />

        <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
            {`${String(index + 1).padStart(2, '0')} — Featured`}
          </p>

          {/* The title is both the heading and the control. The whole row cannot
              be a button: it contains links, and a button containing links is
              invalid markup. */}
          <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight break-words text-primary md:text-3xl">
            <button type="button" onClick={() => onOpen(project)} className="text-left">
              {project.title}
            </button>
          </h3>

          <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`${project.category} · ${project.year} · ${project.role}`}
          </p>

          {/* At reading size, not caption size. This sentence is the reason to
              care about the project. */}
          <p className="mt-4 max-w-[52ch] text-muted">{project.problem}</p>

          {project.outcome && (
            <p className="mt-3 max-w-[52ch] font-semibold text-accent-2">{project.outcome}</p>
          )}

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s}>
                <Chip size="sm">{s}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {project.links.repo && (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-accent"
              >
                Repository
              </a>
            )}
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-accent"
              >
                Live demo
              </a>
            )}
          </div>
        </div>
      </article>
    </Surface>
  );
}
