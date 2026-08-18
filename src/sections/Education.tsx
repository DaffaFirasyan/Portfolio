import { useCallback, useEffect, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { education } from '@/data/education';
import { certificates } from '@/data/certificates';
import Chip from '@/motion/Chip';
import Counter from '@/motion/Counter';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';
import Dialog from '@/motion/Dialog';
import { cycleIndex } from '@/lib/cycle';
import { groupByCategory } from '@/lib/group';

/** Seconds between one certificate card arriving and the next. */
const STEP = 0.04;

/** Presentational only — the flat certificates array is what the lightbox walks. */
const groups = groupByCategory(certificates);

export default function Education() {
  const [openAt, setOpenAt] = useState<number | null>(null);
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

      {/* Grouped for reading, never for walking. `index` is the position in the
          flat certificates array and is what the lightbox steps through with
          the arrow keys — groupByCategory carries it so the two orders cannot
          drift apart.

          Each group is a div rather than a section: this page's sections are
          its structure and each carries an id, and a named <section> is a
          region landmark — five of those for certificate groups is noise in a
          landmark list. The h4 already places the group in the outline. */}
      {groups.map((group) => (
        <div key={group.category} className="mt-10">
          <h4 className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`${group.label} · ${group.items.length}`}
          </h4>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* `fill` because each Reveal is the grid item: without it the cards
                in a row stop matching heights. */}
            {group.items.map(({ certificate: c, index }, within) => (
          <Reveal key={c.id} delay={STEP * within} fill>
            <Surface className="h-full p-4">
            <article>
              {/* No thumbnail here any more. It was 225px of a 309px tile —
                  ninety percent of a section that ran to 3484px — showing a
                  scan nobody can read at 380px wide. The scan lives in the
                  lightbox, where it is legible and where a reader has chosen
                  to look. What is left is the credential itself. */}
              <p className="text-sm font-semibold break-words text-primary">
                <button
                  type="button"
                  onClick={() => {
                    setImageBroken(false);
                    setOpenAt(index);
                  }}
                  className="text-left hover:text-accent"
                >
                  {c.title}
                </button>
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {`${c.issuer} · ${c.issueDate}`}
              </p>

              {/* Skills moved into the lightbox. Fourteen tiles each carrying a
                  row of chips is what made this a wall; the group heading now
                  says what kind of certificate it is, which is the thing a
                  reader was actually scanning for. */}

              {/* No credential URL means no control at all, not a dead one.
                  Three of the fourteen have none. */}
              {c.credentialUrl && (
                <a
                  href={c.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent"
                >
                  Verify credential
                </a>
              )}
            </article>
            </Surface>
          </Reveal>
            ))}
          </div>
        </div>
      ))}

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
