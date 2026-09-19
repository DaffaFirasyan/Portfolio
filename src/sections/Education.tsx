import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { certificates } from '@/data/certificates';
import { useLanguage } from '@/context/LanguageContext';
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

const FEATURED_IDS = ['icadeis-presenter', 'web-developer'];

export default function Education() {
  const { education, sections, t, language } = useLanguage();
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

  const visible =
    category === CERT_ALL
      ? INDEXED
      : INDEXED.filter(({ certificate }) => certificate.category === category);

  return (
    <SectionShell {...shell}>
      {education.map((e) => (
        <Reveal key={e.id}>
          <Surface className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-primary">{e.degree}</h3>
                <p className="text-accent-2 font-medium">{e.institution}</p>
              </div>
              {e.gpa && (
                <div className="self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                    <span>{`${t.gpaLabel}: ${e.gpa}`}</span>
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${e.startYear} — ${e.endYear === 'present' ? t.present : e.endYear}`}
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
        {t.certificatesHeading} (<Counter value={certificates.length} />)
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
      {/* Morphing Pill Category Navigation */}
      <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-full border border-edge/60 bg-surface/50 p-1.5 backdrop-blur-md w-fit">
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
              className={`relative inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 outline-none ${
                isSelected ? 'text-accent font-semibold' : 'text-muted hover:text-primary'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCertTab"
                  className="absolute inset-0 rounded-full border border-accent/40 bg-accent/15 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{getCategoryLabel(name)}</span> <span className={`relative z-10 rounded-full px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px] transition-colors ${
                isSelected
                  ? 'bg-accent/25 text-accent font-bold'
                  : 'bg-surface/80 text-muted/80 border border-edge/40'
              }`}>{count}</span></button>
          );
        })}
      </div>

      <Reveal>
        {/* Compact Rich Credentials Grid */}
        <AnimatePresence mode="wait">
          <motion.ul
            key={category}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3"
          >
            {visible.map(({ certificate: c, index }) => {
              const isFeatured = FEATURED_IDS.includes(c.id);

              return (
                <li key={c.id} className="flex">
                  <button
                    type="button"
                    onClick={() => {
                      setImageBroken(false);
                      setOpenAt(index);
                    }}
                    aria-label={`${c.title} — ${c.issuer}`}
                    className={`group relative flex flex-col w-full text-left rounded-lg border p-2 sm:p-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isFeatured
                        ? 'border-accent/50 bg-surface/60 shadow-[0_0_12px_rgba(234,179,8,0.08)] hover:border-accent hover:bg-surface/80'
                        : 'border-edge/60 bg-surface/40 hover:border-edge-bright hover:bg-surface/70'
                    }`}
                  >
                    {/* Top Metadata: Issuer & Featured/Category Tag */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted font-semibold truncate">
                        {c.issuer}
                      </span>
                      {isFeatured ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-accent/40 bg-accent/20 px-1.5 py-0.2 text-[9px] font-semibold text-accent shrink-0">
                          <Sparkles className="h-2 w-2" />
                          <span>{language === 'id' ? 'Unggulan' : 'Featured'}</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[8px] uppercase tracking-wider text-muted/60 shrink-0">
                          {c.category}
                        </span>
                      )}
                    </div>

                    {/* Compact Image Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-edge/50 bg-void/70 mb-2 flex items-center justify-center p-0.5">
                      <img
                        src={c.thumbnailUrl}
                        alt=""
                        width={320}
                        height={200}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    {/* Certificate Title */}
                    <h4 className="font-display text-[11px] sm:text-xs font-semibold text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors flex-1">
                      {c.title}
                    </h4>

                    {/* Compact Skill Tags */}
                    {c.skills && c.skills.length > 0 && (
                      <ul className="mt-1.5 flex flex-wrap gap-1">
                        {c.skills.slice(0, 1).map((s) => (
                          <li key={s}>
                            <span className="rounded border border-edge/40 bg-surface/80 px-1.5 py-0.2 font-mono text-[9px] text-muted truncate max-w-[120px] inline-block">
                              {s}
                            </span>
                          </li>
                        ))}
                        {c.skills.length > 1 && (
                          <span className="font-mono text-[9px] text-muted/60 self-center">
                            +{c.skills.length - 1}
                          </span>
                        )}
                      </ul>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </Reveal>

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
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {shown.issuer}
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
                className="mx-auto mt-6 max-h-[60vh] w-auto max-w-full rounded-lg border border-edge object-contain"
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
