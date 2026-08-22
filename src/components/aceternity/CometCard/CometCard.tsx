import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
/**
 * Vendored from Aceternity, and edited. Installed by hand rather than through
 * `npx shadcn add`, which is what the CLI would have fought: this project has
 * no `components.json`, keeps components under `src/components/` rather than
 * `components/ui/`, has no `@/lib/utils` to hold `cn`, and configures Tailwind
 * v4 from CSS with no JS config for the CLI to edit. Every third-party
 * component here arrives the same way — copied in, read, and owned.
 *
 * It needs no new dependency. `motion/react` is already in the bundle at 39.94
 * KB gzip, eager, for the counters and the rotating role.
 *
 * **This is a tilt-and-glare wrapper, not a card.** It renders `children` and
 * adds spring-smoothed 3D rotation, a lift on hover, and a moving highlight.
 * Whatever card is inside it is the caller's.
 *
 * Three edits:
 *
 * 1. `cn` is gone — one classnames helper is not worth a dependency, and this
 *    project has never had one.
 * 2. `"use client"` is gone. It is a Next.js directive and this is Vite.
 * 3. **The glare is a prop, defaulting far below upstream's.** Upstream paints
 *    white at 0.9 alpha through `mix-blend-overlay` at 0.6 opacity — on a
 *    photograph of a face that is exactly the effect the owner asked to have
 *    turned down once already, in as many words: his skin went white. It is
 *    `glare` here, defaulting to 0.22 of upstream's strength.
 */
export const CometCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  glare = 0.22,
  className,
  children,
}: {
  rotateDepth?: number;
  translateDepth?: number;
  /** 0 removes the highlight; 1 is upstream's, which is far too strong on skin. */
  glare?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`],
  );

  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  // Upstream's alphas were 0.9 and 0.75. Scaled by `glare` so the caller
  // decides, and so the default cannot bleach a face.
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${0.9 * glare}) 10%, rgba(255, 255, 255, ${0.75 * glare}) 20%, rgba(255, 255, 255, 0) 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={['perspective-distant', 'transform-3d', className].filter(Boolean).join(' ')}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          boxShadow:
            "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px",
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{
          scale: 1.05,
          z: 50,
          transition: { duration: 0.2 },
        }}
        className="relative rounded-2xl"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-[16px] mix-blend-overlay"
          style={{
            background: glareBackground,
            opacity: 0.6 * glare,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
};
