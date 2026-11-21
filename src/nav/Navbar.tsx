import { useEffect, useRef, useState } from 'react';

import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useView } from '@/map/ViewProvider';
import { usePassport } from '@/passport/PassportProvider';

const LINK = 'inline-flex min-h-9 items-center text-sm transition-colors';

/**
 * The bar across the top: his short name, the way to every section, the
 * language and the CV. It is one line of small type on the paper with a hairline
 * under it, and it stays put so the CV is one glance away at any scroll
 * position. The seal colour marks the current section and the CV, nothing else.
 *
 * Wide screens get the links inline. Below lg a Menu button opens a plain
 * disclosure (aria-expanded, closes on selection and on Escape), which is not a
 * modal, so it needs no focus trap. Only this component writes the URL hash
 * through `useActiveSection`; a second instance would fight it. In Map mode it
 * writes nothing; the open region owns the hash.
 */
export default function Navbar() {
  const { profile, sections, language, t } = useLanguage();
  const { mode, region, canMap, setMode } = useView();
  const { activeId } = useActiveSection(sections, mode === 'read');
  const current = mode === 'map' ? (region ?? 'home') : activeId;
  const switchLabel = mode === 'map' ? t.viewRead : t.viewMap;
  const switchMode = () => setMode(mode === 'map' ? 'read' : 'map');
  const { earn } = usePassport();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const listed = sections.filter((section) => section.id !== 'home');
  const cvLabel = language === 'id' ? 'CV (ID)' : 'CV (EN)';

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-edge bg-void px-6 md:px-10">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-6">
        <a
          href="#home"
          className="inline-flex min-h-11 items-center text-base font-medium tracking-[-0.01em] text-primary"
        >
          {profile.shortName}
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {listed.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={section.id === current ? 'true' : undefined}
                  className={`${LINK} text-muted underline-offset-[10px] hover:text-primary aria-[current=true]:text-primary aria-[current=true]:underline aria-[current=true]:decoration-accent aria-[current=true]:decoration-2`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          {canMap && (
            <button
              type="button"
              onClick={switchMode}
              className={`${LINK} rounded-full border border-edge px-4 text-primary hover:border-primary`}
            >
              {switchLabel}
            </button>
          )}
          <LanguageToggle className="text-primary" />
          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => earn('reach')}
            className={`${LINK} font-medium text-accent underline underline-offset-4`}
          >
            {cvLabel} ↗
          </a>
        </div>

        <button
          ref={toggle}
          type="button"
          aria-label={open ? t.close : t.menu}
          aria-expanded={open}
          aria-controls="mobile-sections"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-9 items-center rounded-full border border-edge px-4 text-sm text-primary lg:hidden"
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-sections"
          aria-label="Sections, mobile"
          className="border-t border-edge pb-5 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center text-primary"
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => earn('reach')}
                className="flex min-h-11 items-center font-medium text-accent"
              >
                {cvLabel} ↗
              </a>
            </li>
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="flex min-h-11 items-center font-medium text-primary"
              >
                {t.emailMe}
              </a>
            </li>
            {canMap && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchMode();
                    setOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center text-left text-primary"
                >
                  {switchLabel}
                </button>
              </li>
            )}
          </ul>
          <div className="mt-3 flex justify-end">
            <LanguageToggle className="text-primary" />
          </div>
        </nav>
      )}
    </header>
  );
}
