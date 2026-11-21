import { useEffect, useRef, type ReactNode, type WheelEvent } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { createWheelStepper, neighbours, type RegionId } from './mapEngine';
import { useView } from './ViewProvider';

const LINK = 'inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4';

/**
 * Wraps the sections. In Reading mode it is `display: contents`, so the page is
 * exactly the page it was; in Map mode it is a drawer on the right (a full-height
 * sheet on a phone) that slides in when a region is open. It is always the same
 * element, so switching mode never remounts a section and loses its filter.
 *
 * Opening it, or stepping to a neighbour, scrolls it to the top and moves focus to
 * the back button; closing it (the button, Escape or the browser's Back) returns
 * focus to the region's label, which `StarMap` does. An open certificate dialog
 * keeps Escape for itself. Scrolling on past either end steps to the neighbour.
 */
export default function MapPanel({ children }: { children: ReactNode }) {
  const { mode, region, close, step } = useView();
  const { t, sections } = useLanguage();
  const back = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stepRef = useRef(step);
  const stepper = useRef<ReturnType<typeof createWheelStepper> | null>(null);
  const map = mode === 'map';
  const open = map && region !== null;
  const near = region ? neighbours(region) : null;
  const name = (id: RegionId) => sections.find((s) => s.id === id)?.label ?? id;

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    stepper.current = createWheelStepper((dir) => stepRef.current(dir), 220);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (panel.current) panel.current.scrollTop = 0;
    back.current?.focus();
  }, [open, region]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // Passive: the panel keeps scrolling natively; only a wheel pushing past an edge counts.
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
    const atEdge =
      (delta > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 2) || (delta < 0 && el.scrollTop <= 0);
    if (open && atEdge) stepper.current?.push(delta, event.timeStamp);
    else stepper.current?.reset();
  };

  return (
    // lg:w-[720px] mirrors PANEL_W and the 1024 px breakpoint in mapEngine's panelWidth: change them together.
    <div
      ref={panel}
      inert={map && !open}
      onWheel={onWheel}
      className={
        map
          ? `fixed top-14 right-0 bottom-0 z-30 w-full overflow-y-auto border-l border-edge bg-void transition-transform duration-300 motion-reduce:transition-none lg:w-[720px] ${
              open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
            }`
          : 'contents'
      }
    >
      {open && near && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-edge bg-void px-6 py-2">
          <button ref={back} type="button" onClick={close} className={LINK}>
            ← {t.backToSky}
          </button>
          <div className="flex gap-4">
            {near.prev && (
              <button type="button" onClick={() => step(-1)} aria-label={t.prevSection(name(near.prev))} className={LINK}>
                ‹<span className="sr-only sm:not-sr-only">&nbsp;{name(near.prev)}</span>
              </button>
            )}
            {near.next && (
              <button type="button" onClick={() => step(1)} aria-label={t.nextSection(name(near.next))} className={LINK}>
                {/* The next section's name stays visible on a phone too: a lone chevron says nothing. */}
                <span>{name(near.next)}&nbsp;</span>›
              </button>
            )}
          </div>
        </div>
      )}
      {children}
      {open && near?.next && (
        <div className="px-6 pt-4 pb-16">
          <button
            type="button"
            onClick={() => step(1)}
            className="inline-flex min-h-11 items-center text-lg font-medium text-primary underline underline-offset-4"
          >
            {t.nextSection(name(near.next))} →
          </button>
        </div>
      )}
    </div>
  );
}
