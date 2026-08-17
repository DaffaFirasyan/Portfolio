import type { ReactNode } from 'react';

import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

const BASE = 'rounded-xl border border-edge bg-surface';

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
    <SpotlightCard className={classes} spotlightColor="rgba(240, 163, 46, 0.12)">
      {children}
    </SpotlightCard>
  );
}
