import type { Project } from '@/types';
import Chip from '@/motion/Chip';
import Surface from '@/motion/Surface';

interface ProjectTileProps {
  project: Project;
  /** Position among the visible projects, for the ordinal and the focus index. */
  index: number;
  /** Featured tiles are wider. Dropped when a filter narrows the set. */
  wide: boolean;
  /** True while the set is unfiltered, so featuring is a claim worth making. */
  promoted: boolean;
  dimmed: boolean;
  onOpen: (project: Project) => void;
}

/**
 * One project, at one size, for every project.
 *
 * **This replaced two components, and that was the point.** Featured projects
 * were full-width `FeaturedProject` rows at 323px each and the rest were 76px
 * `FlowingMenu` rows — importance expressed by using a completely different
 * component, which is why the section read as two unrelated things stacked on
 * each other and why it ran to 1,720px, 22% of the page, for four projects.
 *
 * Importance is expressed by **area** now. `featured` already encodes it in the
 * data; here it becomes a wider cell in the same grid, so the tiers are one
 * composition rather than two.
 *
 * The card stays a teaser. `problem` and `solution` live in the dialog only —
 * that decision was made when the old rows were found to be duplicating the
 * dialog and leaving nothing on the card worth clicking for. What is here is
 * the outcome, which is the one line a case-study teaser can least do without.
 *
 * `data-dimmed` and the `<article>` are load-bearing: `cross-highlight.test.tsx`
 * finds a project by its level-3 heading and walks up to the nearest article,
 * and only opacity may differ between the two states or the grid shifts under
 * the cursor.
 */
export default function ProjectTile({
  project,
  index,
  wide,
  promoted,
  dimmed,
  onOpen,
}: ProjectTileProps) {
  const open = () => onOpen(project);

  return (
    <Surface className="h-full p-3">
      <article
        data-dimmed={dimmed ? 'true' : undefined}
        className={`flex h-full flex-col transition-opacity duration-150 ${
          dimmed ? 'opacity-40' : 'opacity-100'
        }`}
      >
        {/* The image is a second control opening the same dialog as the title.
            Siblings rather than nested, since a button cannot contain a link
            and the dialog carries Repository and Live demo. A picture this size
            inviting the click matters on a touch device, where nothing here
            ever gets a hover cue. */}
        <button
          type="button"
          onClick={open}
          aria-label={`View ${project.title} case study`}
          className="block w-full overflow-hidden rounded-lg"
        >
          <img
            src={project.thumbnail}
            alt={`${project.title} preview`}
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            // Both crops are letterboxed hard, and the numbers were measured
            // rather than chosen. A grid row stretches to its tallest cell, so
            // the wide tile sets the height of everything beside it: at
            // `aspect-[21/9]` it rendered 299px of image alone and the section
            // came out at 1,569px — barely better than the 1,720px of stacked
            // rows this replaced. The point of the change was height.
            //
            // The wide crop is flatter than the narrow one on purpose. It is
            // roughly twice as wide, so an equal ratio would make it twice as
            // tall, and the row would inherit that.
            className={`w-full object-cover ${wide ? 'aspect-[24/7]' : 'aspect-[16/7]'}`}
          />
        </button>

        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold text-accent/55">
            {String(index + 1).padStart(2, '0')}
          </span>
          {/* Only while unfiltered. Featuring is a judgement about the whole
              body of work; inside "2 of 4 match Web" it claims an importance it
              does not have. projects-filter.test.tsx asserts the marker
              disappears entirely once a category narrows the set. */}
          {promoted && project.featured && (
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
              — Featured
            </span>
          )}
        </p>

        {/* The title is both the heading and the control. The whole tile cannot
            be a button: it contains links, and a button containing links is
            invalid markup. */}
        <h3 className="mt-1 font-display text-lg font-extrabold leading-tight break-words text-primary">
          <button type="button" onClick={open} className="text-left">
            {project.title}
          </button>
        </h3>

        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
          {/* Assembled from the parts that exist — interpolating `role`
              directly printed a trailing separator for any project without
              one. */}
          {[project.category, project.year, project.role].filter(Boolean).join(' · ')}
        </p>

        <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-accent-2">
          {project.outcome ?? project.problem}
        </p>

        {/* mt-auto pins the stack and the control to the bottom, so tiles of
            different text lengths still line up along their base. */}
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2.5">
          {project.stack.slice(0, wide ? 6 : 4).map((s) => (
            <li key={s}>
              <Chip size="sm">{s}</Chip>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button
            type="button"
            onClick={open}
            className="inline-flex min-h-11 items-center font-semibold text-accent"
          >
            View case study →
          </button>
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
      </article>
    </Surface>
  );
}
