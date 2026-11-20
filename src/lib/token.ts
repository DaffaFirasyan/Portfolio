/** Fallbacks match the dark palette in src/index.css, for the render before styles are applied. */
const FALLBACKS: Record<string, string> = {
  '--color-accent': '#f2c14e',
  '--color-edge': '#2c3358',
  '--color-muted': '#a3a9c9',
  '--color-primary': '#eef0ff',
  '--color-void': '#0c1022',
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
