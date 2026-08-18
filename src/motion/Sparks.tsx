import type { ReactNode } from 'react';

import ClickSpark from '@/components/reactbits/ClickSpark/ClickSpark';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { cssToken } from '@/lib/token';

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
      // The resolved value, not the reference. ClickSpark assigns this to
      // ctx.strokeStyle, and canvas silently ignores var(): measured in a
      // browser, strokeStyle stays #000000, so the sparks were drawing black
      // on a near-black page and were invisible.
      sparkColor={cssToken('--color-accent')}
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
