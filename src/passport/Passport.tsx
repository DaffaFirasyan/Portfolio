import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import Dialog from '@/motion/Dialog';
import { usePassport } from './PassportProvider';
import StampMark from './StampMark';
import { stampHint, stampName } from './stampName';
import { ALL_STAMPS, TOTAL, isSecret, sectionsComplete } from './stamps';

/**
 * The corner chip and the sheet it opens. Everything on the page is readable
 * without it; this is where the reader sees what they have collected, what the
 * three secrets hint at, and, once every section is stamped, a closing note and
 * a way to write.
 */
export default function Passport() {
  const { stamps, has, justEarned, soundOn, setSoundOn } = usePassport();
  const { t, sections, profile } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        data-passport-chip
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-edge bg-void px-4 font-mono text-xs tabular-nums text-primary transition-colors hover:border-primary"
      >
        {t.passport} {stamps.length}/{TOTAL}
      </button>

      {/* Always mounted, so the announcement is heard when its text arrives. */}
      <p role="status" className="sr-only">
        {justEarned ? t.stampEarned(stampName(justEarned, sections, t)) : ''}
      </p>

      <Dialog open={open} onClose={() => setOpen(false)} label={t.passport}>
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <h2 className="font-display text-3xl font-normal tracking-[-0.02em] text-primary">
              {t.passport}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-primary underline underline-offset-4"
            >
              {t.close}
            </button>
          </div>

          <p className="mt-3 max-w-[48ch] text-muted text-pretty">{t.passportHint}</p>

          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-5">
            {ALL_STAMPS.map((id) => {
              const earned = has(id);
              return (
                <li key={id} className="flex flex-col items-center gap-2 text-center">
                  <StampMark
                    stampId={id}
                    label={stampName(id, sections, t)}
                    earned={earned}
                    className="h-20 w-20"
                  />
                  <span className="text-sm text-primary">
                    {isSecret(id) && !earned ? t.secretStamp : stampName(id, sections, t)}
                  </span>
                  {isSecret(id) && !earned && (
                    <span className="text-xs text-pretty text-muted">{stampHint(id, t)}</span>
                  )}
                </li>
              );
            })}
          </ul>

          {sectionsComplete(stamps) && (
            <div className="mt-10 border-t border-edge pt-6">
              <p className="font-display text-2xl text-primary">{t.completeTitle}</p>
              <p className="mt-2 max-w-[48ch] text-muted text-pretty">{t.completeNote}</p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
              >
                {t.emailMe}
              </a>
            </div>
          )}

          <label className="mt-10 flex min-h-11 items-center gap-3 text-sm text-primary">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(event) => setSoundOn(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            {t.sound}
          </label>
        </div>
      </Dialog>
    </>
  );
}
