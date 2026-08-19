import { lazy, Suspense, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Galaxy = lazy(() => import('@/components/reactbits/Galaxy/Galaxy'));

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
 * and Save-Data, none of which a phone-emulating audit fakes — so the starfield
 * was running through every mobile Lighthouse run and, more to the point,
 * through every real phone visit that happened to report enough memory. A
 * continuous WebGL loop on a battery-powered device, for a decoration behind
 * the hero, is the wrong trade; `hover` is the flag that actually separates
 * "a laptop" from "a phone", and it is what already gates the splash cursor
 * and the robot. Phones get the gradient fallback, which is the same thing
 * reduced-motion readers have always seen.
 *
 * ogl sits behind a lazy import so the WebGL code never reaches a visitor whose
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
      {webgl && hover && onScreen ? (
        <Suspense fallback={fallback}>
          <Galaxy
            density={0.8}
            starSpeed={0.3}
            glowIntensity={0.25}
            saturation={0.2}
            hueShift={200}
            twinkleIntensity={0.4}
            // The starfield drifts with the pointer. That is a hover-only
            // affordance, so it goes through the same capability gate as
            // everything else rather than attaching a window listener on a
            // touch device that can never use it.
            mouseInteraction={hover}
            mouseRepulsion={false}
            transparent
          />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
