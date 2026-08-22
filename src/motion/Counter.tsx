import CountUp from '@/components/reactbits/CountUp/CountUp';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface CounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

/**
 * A number that counts up when it comes into view.
 *
 * The suffix sits outside the animated span so it never appears mid-count
 * attached to a partial number.
 */
export default function Counter({ value, suffix, className }: CounterProps) {
  const { animate } = useMotionAllowed();

  if (!animate) {
    return (
      <span className={className}>
        {value}
        {suffix ?? ''}
      </span>
    );
  }

  return (
    <span className={className}>
      <CountUp to={value} duration={1.2} />
      {suffix ?? ''}
    </span>
  );
}
