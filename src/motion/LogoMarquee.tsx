import { useRef } from 'react';

import LogoLoop from '@/components/reactbits/LogoLoop/LogoLoop';
import { technologies } from '@/data/technologies';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';
import { cssToken } from '@/lib/token';

/**
 * One logo, drawn from stored path data rather than an image file.
 *
 * `currentColor` is what lets seventeen logos from two different icon sets read
 * as one strip; the viewBox comes from the data because the two sets draw on
 * different grids.
 */
function Logo({ name, viewBox, path }: (typeof technologies)[number]) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={name}
      className="h-8 w-8 fill-current text-muted transition-colors duration-200 hover:text-primary"
    >
      <path d={path} />
    </svg>
  );
}

/**
 * The technologies, as a strip that drifts sideways.
 *
 * Unlike the footer marquee these logos are content rather than decoration, so
 * refusing motion leaves a still row rather than nothing — someone who asked
 * for stillness should still be able to see what the work is built with.
 *
 * It scrolls on requestAnimationFrame, so it unmounts off screen for the same
 * reason the backdrop and the footer marquee do.
 */
export default function LogoMarquee() {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  if (!animate) {
    return (
      <div ref={host}>
        <ul className="flex flex-wrap items-center gap-6">
          {technologies.map((tech) => (
            <li key={tech.name}>
              <Logo {...tech} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={host}>
      {onScreen && (
        <div data-marquee>
          <LogoLoop
            logos={technologies.map((tech) => ({
              node: <Logo {...tech} />,
              title: tech.name,
              ariaLabel: tech.name,
            }))}
            speed={40}
            direction="left"
            logoHeight={32}
            gap={48}
            pauseOnHover
            scaleOnHover
            fadeOut
            // Resolved rather than passed as var(): the component writes this
            // into a gradient it builds in JavaScript.
            fadeOutColor={cssToken('--color-void')}
            ariaLabel="Technologies"
          />
        </div>
      )}
    </div>
  );
}
