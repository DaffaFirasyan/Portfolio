import CircularText from '@/components/reactbits/CircularText/CircularText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface CircularBadgeProps {
  text: string;
}

/**
 * A ring of rotating text, used as a stamp.
 *
 * It renders one absolutely positioned span per character, which a screen
 * reader would announce letter by letter — so it is aria-hidden, and anything
 * it appears to say has to be said in real text nearby as well. Here that is
 * the hero's status line, which already carries the location and availability.
 *
 * A still ring is just a circle of cramped letters, so under reduced motion it
 * renders nothing rather than a stopped version of itself.
 */
export default function CircularBadge({ text }: CircularBadgeProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <CircularText
        text={text}
        spinDuration={24}
        onHover="slowDown"
        className="h-32 w-32 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted"
      />
    </div>
  );
}
