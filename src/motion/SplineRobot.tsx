import { lazy, Suspense, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * The scene the 21st.dev component points at. Left on Spline's CDN rather than
 * copied into `public/`: it is Spline's own sample asset, and referencing the
 * documented URL is how the component is meant to be used, where rehosting
 * someone else's 3D scene is a different thing to do with it.
 *
 * The consequence is a third-party host in the critical path of this page. If
 * `prod.spline.design` is unreachable the robot never arrives, and there is no
 * error hook to catch that with — `SplineProps` extends the div's HTML
 * attributes, so its `onError` is the DOM media handler and never fires for a
 * failed scene fetch. The box below is reserved at every stage instead, so the
 * failure is an empty space rather than a collapsed layout.
 */
const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * The interactive robot, in the slot the rotating badge used to hold.
 *
 * Costs, measured rather than estimated, because they are the whole story
 * here: the scene alone is 1,349,622 bytes and the runtime package is 2.07 MB
 * compressed, against a page that is otherwise 204 KB gzip in total and a
 * Lighthouse performance score sitting exactly on its 85 threshold. The owner
 * chose this with those numbers in front of them.
 *
 * What that buys is confined as tightly as the choice allows:
 *
 * `webgl && hover` — the same gate the starfield and the splash cursor use,
 * which keeps a phone from spending 1.4 MB on a decoration it cannot rotate,
 * and honours reduced motion, low memory, few cores and Save-Data for free.
 *
 * `useOnScreen` — nothing is requested until the contact section is actually
 * reached. A reader who never scrolls that far never pays for it, and the
 * scene unmounts again on the way out rather than leaving a third WebGL
 * context and its render loop running behind six other sections.
 *
 * `renderOnDemand` — Spline redraws on interaction instead of holding a
 * permanent animation frame loop. This page already runs the starfield and the
 * splash cursor; a third uninterruptible loop is the one cost here that could
 * be avoided outright, so it is.
 *
 * The box is reserved at every stage, so 1.4 MB arriving late moves nothing
 * around it.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none h-[22rem] w-full max-w-[26rem]"
    >
      {webgl && hover && onScreen && (
        <Suspense fallback={null}>
          {/* pointer-events-auto on the scene itself, not on the wrapper: the
              robot is worth turning, but the wrapper is a decorative box and
              must not swallow clicks aimed at anything beside it. */}
          <Spline scene={SCENE} renderOnDemand className="pointer-events-auto !h-full !w-full" />
        </Suspense>
      )}
    </div>
  );
}
