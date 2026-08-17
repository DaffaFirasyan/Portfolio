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
 */
export default function RotatingRole({ roles, className }: RotatingRoleProps) {
  const { animate } = useMotionAllowed();

  if (!animate || roles.length < 2) return <span className={className}>{roles[0]}</span>;

  return <RotatingText texts={roles} rotationInterval={2600} mainClassName={className} />;
}
