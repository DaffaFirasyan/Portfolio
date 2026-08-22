import type { ReactNode } from 'react';

import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

const BASE = 'rounded-xl border border-edge bg-surface';

/**
 * The whole hover treatment, beyond the spotlight: two pixels of lift and a
 * warmer edge.
 *
 * Transform and border-colour only, so it composites and cannot reflow the
 * grid under the reader's cursor. Two pixels is deliberate — the card should
 * acknowledge the pointer, not jump at it.
 */
const LIFT =
  'transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40';

/**
 * The card surface used across the site.
 *
 * One component owning the whole hover language is what stops the page
 * accumulating three different card treatments. The cursor spotlight needs a
 * pointer that can hover as well as permission to animate, so a touch device
 * gets the plain card even when motion is allowed.
 */
export default function Surface({ children, className }: SurfaceProps) {
  const { animate, hover } = useMotionAllowed();
  const classes = className ? `${BASE} ${className}` : BASE;

  if (!animate || !hover) return <div className={classes}>{children}</div>;

  return (
    <SpotlightCard className={`${classes} ${LIFT}`} spotlightColor="rgba(240, 163, 46, 0.12)">
      {children}
    </SpotlightCard>
  );
}
