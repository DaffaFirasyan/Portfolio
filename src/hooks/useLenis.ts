import { useCallback, useEffect } from 'react';
import Lenis from 'lenis';

import { useMotionAllowed } from './useMotionAllowed';

/** Height of the fixed navbar, so an anchor does not land underneath it. */
export const NAV_OFFSET = 80;

export interface SmoothScroll {
  scrollTo: (id: string) => void;
  /**
   * Pause smooth scrolling, for a modal that must not let the page move
   * behind it. A no-op when Lenis never mounted, so callers need not know
   * whether it did.
   */
  stop: () => void;
  /** Resume after a stop. */
  start: () => void;
}

/**
 * One Lenis for the whole page, shared by every caller.
 *
 * This used to be per-hook, and the bug that produced was quiet: `Navbar` and
 * `Dialog` each called the hook, so each got its own instance bound to the same
 * window. Opening a dialog stopped the dialog's copy while the navbar's kept
 * driving the page, so scrolling over an open modal scrolled the page behind
 * it. Refusing motion still means no instance at all.
 */
let instance: Lenis | null = null;
let frame = 0;
let holders = 0;

function acquire(): void {
  holders += 1;
  if (instance) return;

  instance = new Lenis({ duration: 0.9 });

  const raf = (time: number) => {
    instance?.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);
}

function release(): void {
  holders = Math.max(0, holders - 1);
  if (holders > 0 || !instance) return;

  cancelAnimationFrame(frame);
  instance.destroy();
  instance = null;
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

  useEffect(() => {
    if (!animate) return;

    acquire();
    return release;
  }, [animate]);

  const scrollTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (instance) {
      instance.scrollTo(target, { offset: -NAV_OFFSET });
      return;
    }

    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  // Body overflow is locked by the dialog rather than here, so these stay
  // no-ops under reduced motion where there is no instance to pause.
  const stop = useCallback(() => instance?.stop(), []);
  const start = useCallback(() => instance?.start(), []);

  return { scrollTo, stop, start };
}
