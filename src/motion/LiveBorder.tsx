import { useRef, type ReactNode } from 'react';

import ElectricBorder from '@/components/reactbits/ElectricBorder/ElectricBorder';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';
import { cssToken } from '@/lib/token';

interface LiveBorderProps {
  children: ReactNode;
  className?: string;
}

/**
 * A moving border, for the single item that should be read first.
 *
 * The heaviest component on the page after the starfield: a render loop and a
 * ResizeObserver, for one card. Unlike the click sparks it cannot be made to
 * idle — an electric border is motion by definition — so the only honest
 * mitigation is not to run it when nobody is looking.
 *
 * The content sits outside the conditional on purpose. Losing the effect must
 * never lose the entry.
 *
 * The colour is resolved rather than passed as var(): ElectricBorder assigns it
 * to ctx.strokeStyle and also parses it as hex, and canvas silently ignores a
 * CSS variable.
 */
export default function LiveBorder({ children, className }: LiveBorderProps) {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  if (!animate) {
    return (
      <div ref={host} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={host} className={className}>
      {onScreen ? (
        <ElectricBorder
          color={cssToken('--color-accent-2')}
          speed={0.6}
          chaos={0.4}
          borderRadius={12}
        >
          {children}
        </ElectricBorder>
      ) : (
        children
      )}
    </div>
  );
}
