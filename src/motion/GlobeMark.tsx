import { lazy, Suspense, useRef } from 'react';

import DecorationBoundary from '@/motion/DecorationBoundary';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Globe = lazy(() => import('@/components/lightswind/Globe/Globe'));

/**
 * Module scope, so the identity never changes.
 *
 * Inline, this froze the page. `useOnScreen` sets state on every
 * IntersectionObserver callback, so scrolling re-renders this constantly, and a
 * fresh array each time rebuilt the globe — re-sampling a 60,000 point map per
 * scroll tick until the tab stopped responding. `Globe` no longer tears down on
 * a changed marker identity either, so this is belt and braces.
 *
 * Bandung is the city `profile.location` names; Jakarta is where both
 * internships were.
 */
const MARKERS = [
  { location: [-6.9175, 107.6191] as [number, number], size: 0.09 },
  { location: [-6.2088, 106.8456] as [number, number], size: 0.06 },
];

/**
 * The globe at the foot of Contact, where the orb stood.
 *
 * The markers are the two cities on this page rather than decoration: Bandung,
 * which `profile.location` names and where Telkom University is, and Jakarta,
 * where both internships were. A globe with arbitrary dots would be a texture;
 * these two make it say something the page already claims elsewhere.
 *
 * **`enableZoom` is off, and that is not a preference.** The component's wheel
 * handler calls `preventDefault()`, so with zoom on the wheel stops scrolling
 * the page whenever the pointer is over this — on the last section before the
 * footer, on a page using Lenis smooth scroll. Dragging to spin still works,
 * which is the interaction worth having.
 *
 * The gate is the same three flags every other surface here carries: `animate`
 * because a continuous render loop is what reduced-motion asks you not to run,
 * `webgl` because there is no fallback worth shipping, and `hover` because
 * `webgl` alone tests memory and cores, which a phone-emulating audit does not
 * fake — that is how the starfield ended up running through every mobile
 * Lighthouse run.
 */
export default function GlobeMark() {
  const { animate, webgl, hover } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  // Below the fold by construction — Contact is the last section on a
  // nine-screen page — so there is nothing to fail towards by waiting.
  const onScreen = useOnScreen(host, '300px', false);

  if (!animate || !webgl || !hover) return null;

  return (
    <div ref={host} aria-hidden="true" className="h-full w-full">
      {onScreen && (
        <DecorationBoundary name="globe">
          <Suspense fallback={null}>
            <Globe
              // Hex strings, not RGB tuples, for the same identity reason
              // MARKERS is hoisted: every prop here is in the component's effect
              // dependency array.
              baseColor="#2A3340"
              markerColor="#F5A524"
              glowColor="#1A2230"
              markers={MARKERS}
              dark={1}
              diffuse={1.1}
              mapBrightness={4}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.0025}
            />
          </Suspense>
        </DecorationBoundary>
      )}
    </div>
  );
}
