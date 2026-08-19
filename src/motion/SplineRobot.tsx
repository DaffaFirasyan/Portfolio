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

interface Tuning {
  /**
   * Where the constant vertical aim sits, as a fraction of canvas height from
   * the top. This is the dial that sets the robot's posture: lower aims higher
   * and tips it back, higher aims lower and tips it forward.
   */
  aimY: number;
  /**
   * How far the target travels left and right of centre, as a fraction of the
   * canvas. This is the head turning, and it is the part worth having.
   */
  reachX: number;
  /**
   * The same for up and down, and **zero on purpose**. The scene aims its whole
   * upper body at the target, not just the head, so any vertical travel bends
   * the torso. Halving it was tried twice and failed both times, because a
   * smaller bend is still a bend; only removing the vertical component makes
   * the robot stand straight. With this at 0 the pose cannot lean in response
   * to the cursor at all.
   */
  reachY: number;
}

const DEFAULTS: Tuning = { aimY: 0.5, reachX: 0.4, reachY: 0 };

/**
 * Reads the tuning, letting `window.robotAim` override it at runtime.
 *
 * This exists because the posture cannot be judged from code. It is one number
 * against a 3D scene nobody here can see, and two rounds of picking a value,
 * shipping it and asking produced no progress at all.
 *
 * The runtime override closes that loop in seconds instead of round trips, and
 * it sidesteps the trap that most likely wasted the last attempt: editing a
 * constant and reloading does not reliably reload it. Vite's HMR served a stale
 * module twice while this component was being built, each time reporting the
 * previous value and reading exactly like "changing the number does nothing" —
 * which is what the owner reported. Reading through `window` cannot go stale,
 * because it is read fresh on every pointer move.
 *
 * To find the right posture, in the browser console:
 *
 *     robotAim = { aimY: 0.35 }   // then move the mouse; try 0.3 … 0.7
 *
 * Whatever value stands the robot up is the one to write into DEFAULTS.
 */
function tuning(): Tuning {
  const override = (window as unknown as { robotAim?: Partial<Tuning> }).robotAim;
  return override ? { ...DEFAULTS, ...override } : DEFAULTS;
}

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

  useEffect(() => {
    if (!webgl || !hover) return;

    /**
     * Aims the scene at a position given as 0..1 across the window.
     *
     * Spline binds its pointer handling to the canvas it creates, so the scene
     * only ever saw the cursor while the cursor was inside a box at the foot of
     * one column — a robot that wakes when you come close and ignores you
     * otherwise. Window events are forwarded onto the canvas to fix that.
     *
     * Forwarding raw coordinates is what broke the pose: a pointer thousands of
     * pixels outside the canvas is an instruction to bend over backwards, and
     * the cursor is almost always outside it. So the window is *mapped* onto a
     * span of the canvas instead, and the vertical is pinned.
     */
    const aim = (fractionX: number, fractionY: number) => {
      const canvas = host.current?.querySelector('canvas');
      if (!canvas) return false;

      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return false;

      const { aimY, reachX, reachY } = tuning();
      const x = box.left + box.width / 2 + (fractionX - 0.5) * box.width * reachX;
      const y = box.top + box.height * aimY + (fractionY - 0.5) * box.height * reachY;

      const init = { clientX: x, clientY: y, bubbles: false, cancelable: true };
      canvas.dispatchEvent(
        new PointerEvent('pointermove', { ...init, pointerType: 'mouse', isPrimary: true }),
      );
      canvas.dispatchEvent(new MouseEvent('mousemove', init));
      return true;
    };

    const forward = (event: PointerEvent) =>
      aim(event.clientX / window.innerWidth, event.clientY / window.innerHeight);

    /**
     * Puts the robot into the neutral pose without waiting for the reader to
     * move the mouse.
     *
     * Until a scene is told where the pointer is it holds whatever pose it was
     * authored to idle in, and this one idles hunched with its arms up. Anyone
     * who loads the page and does not immediately wave the cursor about sees
     * exactly the reported bend — and no amount of tuning how the robot *moves*
     * fixes a pose that is showing because nothing has moved yet.
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
