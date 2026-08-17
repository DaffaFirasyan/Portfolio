import { lazy, Suspense, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Galaxy = lazy(() => import('@/components/reactbits/Galaxy/Galaxy'));

/**
 * The single WebGL surface on the page.
 *
 * Three things must be true at once for it to run: the reader accepts motion,
 * the device looks capable, and the backdrop is on screen. The last one matters
 * more than it sounds — a hidden canvas keeps rendering, so hiding it with CSS
 * would leave a GPU loop running for a section nobody is looking at. It is
 * unmounted instead.
 *
 * ogl sits behind a lazy import so the WebGL code never reaches a visitor whose
 * settings or device rule it out.
 */
export default function Backdrop() {
  const { webgl } = useMotionAllowed();
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
      {webgl && onScreen ? (
        <Suspense fallback={fallback}>
          <Galaxy
            density={0.8}
            starSpeed={0.3}
            glowIntensity={0.25}
            saturation={0.2}
            hueShift={200}
            twinkleIntensity={0.4}
            mouseInteraction
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
