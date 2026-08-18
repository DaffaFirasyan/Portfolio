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
   * Makes the robot watch the whole page instead of only its own corner.
   *
   * Spline binds its pointer handling to the canvas it creates, so the scene
   * only ever saw the cursor while the cursor was inside a 528px box at the
   * foot of one column — which reads as a robot that wakes up when you get
   * close and ignores you otherwise. Window events are forwarded onto the
   * canvas so it receives positions from anywhere on the page.
   *
   * The real event is left alone when the pointer is genuinely over the canvas;
   * dispatching a duplicate on top of it is what would make the head jitter.
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
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (inside) return;

      const init = {
        clientX: event.clientX,
        clientY: event.clientY,
        bubbles: false,
        cancelable: true,
      };
      canvas.dispatchEvent(new PointerEvent('pointermove', { ...init, pointerType: 'mouse', isPrimary: true }));
      canvas.dispatchEvent(new MouseEvent('mousemove', init));
    };

    window.addEventListener('pointermove', forward);
    return () => window.removeEventListener('pointermove', forward);
  }, [webgl, hover]);

  if (!webgl || !hover) return null;

  return (
    <div ref={host} aria-hidden="true" className="h-full w-full">
      <Suspense fallback={null}>
        <Spline scene={SCENE} className="!h-full !w-full" />
      </Suspense>
    </div>
  );
}
