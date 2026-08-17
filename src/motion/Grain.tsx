import { useRef } from 'react';

import Noise from '@/components/reactbits/Noise/Noise';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

/**
 * A film-grain texture laid over the backdrop.
 *
 * Purely decorative, so it disappears entirely when motion is refused rather
 * than being rendered still — a static grain would only add contrast noise
 * over text for no benefit.
 *
 * It also unmounts once scrolled past, for the same reason the backdrop does:
 * the canvas repaints on a timer whether or not anyone is looking at it, and
 * leaving that running while the reader is three sections away is work nobody
 * asked for.
 */
export default function Grain() {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  if (!animate) return null;

  return (
    <div
      ref={host}
      aria-hidden="true"
      // overflow-hidden is load-bearing. Noise sizes its canvas to the window,
      // not to this host, so on a page with a scrollbar it is ~15px wider than
      // the content area and pushes the whole document sideways. Backdrop
      // clips the same way.
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.035]"
    >
      {onScreen && <Noise patternSize={250} patternAlpha={18} patternRefreshInterval={3} />}
    </div>
  );
}
