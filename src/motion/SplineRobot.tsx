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
 */
const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Minimal shape of the bits of Spline's `Application` this uses. The package
 * ships types, but they describe the proxy objects loosely, and writing to
 * `rotation` is the whole mechanism here — worth naming precisely.
 */
interface SplineObject {
  rotation: { x: number; y: number; z: number };
}
interface SplineApp {
  findObjectByName(name: string): SplineObject | undefined;
}

/**
 * How far each joint turns, in radians, at the edge of the window.
 *
 * `headYaw` is the effect worth having — the head turning to follow you.
 * `torsoYaw` adds a little shoulder so the turn does not look like a doll's
 * head on a fixed body. Neither tips the robot over, because pitch and roll
 * are forced to zero rather than driven.
 *
 * Overridable at runtime for tuning without a rebuild: in the console,
 * `robotRig = { headYaw: 0.8 }`, then move the mouse.
 */
interface Rig {
  headYaw: number;
  headPitch: number;
  torsoYaw: number;
}
const DEFAULTS: Rig = { headYaw: 0.55, headPitch: 0.12, torsoYaw: 0.18 };

function rig(): Rig {
  const override = (window as unknown as { robotRig?: Partial<Rig> }).robotRig;
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
 * The interactive robot.
 *
 * **The rig is driven directly, and this is the third approach — the first two
 * failed for the same reason.** The scene carries a `lookAt` event, which the
 * Spline runtime services from its own internal event manager. That manager
 * does not read the synthetic pointer events this component was dispatching
 * onto the canvas, which is why forwarding them, then mapping them, then
 * pinning their vertical axis all changed nothing the owner could see: every
 * one of those was tuning an input the scene never consulted. `lookAt` also
 * aims the whole upper body, so while it was in charge the torso bent
 * regardless.
 *
 * `getAllObjects()` shows the rig is addressable — `Bot`, `Top part`, `Head`,
 * `Neck` — and every `rotation` on it is writable. So the pose is set here
 * instead of asked for: each frame the head takes a yaw from the cursor, the
 * torso takes a fraction of it, and **pitch and roll are written to zero**.
 * A body that is assigned zero lean every frame cannot lean, whatever the
 * scene's own event would have done with it.
 *
 * The loop runs after Spline's own, being registered later, so these values
 * are the last written before the frame is drawn.
 *
 * `webgl && hover` gates it, doing double duty: a phone spends nothing on a
 * 1.4 MB decoration, and a cursor-tracking robot has nothing to track without
 * a pointer that hovers.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();
  const app = useRef<SplineApp | null>(null);

  useEffect(() => {
    if (!webgl || !hover) return;

    // -1..1 across the window, so the robot reads the whole page rather than
    // only the corner its canvas occupies.
    let yaw = 0;
    let pitch = 0;

    const onMove = (event: PointerEvent) => {
      yaw = (event.clientX / window.innerWidth - 0.5) * 2;
      pitch = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    let frame = 0;
    const tick = () => {
      const scene = app.current;
      if (scene) {
        const { headYaw, headPitch, torsoYaw } = rig();

        const torso = scene.findObjectByName('Top part');
        if (torso) {
          torso.rotation.y = yaw * torsoYaw;
          // The bend, written out of existence every frame.
          torso.rotation.x = 0;
          torso.rotation.z = 0;
        }

        const head = scene.findObjectByName('Head');
        if (head) {
          head.rotation.y = yaw * headYaw;
          head.rotation.x = pitch * headPitch;
          head.rotation.z = 0;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [webgl, hover]);

  if (!webgl || !hover) return null;

  return (
    // Anchored to the top of the clipping box and centred across it, so the
    // overflow that gets cut is the bottom — the legs — rather than the head.
    <div aria-hidden="true" className={`absolute left-1/2 top-0 -translate-x-1/2 ${CANVAS}`}>
      <Suspense fallback={null}>
        <Spline
          scene={SCENE}
          className="!h-full !w-full"
          onLoad={(scene) => {
            app.current = scene as unknown as SplineApp;
            // A handle for tuning the rig by hand; see `rig()`.
            (window as unknown as { spline?: unknown }).spline = scene;
          }}
        />
      </Suspense>
    </div>
  );
}
