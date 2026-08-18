import type { ReactNode } from 'react';

import ClickSpark from '@/components/reactbits/ClickSpark/ClickSpark';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface SparksProps {
  children: ReactNode;
}

/**
 * A burst at the point of a click, over whatever it wraps.
 *
 * The vendored component was edited to stop its render loop when no spark is
 * alive; upstream it re-schedules forever. Without that edit this would cost a
 * cleared canvas and a frame sixty times a second for an effect that lasts
 * 400ms — which is not a trade worth making on a page whose Lighthouse
 * Performance score sits exactly on its threshold.
 */
export default function Sparks({ children }: SparksProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <>{children}</>;

  return (
    <ClickSpark
      sparkColor="var(--color-accent)"
      sparkSize={8}
      sparkRadius={18}
      sparkCount={8}
      duration={400}
      easing="ease-out"
    >
      {children}
    </ClickSpark>
  );
}
