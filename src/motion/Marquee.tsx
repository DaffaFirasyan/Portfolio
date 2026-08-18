import { useRef } from 'react';

import CurvedLoop from '@/components/reactbits/CurvedLoop/CurvedLoop';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

interface MarqueeProps {
  text: string;
}

/**
 * A line of text running along a curve, for the foot of the page.
 *
 * CurvedLoop drives itself from requestAnimationFrame and never idles, so this
 * unmounts it once it is off screen rather than hiding it — the same reason
 * Backdrop and Grain unmount. A marquee scrolling six screens below the reader
 * is work nobody asked for.
 *
 * The words are always present as ordinary text for assistive technology, and
 * the moving copy is hidden from it: the marquee repeats the phrase as many
 * times as it takes to fill the curve, which is not something to read aloud.
 */
export default function Marquee({ text }: MarqueeProps) {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  return (
    <div ref={host}>
      <span className="sr-only">{text}</span>

      {animate && onScreen && (
        <div aria-hidden="true">
          <CurvedLoop
            marqueeText={`${text} ✦ `}
            speed={1}
            curveAmount={120}
            direction="left"
            interactive={false}
            className="fill-edge font-display font-extrabold"
          />
        </div>
      )}
    </div>
  );
}
