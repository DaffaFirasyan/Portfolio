import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether an element is currently in, or near, the viewport.
 *
 * Starts true and the observer only ever turns it off. Anything gated on this
 * is decorative, and starting false would mean a browser that never delivered
 * an intersection callback silently lost the decoration with nothing to
 * indicate why — failing away from the intended experience rather than towards
 * it. Callers are elements that are on screen by construction anyway.
 *
 * The default margin starts work slightly before the element scrolls in, so a
 * canvas is already drawing rather than appearing a beat late.
 */
export function useOnScreen<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = '100px',
): boolean {
  const [onScreen, setOnScreen] = useState(true);

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
