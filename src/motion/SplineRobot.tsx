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
 * How far the target may travel left and right of centre, as a fraction of the
 * canvas. This is the head turning, and it is the part worth having.
 *
 * Raise for more movement, lower for a stiffer robot.
 */
const REACH_X = 0.4;

/**
 * The same for up and down — and it is **zero on purpose**.
 *
 * The scene aims its whole upper body at the target, not just the head, so any
 * vertical travel bends the torso. Shrinking that travel was tried twice and
 * failed both times: halving it left the bend plainly visible, because a
 * smaller bend is still a bend. Nothing short of removing the vertical
 * component altogether makes the robot stand straight.
 *
 * With this at 0 the vertical aim is a constant, so the pose cannot lean in
 * response to the cursor at all. The head still follows left and right, which
 * is the movement that reads as "it is watching you".
 */
const REACH_Y = 0;

/**
 * Where that constant vertical aim sits, as a fraction of canvas height from
 * the top. This is the one dial that sets the robot's posture.
 *
 * `0.5` is the canvas centre, which is where a fitted scene puts its camera's
 * eye level, so the robot looks straight ahead. Lower numbers aim higher and
 * tip it back; higher numbers aim lower and tip it forward. If it still leans,
 * this is the only value to change, and 0.05 at a time is a visible step.
 */
const AIM_Y = 0.5;

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
  /**
   * Aims the scene at a viewport position, in the scene's own terms.
   *
   * `fraction` is where the cursor is across the window, 0..1 on each axis.
   * Passing 0.5, 0.5 is the neutral pose, which is what the scene is primed
   * with the moment it loads — see `settle` below.
   */
  const aim = (fractionX: number, fractionY: number) => {
    const canvas = host.current?.querySelector('canvas');
    if (!canvas) return false;

    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return false;

    const x = box.left + box.width / 2 + (fractionX - 0.5) * box.width * REACH_X;
    const y = box.top + box.height * AIM_Y + (fractionY - 0.5) * box.height * REACH_Y;

    const init = { clientX: x, clientY: y, bubbles: false, cancelable: true };
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { ...init, pointerType: 'mouse', isPrimary: true }),
    );
    canvas.dispatchEvent(new MouseEvent('mousemove', init));
    return true;
  };

  useEffect(() => {
    if (!webgl || !hover) return;

    const forward = (event: PointerEvent) => {
      aim(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
    };

    /**
     * Puts the robot into the neutral pose without waiting for the reader to
     * move the mouse.
     *
     * Until a scene is told where the pointer is it holds whatever pose it was
     * authored to idle in, and for this one that idle is the hunched,
     * arms-raised stance. Anyone who loads the page and does not immediately
     * wave the cursor about sees the robot bent over, which is precisely the
     * complaint — and no amount of tuning the *movement* fixes a pose that is
     * showing because no movement has happened yet.
     *
     * The canvas does not exist at mount: the chunk is lazy and Spline builds
     * the canvas after that. So this retries briefly and stops the moment it
     * lands, rather than assuming a timing it does not control.
     */
    let tries = 0;
    const settle = window.setInterval(() => {
      tries += 1;
      if (aim(0.5, 0.5) || tries > 40) window.clearInterval(settle);
    }, 250);

    window.addEventListener('pointermove', forward);
    return () => {
      window.clearInterval(settle);
      window.removeEventListener('pointermove', forward);
    };
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
