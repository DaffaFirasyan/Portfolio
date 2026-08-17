import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';

import { useMotionAllowed } from './useMotionAllowed';

/** Height of the fixed navbar, so an anchor does not land underneath it. */
export const NAV_OFFSET = 80;

export interface SmoothScroll {
  scrollTo: (id: string) => void;
}

/**
 * Smooth scrolling, with a native fallback.
 *
 * Lenis is skipped entirely under reduced motion — hijacking the scroll wheel
 * is exactly what a reader asking for less motion is asking to avoid. The
 * returned scrollTo works either way, so callers never branch on it.
 */
export function useLenis(): SmoothScroll {
  const { animate } = useMotionAllowed();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!animate) return;

    const instance = new Lenis({ duration: 0.9 });
    lenis.current = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
    };
  }, [animate]);

  const scrollTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis.current) {
      lenis.current.scrollTo(target, { offset: -NAV_OFFSET });
      return;
    }

    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  return { scrollTo };
}
