import { useEffect, useRef, type ReactNode } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useView } from './ViewProvider';

/**
 * Wraps the sections. In Reading mode it is `display: contents`, so the page is
 * exactly the page it was; in Map mode it is a drawer on the right (a full-height
 * sheet on a phone) that slides in when a region is open. It is always the same
 * element, so switching mode never remounts a section and loses its filter.
 *
 * Opening it moves focus to the back button; closing it (the button, Escape or
 * the browser's Back) returns focus to the region's label, which `StarMap` does.
 * An open certificate dialog keeps Escape for itself.
 */
export default function MapPanel({ children }: { children: ReactNode }) {
  const { mode, region, close } = useView();
  const { t } = useLanguage();
  const back = useRef<HTMLButtonElement>(null);
  const map = mode === 'map';
  const open = map && region !== null;

  useEffect(() => {
    if (open) back.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  return (
    // lg:w-[720px] mirrors PANEL_W and the 1024 px breakpoint in mapEngine's panelWidth: change them together.
    <div
      inert={map && !open}
      className={
        map
          ? `fixed top-14 right-0 bottom-0 z-30 w-full overflow-y-auto border-l border-edge bg-void transition-transform duration-300 motion-reduce:transition-none lg:w-[720px] ${
              open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
            }`
          : 'contents'
      }
    >
      {open && (
        <div className="sticky top-0 z-10 border-b border-edge bg-void px-6 py-2">
          <button
            ref={back}
            type="button"
            onClick={close}
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
          >
            ← {t.backToSky}
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
