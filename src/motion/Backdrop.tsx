import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';

const Galaxy = lazy(() => import('@/components/reactbits/Galaxy/Galaxy'));

/**
 * The single WebGL surface on the page.
 *
 * Three things must be true at once for it to run: the reader accepts motion,
 * the device looks capable, and the backdrop is actually on screen. The last
 * one matters more than it sounds — a hidden canvas keeps rendering, so hiding
 * it with CSS would leave a GPU loop running for a section nobody is looking
 * at. It is unmounted instead.
 *
 * ogl sits behind a lazy import so the WebGL code never reaches a visitor
 * whose settings or device rule it out.
 */
export default function Backdrop() {
  const { webgl } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);

  // Starts true, and the observer only ever turns it off.
  //
  // The backdrop sits behind the hero, which is the top of the page and is
  // therefore on screen by construction. Starting false meant the starfield
  // depended on IntersectionObserver delivering at least one callback — and
  // if it never did, the page silently lost its backdrop with nothing to
  // indicate why. Failing towards the intended experience is the right
  // direction for something purely decorative.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setOnScreen(entry.isIntersecting);
      },
      // Start loading slightly before it scrolls into view, so the starfield is
      // already there rather than appearing a beat late.
      { rootMargin: '100px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
