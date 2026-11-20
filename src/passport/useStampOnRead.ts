import { useEffect, useRef } from 'react';

import { usePassport } from './PassportProvider';
import { DWELL_MS, isStampId } from './stamps';

/** Past the reader's eye line: the bottom edge is above mid-screen, or the page can scroll no further. */
export function hasPassed(bottom: number, viewportHeight: number, atEnd: boolean): boolean {
  return atEnd || bottom < viewportHeight * 0.5;
}

/**
 * Stamps a section when it has been near the middle of the screen for five
 * seconds in total and the reader has then scrolled past it. A quick flick
 * through the page earns nothing; the last section counts the end of the page
 * as "past", because nothing can scroll above it.
 *
 * "Near the middle" is a band across the centre of the viewport rather than a
 * share of the section, so a section three screens tall counts as readily as a
 * short one.
 */
export function useStampOnRead<T extends HTMLElement>(id: string) {
  const { earn, has } = usePassport();
  const ref = useRef<T>(null);
  const earned = has(id);

  useEffect(() => {
    const el = ref.current;
    if (!el || earned || !isStampId(id)) return;

    let dwelled = 0;
    let since = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      if (dwelled < DWELL_MS) return;
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (hasPassed(el.getBoundingClientRect().bottom, window.innerHeight, atEnd)) earn(id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        if (visible && !since) {
          since = Date.now();
          timer = setTimeout(() => {
            dwelled = DWELL_MS;
            check();
          }, DWELL_MS - dwelled);
        } else if (!visible && since) {
          clearTimeout(timer);
          dwelled += Date.now() - since;
          since = 0;
          check();
        }
      },
      { rootMargin: '-35% 0px -35% 0px' },
    );

    observer.observe(el);
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', check);
      clearTimeout(timer);
    };
  }, [earned, earn, id]);

  return ref;
}
