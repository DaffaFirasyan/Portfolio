import { lazy, Suspense, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Globe = lazy(() => import('@/components/lightswind/Globe/Globe'));

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
        <Suspense fallback={null}>
          <Globe
            // Hex strings, not RGB tuples. A tuple literal is a new array on
            // every render, and every prop here is in the effect's dependency
            // array — so tuples would tear down and rebuild the globe on each
            // render, which means re-sampling the map.
            baseColor="#2A3340"
            markerColor="#F5A524"
            glowColor="#1A2230"
            markers={[
              { location: [-6.9175, 107.6191], size: 0.09 }, // Bandung
              { location: [-6.2088, 106.8456], size: 0.06 }, // Jakarta
            ]}
            dark={1}
            diffuse={1.1}
            mapBrightness={4}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.0025}
          />
        </Suspense>
      )}
    </div>
  );
}
