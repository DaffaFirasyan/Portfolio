import type { ReactNode } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useView } from '@/map/ViewProvider';
import { usePassport } from '@/passport/PassportProvider';
import StampMark from '@/passport/StampMark';
import { isStampId } from '@/passport/stamps';
import { useStampOnRead } from '@/passport/useStampOnRead';

interface SectionShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
  /** A working control for the left columns, set under the title (a filter, say). */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * One section of the passport. A hairline draws across the top as it arrives;
 * under it the title takes the left four of twelve columns and the evidence
 * takes the right eight, so every section is laid out the same way and the eye
 * learns the page once. At the end of the evidence sits a stamp slot: dashed
 * until the reader has spent five seconds here and moved on, inked after.
 *
 * `index` is accepted because the section metadata supplies it; it is not
 * printed. The heading carries its own weight.
 *
 * In Map mode only the open section is shown, as one compact column inside the panel.
 */
export default function SectionShell({ id, label, title, aside, children }: SectionShellProps) {
  const { t } = useLanguage();
  const { has, justEarned } = usePassport();
  const ref = useStampOnRead<HTMLElement>(id);
  const { mode, region } = useView();
  const map = mode === 'map';
  const earned = has(id);

  return (
    <section
      ref={ref}
      id={id}
      hidden={map && region !== id}
      className={map ? 'px-6 pt-6 pb-12' : 'scroll-mt-14 px-6 md:px-10'}
    >
      <div
        className={
          map
            ? 'grid w-full gap-y-8'
            : 'mx-auto grid w-full max-w-[1120px] gap-x-10 gap-y-10 pb-20 md:pb-28 lg:grid-cols-12'
        }
      >
        <div aria-hidden="true" className={`rule h-px bg-edge ${map ? '' : 'lg:col-span-12'}`} />
        <div className={map ? '' : 'lg:sticky lg:top-24 lg:col-span-4 lg:self-start'}>
          <h2 className="font-display text-4xl leading-[1.08] font-normal tracking-[-0.02em] text-primary text-balance md:text-5xl">
            {title}
          </h2>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className={map ? 'min-w-0' : 'min-w-0 lg:col-span-8'}>
          {children}
          {isStampId(id) && (
            <div className="mt-16 flex items-center gap-4">
              <StampMark
                stampId={id}
                label={label}
                earned={earned}
                fresh={justEarned === id}
                className="h-16 w-16"
              />
              <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                {earned ? t.stamped : t.notStamped}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
