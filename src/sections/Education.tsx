import { useCallback, useEffect, useRef, useState } from 'react';

import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { certificates } from '@/data/certificates';
import { useLanguage } from '@/context/LanguageContext';
import type { CertificateCategory } from '@/types';
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
  const { education, sections, t } = useLanguage();
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [category, setCategory] = useState<CertFilter>(CERT_ALL);
  const [imageBroken, setImageBroken] = useState(false);

  const shell = shellPropsFrom(sections, 'education');

  const getCategoryLabel = (name: CertFilter): string => {
    if (name === CERT_ALL) return t.all;
    switch (name) {
      case 'competition':
        return t.catCompetition;
      case 'professional':
        return t.catProfessional;
      case 'bootcamp':
        return t.catBootcamp;
      case 'course':
        return t.catCourse;
      case 'workshop':
        return t.catWorkshop;
      default:
        return LABEL_OF[name] ?? name;
    }
  };

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

  // The dialog opens with focus on its first control, Previous, which would
  // drop a keyboard reader onto navigation they did not ask for. Focus Close
  // instead, once per opening: keyed on open-or-not rather than on which
  // certificate, so stepping through them never pulls focus back. Done here
  // rather than with autoFocus, because React focuses an autoFocus element at
  // mount, before Dialog has noted which control opened it, and Dialog then
  // hands focus back to the wrong place when it closes.
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = openAt !== null;
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  const visible =
    category === CERT_ALL
      ? INDEXED
      : INDEXED.filter(({ certificate }) => certificate.category === category);

  return (
    <SectionShell
      {...shell}
      aside={
        <div className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-y-0">
                {[CERT_ALL, ...CATEGORY_ORDER].map((name) => {
                  const count =
                    name === CERT_ALL
                      ? certificates.length
                      : certificates.filter((c) => c.category === name).length;
                  if (count === 0) return null;
        
                  const isSelected = name === category;
        
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${getCategoryLabel(name)} ${count}`}
                      onClick={() => setCategory(name)}
                      className={`inline-flex min-h-9 items-center gap-1.5 text-sm transition-colors ${
                        isSelected
                          ? 'font-semibold text-accent underline underline-offset-8'
                          : 'text-muted hover:text-primary'
                      }`}
                    >
                      {getCategoryLabel(name)}
                      <span aria-hidden="true" className="tabular-nums text-muted">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
      }
    >
      {education.map((e) => (
        <div key={e.id}>
          <h3 className="text-2xl font-medium tracking-[-0.02em] text-primary text-balance">{e.degree}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {e.institution}
            {` · ${e.startYear} — ${e.endYear === 'present' ? t.present : e.endYear}`}
            {e.gpa ? ` · ${t.gpaLabel}: ${e.gpa}` : ''}
          </p>
          {e.highlights && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted marker:text-edge">
              {e.highlights.map((h) => (
                <li key={h.slice(0, 32)}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <h3 className="mt-16 text-xl font-medium text-primary">
        {t.certificatesHeading} ({certificates.length})
      </h3>

      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map(({ certificate: c, index }) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                setImageBroken(false);
                setOpenAt(index);
              }}
              aria-label={`${c.title} — ${c.issuer}`}
              className="group block w-full text-left"
            >
              {/* Every scan sits on the same tinted mount inside a hairline frame,
                  like a print in a plate section. Several thumbnails carry black
                  bars of their own; the mount gives them something to sit on. */}
              <span className="block border border-edge bg-surface p-1.5 transition-colors group-hover:border-muted">
                <img
                  src={c.thumbnailUrl}
                  alt=""
                  width={320}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-contain"
                />
              </span>
              <span className="mt-2 block min-h-[3.75rem] text-sm font-medium leading-snug text-primary group-hover:text-accent">
                {c.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{c.issuer}</span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={shown !== null}
        onClose={() => setOpenAt(null)}
        label={shown ? `${shown.title}, enlarged` : ""}
        wide
      >
        {shown && (
          <div className="p-6">
            {/* Issuer alone. The date used to follow it, and the scan directly
                below states its own — so the caption was reprinting part of the
                picture it captions. Who awarded it is the one thing the image
                does not always make scannable at a glance. */}
            <p className="text-sm font-medium text-muted">
              {shown.issuer}
            </p>
            <h2 className="mt-2 text-3xl font-normal tracking-[-0.02em] break-words text-primary">
              {shown.title}
            </h2>

            {/* Moved here from the tiles. Fourteen tiles each carrying a row of
                chips is what made that grid a wall; here there is room for them
                and a reader has already chosen to look closely. */}
            <p className="mt-3 text-sm text-muted">{shown.skills.join(' · ')}</p>

            {imageBroken ? (
              // No intrinsic dimensions are stored per certificate, so a failed
              // image cannot reserve its space. Saying what it was beats a
              // broken-image icon.
              <p className="mt-6 rounded-lg border border-edge p-8 text-center text-muted">
                {t.scanError(shown.issuer)}
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
                className="mx-auto mt-6 max-h-[60vh] w-auto max-w-full border border-edge object-contain"
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t.previousCertAria}
                className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm text-muted"
              >
                {t.previous}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t.nextCertAria}
                className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm text-muted"
              >
                {t.next}
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
                  {t.verifyCredential}
                </a>
              )}

              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpenAt(null)}
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
