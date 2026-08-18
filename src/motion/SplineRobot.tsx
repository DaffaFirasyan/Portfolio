import { lazy, Suspense, useEffect, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * The robot that tracks the cursor.
 *
 * A `.splinecode` asset, which can only be driven by `@splinetool/react-spline`
 * — 571 KB gzip, plus whatever feature chunks the scene pulls. An owner-supplied
 * `my.spline.design` public-view URL was tried instead and costs zero
 * JavaScript, because it is a self-contained document and embeds as an iframe;
 * it was reverted because the scene behind it does not follow the pointer, and
 * following the pointer is the entire reason this element is on the page.
 *
 * Which route a scene needs is decided by its URL, and one cannot be derived
 * from the other: the id in a share link is not the asset id, and asking
 * `prod.spline.design` for it returns 403.
 */
const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * How far the forwarded target may travel from the canvas centre, as a
 * fraction of the canvas.
 *
 * The scene aims its whole upper body at the pointer, not just the head, and
 * how far it bends is proportional to how far the target sits from centre. At
 * `1` the target reaches the canvas edges, which is the scene's full range and
 * leaves the torso permanently hunched. Lowering it shortens the throw: the
 * head still turns to follow the cursor everywhere on the page, because the
 * whole viewport is still mapped across this span, but the span itself is
 * small enough that the body stays upright.
 *
 * Raise it for more movement, lower it for a stiffer, more upright robot.
 */
const REACH = 0.45;

/**
 * The canvas is deliberately larger than the box it is seen through, and the
 * box clips it.
 *
 * Spline fits the scene to its canvas, so a bigger canvas renders a bigger
 * robot. Giving it far more height than the visible window and anchoring it to
 * the top means the extra goes to the legs, below the crop — which is what
 * allows the head and torso to be large without the whole figure needing room
 * the contact column does not have.
 */
const CANVAS = 'h-[44rem] w-[44rem]';

/**
 * The interactive robot. Fills whatever box its parent gives it — placement is
 * the section's business, not this component's.
 *
 * `webgl && hover` gates it, doing double duty: a phone spends nothing on a
 * 1.4 MB decoration, and a cursor-tracking robot has nothing to track without
 * a pointer that hovers.
 *
 * `renderOnDemand` is deliberately not set. It suits a scene that redraws only
 * on interaction; this one follows the pointer continuously, and on-demand
 * rendering is what would make it stutter.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);

  /**
   * Makes the robot watch the whole page, without asking it to reach for
   * places it cannot reach.
   *
   * Spline binds its pointer handling to the canvas it creates, so the scene
   * only ever saw the cursor while the cursor was inside a 528px box at the
   * foot of one column — a robot that wakes up when you get close and ignores
   * you otherwise. Window events are forwarded onto the canvas to fix that.
   *
   * Forwarding the raw coordinates is what broke the pose. The scene aims at
   * wherever it is told the pointer is, and a pointer several thousand pixels
   * outside its own box is an instruction to bend over backwards and throw
   * both arms up — which is exactly what it did, permanently, because the
   * cursor is almost always outside a box that size.
   *
   * So the viewport is *mapped* onto the canvas rather than passed through:
   * the far left of the window becomes the canvas's left edge, the far right
   * its right edge. The robot still turns to follow the cursor anywhere on the
   * page, but the target it is given never leaves the range the scene was
   * authored for, so the pose stays natural at every position.
   *
   * Every move is forwarded, with no branch for the pointer being over the
   * canvas. That branch existed and was a bug: the wrapper is
   * `pointer-events-none`, so real events never reach the canvas at all, and
   * skipping the synthetic one left a dead patch exactly where the robot is.
   *
   * Both event names are sent because which one the runtime listens for is its
   * own business and not part of any contract this project can rely on.
   */
  useEffect(() => {
    const el = host.current;
    if (!el || !webgl || !hover) return;

    const forward = (event: PointerEvent) => {
      const canvas = el.querySelector('canvas');
      if (!canvas) return;

      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;

      // Viewport position as -0.5..0.5 from its centre, then thrown across
      // REACH of the canvas around the canvas centre. Mapping onto the whole
      // canvas is what kept the torso bent at its limit.
      const fromCentreX = event.clientX / window.innerWidth - 0.5;
      const fromCentreY = event.clientY / window.innerHeight - 0.5;

      const x = box.left + box.width / 2 + fromCentreX * box.width * REACH;
      const y = box.top + box.height / 2 + fromCentreY * box.height * REACH;

      const init = { clientX: x, clientY: y, bubbles: false, cancelable: true };
      canvas.dispatchEvent(
        new PointerEvent('pointermove', { ...init, pointerType: 'mouse', isPrimary: true }),
      );
      canvas.dispatchEvent(new MouseEvent('mousemove', init));
    };

    window.addEventListener('pointermove', forward);
    return () => window.removeEventListener('pointermove', forward);
  }, [webgl, hover]);

  if (!webgl || !hover) return null;

  return (
    // Anchored to the top of the clipping box and centred across it, so the
    // overflow that gets cut is the bottom — the legs — rather than the head.
    <div
      ref={host}
      aria-hidden="true"
      className={`absolute left-1/2 top-0 -translate-x-1/2 ${CANVAS}`}
    >
      <Suspense fallback={null}>
        <Spline scene={SCENE} className="!h-full !w-full" />
      </Suspense>
    </div>
  );
}
