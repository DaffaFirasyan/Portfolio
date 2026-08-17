import type { ReactNode } from 'react';

import AnimatedContent from '@/components/reactbits/AnimatedContent/AnimatedContent';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before starting, for staggering siblings. */
  delay?: number;
  className?: string;
}

/**
 * Entrance animation for a block of content.
 *
 * Sections import this rather than React Bits directly — ESLint enforces that
 * — so the reduced-motion decision is made once here instead of in seven
 * places, one of which would eventually forget.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const { animate } = useMotionAllowed();

  // h-full on every wrapper keeps the height chain intact. Wrapping a grid item
  // in one or two divs otherwise breaks `h-full` on the card inside, and the
  // cards in a row stop matching heights — measured at up to 114px apart before
  // this. Against an auto-height parent `height: 100%` computes to auto, so it
  // costs nothing everywhere else.
  const inner = className ? `h-full ${className}` : 'h-full';

  if (!animate) return <div className={inner}>{children}</div>;

  return (
    <AnimatedContent
      distance={40}
      direction="vertical"
      duration={0.6}
      delay={delay}
      className="h-full"
    >
      <div className={inner}>{children}</div>
    </AnimatedContent>
  );
}
