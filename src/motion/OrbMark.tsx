import { lazy, Suspense, useRef } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

const Orb = lazy(() => import('@/components/reactbits/Orb/Orb'));

/**
 * The mark at the foot of Contact, where the Spline robot stood.
 *
 * **It replaced 1,463 KB of gzipped JavaScript with about 3.** The robot was a
 * `.splinecode` scene driven by `@splinetool/react-spline`, which pulled nine
 * chunks — `physics` at 733 KB and `react-spline` at 571 KB among them — plus a
 * 1.35 MB scene fetched from `prod.spline.design`, and cost roughly 930ms of
 * main thread and 28 Lighthouse points wherever it ran. It was also Spline's
 * own sample robot, the same asset the demo it came from points at.
 *
 * This is a shader. `ogl` is already in the bundle for `Galaxy`, so the only
 * new code is the orb's own GLSL.
 *
 * **The gate is the same three flags the robot had**, and each earns its place:
 * `animate` because a continuous render loop is exactly what reduced-motion
 * asks you not to run; `webgl` because there is no fallback worth shipping;
 * `hover` because a thing that reacts to a pointer has nothing to react to
 * without one, and because `webgl` alone tests memory and cores, which a
 * phone-emulating audit does not fake — that is how the starfield ended up
 * running through every mobile Lighthouse run.
 *
 * `useOnScreen` is the one thing the robot deliberately did *not* do. The robot
 * mounted once and stayed, because tearing down a Spline scene meant rebuilding
 * a WebGL context and re-running scene setup on every return. A shader has no
 * such setup cost, so this unmounts when it leaves — no GPU loop for a section
 * nobody is looking at.
 *
 * `backgroundColor` is the page's own `--color-void`. The shader *adds* this
 * value rather than compositing against it, so it has to match what the orb
 * sits on or the surrounding glow lifts away from the page.
 */
export default function OrbMark() {
  const { animate, webgl, hover } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  // startVisible false: Contact is the last section on a nine-screen page, so
  // this is below the fold by construction and there is nothing to fail towards
  // by waiting. The 300px margin starts it a little before it arrives, so the
  // shader is already drawing rather than appearing a beat late.
  const onScreen = useOnScreen(host, '300px', false);

  if (!animate || !webgl || !hover) return null;

  return (
    <div ref={host} aria-hidden="true" className="h-full w-full">
      {onScreen && (
        <Suspense fallback={null}>
          <Orb
            // Amber, to land near --color-accent rather than the shader's
            // default cyan. `hue` rotates the whole palette, so this is chosen
            // by looking rather than by converting a token.
            hue={25}
            hoverIntensity={0.35}
            rotateOnHover
            backgroundColor="#0a0c10"
          />
        </Suspense>
      )}
    </div>
  );
}
