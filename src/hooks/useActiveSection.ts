import { useEffect, useMemo, useRef, useState } from 'react';

import { pickActiveSection, scrollProgress, type SectionVisibility } from '@/lib/scroll';
import type { SectionMeta } from '@/types';

export interface ActiveSection {
  activeId: string;
  progress: number;
}

/**
 * Tracks which section is on screen and how far down the page the reader is.
 *
 * Ratios accumulate in a ref rather than state: the observer reports only the
 * sections that changed, so state would have to be merged on every callback
 * and would re-render for sections the reader cannot see.
 */
export function useActiveSection(sections: SectionMeta[]): ActiveSection {
  const order = useMemo(() => sections.map((section) => section.id), [sections]);
  const [activeId, setActiveId] = useState(order[0] ?? '');
  const [progress, setProgress] = useState(0);
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.intersectionRatio);
        }

        const visibility: SectionVisibility[] = [...ratios.current].map(([id, ratio]) => ({
          id,
          ratio,
        }));

        setActiveId((current) => pickActiveSection(visibility, order, current));
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] },
    );

    for (const id of order) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [order]);

  useEffect(() => {
    let ticking = false;
    let rafId = 0;

    const onScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          setProgress(
            scrollProgress(window.scrollY, document.body.scrollHeight, window.innerHeight),
          );
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    history.replaceState(null, '', `#${activeId}`);
  }, [activeId]);

  return { activeId, progress };
}
