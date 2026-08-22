import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface PulseDotProps {
  /** The entry a reader should look at first. */
  active?: boolean;
  className?: string;
}

/**
 * The marker on a timeline rule.
 *
 * The active one breathes: a ring that scales and fades every three seconds.
 * Only transform and opacity, so it composites and costs no main-thread work —
 * which is the whole reason it replaced a canvas border that ran a render loop
 * for as long as its section was on screen.
 *
 * The motion is peripheral by design. A 10px dot at the edge of the column
 * marks the entry without drawing a line around the text someone is reading.
 *
 * Colour carries the marking on its own, so refusing motion loses nothing.
 */
export default function PulseDot({ active = false, className }: PulseDotProps) {
  const { animate } = useMotionAllowed();

  return (
    <span aria-hidden="true" className={`block h-2.5 w-2.5 ${className ?? ''}`}>
      {active && animate && (
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
      )}
      <span
        className={`block h-full w-full rounded-full ${active ? 'bg-accent' : 'bg-edge'}`}
      />
    </span>
  );
}
