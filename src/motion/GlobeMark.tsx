import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import DecorationBoundary from '@/motion/DecorationBoundary';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

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
 * **It cannot appear below 1024px, and that is layout rather than choice.** Its
 * container in Contact is `hidden lg:block`, because Contact only becomes two
 * columns at `lg` — below that there is no left column for an absolutely
 * positioned globe to occupy and it would sit on top of the form. The
 * consequence is worth stating plainly because it looks like a bug: a
 * `display: none` ancestor has zero area, an element with zero area never
 * reports as intersecting, so the observer below **never fires** and the globe
 * never mounts. On a browser window even one pixel under 1024 it is simply
 * absent, with nothing logged and nothing broken.
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
  const [ready, setReady] = useState(false);

  /**
   * Mounts once on approach and never unmounts, and that is a leak fix rather
   * than a preference.
   *
   * `useOnScreen` was here first, and it toggles — so scrolling past Contact
   * and back unmounted and remounted the globe, and React hands a *new*
   * `<canvas>` to each mount. **cobe never releases its WebGL context**: its
   * `destroy()` stops the render loop, and `loseContext` appears nowhere in
   * the package, verified rather than assumed. So every remount stranded a
   * live context on a discarded canvas until the browser began evicting the
   * oldest — measured on the built page as "Too many active WebGL contexts",
   * with Galaxy's and the film grain's contexts already dead while the page
   * still looked fine.
   *
   * Latching `ready` means one canvas and one context for the life of the
   * page. The observer disconnects on the first hit, so it stops costing
   * callbacks too. `SplineRobot` reached this same shape for this same reason.
   *
   * Releasing the context in cleanup was the other candidate repair, and it is
   * the one this project has already been burnt by: `SplashCursor` called
   * `loseContext()` on a canvas React reuses across StrictMode's
   * mount/cleanup/mount, and the second mount got a dead context and drew
   * nothing for the life of the page.
   */
  useEffect(() => {
    if (!animate || !webgl || !hover) return;
    const el = host.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, webgl, hover]);

  if (!animate || !webgl || !hover) return null;

  return (
    <div ref={host} aria-hidden="true" className="h-full w-full">
      {ready && (
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
