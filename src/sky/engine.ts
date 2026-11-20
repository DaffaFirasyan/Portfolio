export type Tier = 'full' | 'lite' | 'still';

export interface Star {
  /** 0 to 1 across the viewport. */
  x: number;
  y: number;
  /** 0 is the nearest layer: biggest, fastest under scroll. */
  layer: 0 | 1 | 2;
  size: number;
  phase: number;
}

/** How far each layer moves, as a fraction of the scroll distance. */
export const LAYER_SPEED = [0.12, 0.05, 0.02] as const;

const SIZE = [1.8, 1.2, 0.8] as const;

/** mulberry32: small, fast and repeatable, so the sky is the same every visit. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function makeStars(count: number, seed = 7): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const layer = (i % 3) as 0 | 1 | 2;
    return {
      x: rand(),
      y: rand(),
      layer,
      size: SIZE[layer] * (0.7 + 0.6 * rand()),
      phase: rand() * Math.PI * 2,
    };
  });
}

/**
 * The stars of one project's constellation: `length` distinct near-layer stars
 * chosen by the project's id, joined left to right. Same id, same shape.
 */
export function pathFor(projectId: string, stars: Star[], length = 5): number[] {
  const rand = seeded(hash(projectId));
  const pool = stars.flatMap((s, i) => (s.layer === 0 ? [i] : []));
  // An anchor star chosen by the id, then its nearest neighbours: a constellation
  // is a small cluster, not five stars scattered across the whole sky.
  rand(); // the first draw gave two real project ids the same anchor
  const anchor = stars[pool[Math.floor(rand() * pool.length)]];
  const near = pool
    .sort(
      (a, b) =>
        Math.hypot(stars[a].x - anchor.x, stars[a].y - anchor.y) -
        Math.hypot(stars[b].x - anchor.x, stars[b].y - anchor.y),
    )
    .slice(0, Math.min(length, pool.length));
  return near.sort((a, b) => stars[a].x - stars[b].x);
}

export function startTier({
  reducedMotion,
  saveData,
}: {
  reducedMotion: boolean;
  saveData: boolean;
}): Tier {
  if (reducedMotion) return 'still';
  return saveData ? 'lite' : 'full';
}

/** One step down when a window of frames is slow. A tier never moves back up. */
export function nextTier(current: Tier, medianMs: number, limit = 24): Tier {
  if (medianMs <= limit) return current;
  return current === 'full' ? 'lite' : 'still';
}

export function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function cometPosition(
  flight: { x0: number; y0: number; x1: number; y1: number },
  p: number,
): { x: number; y: number } {
  return { x: flight.x0 + (flight.x1 - flight.x0) * p, y: flight.y0 + (flight.y1 - flight.y0) * p };
}

/** Milliseconds until the next comet: 30 to 40 seconds. */
export function nextCometDelay(rand: () => number): number {
  return 30000 + rand() * 10000;
}

// Takes a 6-digit `#rrggbb` only; src/lib/contrast.test.ts enforces that for every `--c-*` token.
/** `#rrggbb` to `rgba(...)`, because a canvas gradient cannot fade a hex colour to transparent. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
