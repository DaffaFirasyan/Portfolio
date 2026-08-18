/** Fallbacks match src/index.css, for the render before styles are applied. */
const FALLBACKS: Record<string, string> = {
  '--color-accent': '#f0a32e',
  '--color-accent-2': '#5ec8d8',
  '--color-edge': '#232c38',
  '--color-muted': '#8a97a6',
};

/**
 * The computed value of a design token, as a colour a canvas can use.
 *
 * Canvas 2D silently ignores `ctx.strokeStyle = 'var(--color-accent)'` and
 * keeps whatever was there before, which is black by default. Measured in a
 * browser: assigning the var leaves strokeStyle at #000000, so anything drawn
 * with it is invisible against this palette. Components that paint to a canvas
 * therefore need the resolved value, not the reference.
 *
 * CSS keeps the single source of truth; this only reads it.
 */
export function cssToken(name: string): string {
  const fallback = FALLBACKS[name] ?? '#ffffff';
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
