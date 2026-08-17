import { useEffect, useState } from 'react';

export interface MotionCapability {
  /** The reader has not asked for reduced motion. */
  animate: boolean;
  /** A real pointer that can hover, so hover-only affordances are reachable. */
  hover: boolean;
  /** Worth spending a GPU context on. */
  webgl: boolean;
}

interface NavigatorCapabilities {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: { saveData?: boolean };
}

function read(): MotionCapability {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { animate: false, hover: false, webgl: false };
  }

  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const nav = navigator as Navigator & NavigatorCapabilities;
  const weak =
    nav.connection?.saveData === true ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) ||
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4);

  return { animate, hover, webgl: animate && !weak };
}

/**
 * The single place that decides whether motion runs.
 *
 * Reduced motion has to be honoured everywhere, and gating scattered across
 * components is gating that gets forgotten in one of them. Every motion
 * primitive reads this instead of testing media queries itself.
 */
export function useMotionAllowed(): MotionCapability {
  const [capability, setCapability] = useState<MotionCapability>(() => read());

  useEffect(() => {
    const update = () => setCapability(read());
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(hover: hover) and (pointer: fine)'),
    ];

    update();
    for (const query of queries) query.addEventListener('change', update);
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
  }, []);

  return capability;
}
