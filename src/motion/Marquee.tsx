import { useRef } from 'react';

import ScrollVelocity from '@/components/reactbits/ScrollVelocity/ScrollVelocity';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

interface MarqueeProps {
  text: string;
}

/**
 * A line of text drifting across the foot of the page.
 *
 * This was a curved SVG marquee, and it was replaced because of what it cost
 * in space: 152px of a 281px footer, above a copyright line of 16px. The arc
 * was the reason — bending text through a 120-unit viewBox locks the element
 * to `aspect-[100/12]`, so its height scales with the page width and there is
 * no way to ask for less of it.
 *
 * This one is a plain row, so its height is the type size and nothing more.
 * Its motion is also tied to scrolling rather than running on its own, which
 * is the better answer for something at the bottom of a page: it moves while
 * the reader moves and is still when they stop reading to look.
 *
 * It still unmounts off screen — the animation frame runs regardless of where
 * the reader is.
 *
 * The words are present as ordinary text for assistive technology, and the
 * moving copy is hidden from it: the phrase repeats as many times as it takes
 * to fill the width, which is not something to read aloud.
 *
 * Since this line became the page's copyright it also has to be *seen*, not
 * merely announced, when the drifting copy is not there to show it. The plain
 * line is therefore visible under reduced motion rather than screen-reader
 * only. It keys off `animate` alone and deliberately not off `onScreen`:
 * swapping a 16px static line for a 32px drifting one at the moment the footer
 * enters the viewport would change the footer's height under the reader as
 * they scrolled into it.
 */
export default function Marquee({ text }: MarqueeProps) {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  return (
    <div ref={host}>
      <p
        className={
          animate
            ? 'sr-only'
            : 'mx-auto w-full max-w-[1200px] px-6 font-mono text-xs uppercase tracking-[0.12em] text-muted md:px-12'
        }
      >
        {text}
      </p>

      {animate && onScreen && (
        <div aria-hidden="true" data-marquee>
          <ScrollVelocity
            texts={[`${text} ✦ `]}
            velocity={40}
            damping={40}
            stiffness={300}
            numCopies={6}
            className="font-display text-2xl font-extrabold uppercase tracking-[0.08em] text-edge"
          />
        </div>
      )}
    </div>
  );
}
