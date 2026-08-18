import { useCallback, useEffect, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { education } from '@/data/education';
import { certificates } from '@/data/certificates';
import type { CertificateCategory } from '@/types';
import Chip from '@/motion/Chip';
import Counter from '@/motion/Counter';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';
import Dialog from '@/motion/Dialog';
import { cycleIndex } from '@/lib/cycle';
import { CATEGORY_ORDER, groupByCategory } from '@/lib/group';

const CERT_ALL = 'All' as const;
type CertFilter = typeof CERT_ALL | CertificateCategory;

/** Labels for the filter row, read from the same place the groups took them. */
const LABEL_OF = Object.fromEntries(
  groupByCategory(certificates).map((g) => [g.category, g.label]),
) as Record<CertificateCategory, string>;

/**
 * Every certificate paired with its position in the flat array.
 *
 * Built once, outside the component, so filtering can never renumber it — the
 * lightbox walks these indices with the arrow keys.
 */
const INDEXED = certificates.map((certificate, index) => ({ certificate, index }));

export default function Education() {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [category, setCategory] = useState<CertFilter>(CERT_ALL);
  const [imageBroken, setImageBroken] = useState(false);

  const step = useCallback((delta: number) => {
    setImageBroken(false);
    setOpenAt((at) => (at === null ? at : cycleIndex(at, certificates.length, delta)));
  }, []);

  useEffect(() => {
    if (openAt === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    // On window rather than the dialog: the browser moves focus inside the
    // dialog on open, and which child holds it is not ours to assume.
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openAt, step]);

  const shown = openAt === null ? null : certificates[openAt];

  const visible =
    category === CERT_ALL
      ? INDEXED
      : INDEXED.filter(({ certificate }) => certificate.category === category);

  return (
    <SectionShell {...shellProps('education')}>
      {education.map((e) => (
        <Reveal key={e.id}>
          <Surface className="p-6">
            <h3 className="font-display text-lg font-bold text-primary">{e.degree}</h3>
            <p className="text-accent-2">{e.institution}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${e.startYear} — ${e.endYear === 'present' ? 'Present' : e.endYear}${e.gpa ? ` · GPA ${e.gpa}` : ''}`}
            </p>
            {e.highlights && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
                {e.highlights.map((h) => (
                  <li key={h.slice(0, 32)}>{h}</li>
                ))}
              </ul>
            )}
          </Surface>
        </Reveal>
      ))}

      <h3 className="mt-12 font-display text-lg font-bold text-primary">
        Certificates (<Counter value={certificates.length} />)
      </h3>

      {/* A wall, not a list. Fourteen credentials spread across five
          three-column grids read as "some certificates"; fourteen tiles packed
          together read as a collection, which is the reaction worth having.
          The categories move into a filter row so the structure survives
          without breaking the wall into five small ones.

          Unlike a carousel this hides no work — all fourteen are on screen at
          once. Only the labels wait for hover, and they are in the
          accessibility tree regardless, because opacity does not remove an
          element from it: every tile's accessible name is its title and
          issuer whether or not the overlay is visible.

          `index` is the position in the flat certificates array, which is what
          the lightbox steps through with the arrow keys. Filtering must never
          renumber it. */}
      <ul className="mt-6 flex flex-wrap gap-2">
        {[CERT_ALL, ...CATEGORY_ORDER].map((name) => {
          const count =
            name === CERT_ALL
              ? certificates.length
              : certificates.filter((c) => c.category === name).length;
          if (count === 0) return null;

          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={name === category}
                onClick={() => setCategory(name)}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
                  name === category
                    ? 'border-accent bg-accent font-semibold text-void'
                    : 'border-edge text-muted hover:text-primary'
                }`}
              >
                {`${name === CERT_ALL ? 'All' : LABEL_OF[name]} ${count}`}
              </button>
            </li>
          );
        })}
      </ul>

      <Reveal>
        <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {visible.map(({ certificate: c, index }) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setImageBroken(false);
                  setOpenAt(index);
                }}
                className="group relative block w-full overflow-hidden rounded-lg border border-edge"
              >
                <img
                  src={c.thumbnailUrl}
                  alt=""
                  width={600}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  className="block w-full transition-transform duration-300 group-hover:scale-105"
                />

                {/* Present in the accessibility tree at all times — opacity
                    hides it from sight, not from a screen reader — so the
                    button is named even while the overlay is invisible. */}
                <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-void via-void/80 to-transparent p-2 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="line-clamp-3 text-[11px] font-semibold leading-tight text-primary">
                    {c.title}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    {c.issuer}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Dialog
        open={shown !== null}
        onClose={() => setOpenAt(null)}
        label={shown ? `${shown.title}, enlarged` : ""}
        wide
      >
        {shown && (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${shown.issuer} · ${shown.issueDate}`}
            </p>
            <h2 className="mt-2 font-display text-h2 font-bold break-words text-primary">
              {shown.title}
            </h2>

            {/* Moved here from the tiles. Fourteen tiles each carrying a row of
                chips is what made that grid a wall; here there is room for them
                and a reader has already chosen to look closely. */}
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {shown.skills.map((s) => (
                <li key={s}>
                  <Chip size="sm">{s}</Chip>
                </li>
              ))}
            </ul>

            {imageBroken ? (
              // No intrinsic dimensions are stored per certificate, so a failed
              // image cannot reserve its space. Saying what it was beats a
              // broken-image icon.
              <p className="mt-6 rounded-lg border border-edge p-8 text-center text-muted">
                {`The scan of this certificate could not be loaded. It was issued by ${shown.issuer}.`}
              </p>
            ) : (
              <img
                src={shown.imageUrl}
                alt={`${shown.title}, issued by ${shown.issuer}`}
                onError={() => setImageBroken(true)}
                decoding="async"
                // Full-size scans keep their own aspect ratio by design, which
                // is why no width or height is recorded for them — the box
                // absorbs the variation instead.
                className="mx-auto mt-6 max-h-[60vh] w-auto max-w-full rounded-lg border border-edge object-contain"
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous certificate"
                className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm text-muted"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next certificate"
                className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm text-muted"
              >
                Next
              </button>
              <p className="font-mono text-xs text-muted">
                {`${(openAt ?? 0) + 1} / ${certificates.length}`}
              </p>

              {shown.credentialUrl && (
                <a
                  href={shown.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-accent"
                >
                  Verify credential
                </a>
              )}

              <button
                type="button"
                onClick={() => setOpenAt(null)}
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
