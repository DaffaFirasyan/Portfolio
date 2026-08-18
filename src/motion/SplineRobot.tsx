import { lazy, Suspense } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * The scene the 21st.dev component points at — Spline's own sample robot.
 *
 * Swapping it is a one-line change: publish a scene from Spline's editor, take
 * the `.splinecode` URL it gives you, and put it here. Nothing else in this
 * file cares which scene it is. Editing a scene is not something that can be
 * done from the code side at all: `.splinecode` is a compiled binary the
 * editor emits, not a format to hand-author.
 *
 * The consequence of a remote scene is a third-party host in this page's
 * critical path. If `prod.spline.design` is unreachable the robot never
 * arrives, and there is no error hook to catch that with — `SplineProps`
 * extends the div's HTML attributes, so its `onError` is the DOM media handler
 * and never fires for a failed scene fetch. The frame below is sized
 * independently of its contents, so that failure is an empty panel rather than
 * a collapsed layout.
 */
const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * The interactive robot, in the slot the rotating badge used to hold.
 *
 * **Mounted as soon as the capability gate passes, not on arrival.** It was
 * behind `useOnScreen`, which cost nothing until a reader reached Contact but
 * tore the scene down again on the way out — so scrolling up and back rebuilt
 * a WebGL context and re-ran the whole scene setup every time. The owner asked
 * for it ready before they scroll and stable once it is there, and those are
 * the same requirement: mount once, never unmount.
 *
 * That moves the cost from "readers who reach Contact" to "every desktop
 * reader", which is the trade being made knowingly. What still contains it:
 *
 * `webgl && hover` — the same gate the starfield and the splash cursor use. A
 * phone spends nothing on a decoration it cannot rotate, and reduced motion,
 * low memory, few cores and Save-Data are all honoured through it.
 *
 * `lazy` — still a separate chunk, so it never blocks the initial render, and
 * the 204 KB initial payload is unchanged.
 *
 * `renderOnDemand` — Spline redraws on interaction rather than holding a
 * permanent animation frame loop. With the scene now resident for the whole
 * session rather than only while Contact is on screen, this stopped being an
 * optimisation and became the thing that keeps a third render loop from
 * running behind every section for the entire visit.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();

  return (
    // The frame, not the scene, owns the size. It carries the same
    // rounded-xl/border-edge/bg-surface language as every card on this page, so
    // the robot reads as a panel that belongs to the layout rather than an
    // object floating in the column — and it holds its box whether the scene
    // is loading, failed, or gated off entirely.
    <div
      aria-hidden="true"
      className="pointer-events-none h-[28rem] w-full overflow-hidden rounded-xl border border-edge bg-surface"
    >
      {webgl && hover && (
        <Suspense fallback={null}>
          {/* pointer-events-auto on the scene itself, not on the frame: the
              robot is worth turning, but the frame is decoration and must not
              swallow clicks aimed at anything beside it. */}
          <Spline scene={SCENE} renderOnDemand className="pointer-events-auto !h-full !w-full" />
        </Suspense>
      )}
    </div>
  );
}
