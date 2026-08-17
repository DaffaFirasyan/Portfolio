import Noise from '@/components/reactbits/Noise/Noise';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

/**
 * A film-grain texture laid over the backdrop.
 *
 * Purely decorative, so it disappears entirely when motion is refused rather
 * than being rendered still — a static grain would only add contrast noise
 * over text for no benefit.
 */
export default function Grain() {
  const { animate } = useMotionAllowed();

  if (!animate) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]">
      <Noise patternSize={250} patternAlpha={18} patternRefreshInterval={3} />
    </div>
  );
}
