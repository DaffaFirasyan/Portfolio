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
 * hook on the other, alternating by index. The point is contrast: eight cards
 * of equal weight tell a reader nothing about where to start, and `featured` is
 * an editorial judgement already recorded in the data and shown nowhere.
 *
 * The row is a teaser, not a summary. It used to carry `problem` in full —
 * often three or four wrapped lines — right next to `outcome`, when the dialog
 * already says everything the row said and more (problem, solution, outcome,
 * the whole stack). That made the row both the biggest thing on the page and
 * the least necessary: nothing on it earned a click. Now the row leads with
 * the result, the one line a case study's teaser can least do without, and
 * the rest — including *why* that result was hard — is one click away. A
 * reader who wants the mechanism has to open the dialog to get it, which is
 * the point.
 *
 * Two independent controls open that dialog: the title, and the image itself
 * — siblings, not nested, since a button cannot contain a link and the row
 * still carries Repository/Live demo. A picture this size inviting the click
 * matters on a touch device, where nothing here ever gets a hover cue.
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
  const open = () => onOpen(project);

  return (
    <Surface className="p-6">
      <article
        data-dimmed={dimmed ? 'true' : undefined}
        className={`grid items-center gap-6 transition-opacity duration-150 lg:grid-cols-2 ${
          dimmed ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={open}
          aria-label={`View ${project.title} case study`}
          className={`block w-full text-left ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <img
            src={project.thumbnail}
            alt={`${project.title} preview`}
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            className="w-full rounded-lg border border-edge"
          />
        </button>

        <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
          {/* The oversized numeral is the accent that used to be missing: three
              identically-shaped rows read as one thing repeated, and a large,
              low-opacity ordinal gives each row an identity a reader can key on
              before reading a word — the editorial "case study" convention,
              done in CSS alone so it costs nothing and cannot become a fourth
              hover treatment competing with Surface's. The dash stays on the
              tag span, not the numeral, because projects-filter.test.tsx counts
              rows by an element whose own text ends in "— Featured". */}
          <p className="flex items-baseline gap-2">
            {/* accent/30 measured 1.84:1, under the 3:1 AA asks of large text
                and faint enough that the ordinal it exists to give each row
                barely registered. accent/55 is 3.4:1 and still reads as a
                ghosted numeral rather than a heading. */}
            <span className="font-display text-3xl font-extrabold text-accent/55 md:text-4xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
              — Featured
            </span>
          </p>

          {/* The title is both the heading and the control. The whole row cannot
              be a button: it contains links, and a button containing links is
              invalid markup. */}
          <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight break-words text-primary md:text-3xl">
            <button type="button" onClick={open} className="text-left">
              {project.title}
            </button>
          </h3>

          <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`${project.category} · ${project.year} · ${project.role}`}
          </p>

          {/* The result, not the problem: `problem` and `solution` now live in
              the dialog only. Every project is guaranteed a non-empty outcome
              by data/invariants.test.ts, so the fallback below never fires on
              real data — it exists so a future edit that relaxes that
              invariant degrades instead of rendering an empty line. Clamped to
              two lines on principle, not because 140 characters usually needs
              it: a teaser that cannot grow past a fixed height is one fewer
              thing to re-check every time the real copy changes. */}
          <p className="mt-3 line-clamp-2 font-semibold text-accent-2">
            {project.outcome ?? project.problem}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s}>
                <Chip size="sm">{s}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
        </div>
      </article>
    </Surface>
  );
}
