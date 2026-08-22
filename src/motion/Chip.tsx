import type { ReactNode } from 'react';

import Magnet from '@/components/reactbits/Magnet/Magnet';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface ChipProps {
  children: ReactNode;
  className?: string;
  /**
   * `sm` is the metadata variant — stack tags and certificate badges, which sit
   * below the skill names in the hierarchy.
   *
   * It is a prop rather than a class the caller passes because size utilities
   * collide: `text-xs` and `text-sm` have equal specificity, so which one wins
   * depends on their order in the stylesheet rather than in the class
   * attribute. Overriding from outside would work by luck.
   */
  size?: 'md' | 'sm';
}

const SIZES = {
  md: 'px-3 py-1 text-sm',
  sm: 'px-2.5 py-0.5 font-mono text-xs',
} as const;

/**
 * A tag pill that leans towards the cursor.
 *
 * Skills, stack tags and certificate badges all use this, so the pill styling
 * lives here rather than being retyped at four call sites where it would slowly
 * drift apart.
 *
 * The attraction needs a pointer that can hover as well as permission to
 * animate — on a touch screen it has nothing to follow — so a touch device gets
 * the plain pill and none of the wrapper markup.
 */
export default function Chip({ children, className, size = 'md' }: ChipProps) {
  const { animate, hover } = useMotionAllowed();
  const classes = ['inline-block rounded-full border border-edge text-muted', SIZES[size], className]
    .filter(Boolean)
    .join(' ');

  // Magnet has a `disabled` prop, which looks like the tidier way to express
  // this. It is not: disabled or not, it still renders its two wrapper divs, so
  // the touch path would carry markup that exists only to do nothing. There are
  // dozens of chips on this page.
  if (!animate || !hover) return <span className={classes}>{children}</span>;

  return (
    <Magnet padding={30} magnetStrength={8} innerClassName={classes}>
      {children}
    </Magnet>
  );
}
