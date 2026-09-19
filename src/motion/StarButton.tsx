import type { ReactNode } from 'react';

import StarBorder from '@/components/reactbits/StarBorder/StarBorder';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface StarButtonProps {
  as: 'a' | 'button';
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  download?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

/**
 * A travelling highlight around the page's two primary calls to action.
 *
 * The wrapper is the track and the child is the control: StarBorder keeps only
 * its own overflow and padding, so the button or link inside keeps its radius,
 * colours and hit area through `className` and the two never have to agree.
 *
 * Under reduced motion the control renders bare. A star border that does not
 * travel is not a calmer version of the effect — it is two stray gradients
 * sitting behind the label.
 */
export default function StarButton({
  as,
  children,
  className,
  href,
  type,
  download,
  target,
  rel,
  ariaLabel,
  onClick,
}: StarButtonProps) {
  const { animate } = useMotionAllowed();

  const control =
    as === 'a' ? (
      <a
        href={href}
        download={download}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    ) : (
      <button type={type ?? 'button'} onClick={onClick} className={className}>
        {children}
      </button>
    );

  if (!animate) return control;

  return (
    <StarBorder as="span" color="var(--color-accent)" speed="4s" thickness={1}>
      {control}
    </StarBorder>
  );
}
