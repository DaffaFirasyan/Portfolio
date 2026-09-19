import { lazy, Suspense, useRef } from 'react';

import DecorationBoundary from '@/motion/DecorationBoundary';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const WaveBackground = lazy(() => import('@/components/lightswind/WaveBackground/WaveBackground'));

/**
 * The single WebGL surface behind the hero.
 *
 * Four things must be true at once for it to run: the reader accepts motion,
 * the device looks capable, it has a pointer that hovers, and the backdrop is
 * on screen. The on-screen part matters more than it sounds — a hidden canvas
 * keeps rendering, so hiding it with CSS would leave a GPU loop running for a
 * section nobody is looking at. It is unmounted instead.
 *
 * `hover` was added after measuring, and it is the one that needs explaining
 * because it is not about pointer input. The `webgl` flag tests memory, cores
 * and Save-Data, none of which a phone-emulating audit fakes — so the backdrop
 * was running through every mobile Lighthouse run and, more to the point,
 * through every real phone visit that happened to report enough memory. A
 * continuous WebGL loop on a battery-powered device, for a decoration behind
 * the hero, is the wrong trade; `hover` is the flag that actually separates
 * "a laptop" from "a phone", and it is what already gates the splash cursor
 * and the robot. Phones get the gradient fallback, which is the same thing
 * reduced-motion readers have always seen.
 *
 * WaveBackground sits behind a lazy import so the WebGL code never reaches a visitor whose
 * settings or device rule it out.
 */
export default function Backdrop() {
  const { webgl, hover } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  const fallback = (
    <div
      data-testid="backdrop-fallback"
      className="h-full w-full bg-gradient-to-b from-elevated to-void"
    />
  );

  return (
    <div ref={host} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {webgl && hover ? (
        // If the fluid wave fails, the gradient it falls back to is already
        // written below — so the boundary hands back the same thing the
        // capability gate does, and a reader cannot tell the difference.
        //
        // We pass active={onScreen} so the requestAnimationFrame loop is paused
        // when off-screen, but the WebGL context and compiled shaders are kept ready.
        // This eliminates the 794ms shader compilation freeze on scrolling back up.
        <DecorationBoundary name="wave-background">
          <Suspense fallback={fallback}>
            <WaveBackground
              active={onScreen}
              backdropBlurAmount="sm"
              colors={['#0a0c10', '#111722', '#7b92a8']}
              interactive={hover && onScreen}
              mouseInteraction={hover && onScreen}
            />
          </Suspense>
        </DecorationBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
