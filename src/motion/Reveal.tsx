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

  if (!animate) return <div className={className}>{children}</div>;

  return (
    <AnimatedContent distance={40} direction="vertical" duration={0.6} delay={delay}>
      <div className={className}>{children}</div>
    </AnimatedContent>
  );
}
