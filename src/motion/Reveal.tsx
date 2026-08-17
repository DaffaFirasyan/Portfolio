import type { ReactNode } from 'react';

import AnimatedContent from '@/components/reactbits/AnimatedContent/AnimatedContent';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before starting, for staggering siblings. */
  delay?: number;
  className?: string;
  /**
   * Pass the parent's height through to the child.
   *
   * Only for a Reveal that is itself a grid or flex item whose child needs to
   * match its siblings — a card in a row, typically. Wrapping adds one or two
   * divs between the item and the card, which otherwise breaks `h-full` on the
   * card and leaves a row of uneven cards.
   *
   * It must stay opt-in. Stacked Reveals in a column each become the full
   * height of that column, so a hero with five of them grows to five times its
   * height with the content spread out and overlapping.
   */
  fill?: boolean;
}

/**
 * Entrance animation for a block of content.
 *
 * Sections import this rather than React Bits directly — ESLint enforces that
 * — so the reduced-motion decision is made once here instead of in seven
 * places, one of which would eventually forget.
 */
export default function Reveal({ children, delay = 0, className, fill = false }: RevealProps) {
  const { animate } = useMotionAllowed();

  const classes = [fill ? 'h-full' : '', className].filter(Boolean).join(' ');

  if (!animate) return <div className={classes || undefined}>{children}</div>;

  return (
    <AnimatedContent
      distance={40}
      direction="vertical"
      duration={0.6}
      delay={delay}
      className={fill ? 'h-full' : ''}
    >
      <div className={classes || undefined}>{children}</div>
    </AnimatedContent>
  );
}
