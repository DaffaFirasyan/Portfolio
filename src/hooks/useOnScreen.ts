import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether an element is currently in, or near, the viewport.
 *
 * Defaults to starting true, and the observer only ever turns it off. Anything
 * gated on this is decorative, and starting false means a browser that never
 * delivered an intersection callback silently loses the decoration with nothing
 * to indicate why — failing away from the intended experience rather than
 * towards it.
 *
 * That reasoning came with a condition attached: "callers are elements that are
 * on screen by construction anyway". It held while the only caller was the hero
 * backdrop. It quietly stopped holding when the logo strip in Skills and the
 * footer marquee started using it, and the cost was measurable — both mounted
 * on page load and ran through the whole of it, the strip putting 71 SVGs and a
 * scrolling animation on the page for a section two and a half screens down.
 *
 * So `startVisible` is now explicit rather than assumed. Pass `false` for
 * anything genuinely below the fold: the trade there runs the other way, since
 * the decoration is not visible at load regardless, and every browser this
 * project targets supports IntersectionObserver.
 *
 * The default margin starts work slightly before the element scrolls in, so a
 * canvas is already drawing rather than appearing a beat late.
 */
export function useOnScreen<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = '100px',
  startVisible = true,
): boolean {
  const [onScreen, setOnScreen] = useState(startVisible);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setOnScreen(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return onScreen;
}
