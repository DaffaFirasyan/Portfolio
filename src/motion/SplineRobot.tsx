import { lazy, Suspense } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * The robot that tracks the cursor.
 *
 * This is back after a detour through an owner-supplied `my.spline.design`
 * public-view URL, which was embedded as an iframe and cost nothing in
 * JavaScript — that route let both `@splinetool` packages be uninstalled
 * entirely. It was reverted because the scene behind that URL does not follow
 * the pointer, and following the pointer is the whole reason this element is
 * on the page: a 3D object that ignores you is a picture.
 *
 * The trade is explicit and was made knowingly. A `.splinecode` asset can only
 * be driven by `@splinetool/react-spline`, so the runtime is reinstalled and
 * its chunk — 571 KB gzip, with feature chunks like `physics` at 734 KB loaded
 * on top if a scene calls for them — is back in the graph. A public-view URL
 * costs zero JavaScript here but can only ever be as interactive as whatever
 * was published into it.
 *
 * Swapping scenes stays one line, and which route it takes follows the URL:
 * a `.splinecode` asset goes here; a `my.spline.design/...` link is an iframe
 * instead and needs neither of these imports.
 */
const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * The interactive robot at the foot of the contact column.
 *
 * No frame. It had a border and a surface background, and framing it made it
 * read as a picture of a robot hung on the page rather than something standing
 * in it.
 *
 * It bleeds into the section's bottom padding so the robot's base meets the
 * footer border, and the offset is not a tuned number: `-mb-20 md:-mb-32` is
 * exactly the `py-20 md:py-32` that `SectionShell` applies, so the two cancel
 * and the box lands on the section's own bottom edge. `overflow-hidden` cuts
 * anything reaching past that line rather than pushing it into the footer,
 * which is what makes standing the robot on the border safe: its feet are
 * allowed to be cut.
 *
 * Mounted as soon as the capability gate passes rather than on arrival, so it
 * is ready before the reader scrolls and is never torn down and rebuilt by
 * scrolling away and back.
 *
 * `webgl && hover` gates it, which is doing double duty here: it keeps a phone
 * from spending 1.4 MB on a decoration, and a cursor-tracking robot has
 * nothing to track without a pointer that hovers.
 *
 * `renderOnDemand` is deliberately **not** set. It is right for a scene that
 * only redraws on interaction; this one follows the pointer continuously, and
 * on-demand rendering is what would make it stutter.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();

  if (!webgl || !hover) return null;

  return (
    <div aria-hidden="true" className="-mb-20 h-[34rem] w-full overflow-hidden md:-mb-32">
      <Suspense fallback={null}>
        <Spline scene={SCENE} className="!h-full !w-full" />
      </Suspense>
    </div>
  );
}
