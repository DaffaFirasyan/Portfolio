import { lazy, Suspense } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { cssToken } from '@/lib/token';

const Splash = lazy(() => import('@/components/reactbits/SplashCursor/SplashCursor'));

/**
 * A fluid trail that follows the cursor across the whole page.
 *
 * Gated on `webgl` rather than `animate`, which is the stricter of the two:
 * this is a second WebGL context on a page that already spends one on the
 * starfield, and `webgl` is the flag that also rules out a device reporting
 * little memory, few cores, or Save-Data. Gated on `hover` as well, because a
 * cursor effect on a touch screen is a GPU loop drawing something nobody can
 * aim — upstream binds touch handlers precisely so it can smear under a
 * finger, which is not what this is for.
 *
 * Lazy so the 41KB of shader source never reaches a visitor whose settings or
 * device rule it out, the same arrangement `Backdrop` uses for `Galaxy`.
 *
 * No `Suspense` fallback: there is nothing to show while it loads, and a
 * placeholder for a decorative overlay would only be a flash of something.
 */

/**
 * Frozen at module scope on purpose. `SplashCursor`'s effect lists BACK_COLOR
 * in its dependency array, so a fresh object literal on each render would tear
 * the simulation down and rebuild it — including its WebGL context — every
 * time anything above it re-rendered.
 */
const BACK_COLOR = { r: 0, g: 0, b: 0 };

export default function SplashCursor() {
  const { webgl, hover } = useMotionAllowed();

  if (!webgl || !hover) return null;

  return (
    <Suspense fallback={null}>
      <Splash
        // RAINBOW_MODE off is what makes this the site's colour rather than
        // the demo's: with it on, every splat picks a random hue and the page
        // gains a palette it does not own. The component reads COLOR through
        // its own hexToRGB, so the token has to arrive resolved — a raw
        // `var(--color-accent)` would parse to NaN here for the same reason
        // it silently failed on the spark canvas.
        RAINBOW_MODE={false}
        COLOR={cssToken('--color-accent')}
        BACK_COLOR={BACK_COLOR}
        TRANSPARENT
        // Upstream's 1440 is a demo-page number. This runs full-screen behind
        // real content on a page whose Lighthouse performance score has no
        // headroom, so the dye field is halved — the trail is soft-edged and
        // the difference is hard to see, while the fill rate is a quarter.
        DYE_RESOLUTION={720}
        // Fades roughly twice as fast as the default 3.5, so the trail reads
        // as a response to the cursor rather than as paint left on the page.
        DENSITY_DISSIPATION={7}
        // The default 6000 throws fluid clear across the viewport from a small
        // movement, which is the demo being loud. This keeps it near the
        // pointer.
        SPLAT_FORCE={4000}
        SPLAT_RADIUS={0.15}
      />
    </Suspense>
  );
}
