import type { ReactNode } from 'react';

import Magnet from '@/components/reactbits/Magnet/Magnet';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface ChipProps {
  children: ReactNode;
  className?: string;
}

const BASE = 'inline-block rounded-full border border-edge px-3 py-1 text-sm text-muted';

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
export default function Chip({ children, className }: ChipProps) {
  const { animate, hover } = useMotionAllowed();
  const classes = className ? `${BASE} ${className}` : BASE;

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
