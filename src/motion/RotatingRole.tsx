import RotatingText from '@/components/reactbits/RotatingText/RotatingText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface RotatingRoleProps {
  roles: string[];
  className?: string;
}

/**
 * Cycles through job titles, one at a time.
 *
 * The underlying component keeps only the current phrase mounted, so assistive
 * technology hears one title rather than four in a row. With motion refused it
 * settles on the first, which is the one worth leading with anyway.
 *
 * **The width is reserved for the longest title**, and that is a layout fix
 * rather than a stylistic one. Measured on the real page, these four titles
 * render between 103px and 212px wide, so every rotation resized the hero line
 * by up to 109px — a reflow every 2.6 seconds, with no user interaction behind
 * any of it, which is exactly what Cumulative Layout Shift counts. The desktop
 * audit put the hero container at 0.243 against a 0.1 budget.
 *
 * The sizer is the longest role rendered invisibly, not a magic number: both
 * children sit in the same single-cell grid, so the invisible one sets the
 * width and the visible one is laid over it. That keeps working when the roles
 * in `src/data/` change, which a hardcoded width would not.
 */
export default function RotatingRole({ roles, className }: RotatingRoleProps) {
  const { animate } = useMotionAllowed();

  if (!animate || roles.length < 2) return <span className={className}>{roles[0]}</span>;

  const longest = roles.reduce((a, b) => (b.length > a.length ? b : a), roles[0]);

  return (
    <span className="inline-grid align-bottom">
      <span aria-hidden="true" className={`invisible col-start-1 row-start-1 ${className ?? ''}`}>
        {longest}
      </span>
      <RotatingText
        texts={roles}
        rotationInterval={2600}
        mainClassName={`col-start-1 row-start-1 ${className ?? ''}`}
      />
    </span>
  );
}
