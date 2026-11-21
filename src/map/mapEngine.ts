import { hash, seeded } from '@/sky/engine';

export const WORLD = { w: 3000, h: 2000 } as const;
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3;
export const FLY_MS = 650;
export const PANEL_W = 720;

export const REGION_IDS = ['about', 'skills', 'experience', 'projects', 'education', 'contact'] as const;
export type RegionId = (typeof REGION_IDS)[number];

export interface Camera {
  /** The world point at the centre of the screen. */
  x: number;
  y: number;
  zoom: number;
}
export interface View {
  w: number;
  h: number;
}
export interface Region {
  id: RegionId;
  x: number;
  y: number;
  /** Star offsets from the region's centre, in world units. */
  stars: Array<[number, number]>;
}
export interface Motion {
  /** Screen pixels per millisecond, left over from a drag. */
  vx: number;
  vy: number;
  fly: { from: Camera; to: Camera; at: number; ms: number } | null;
}

const CENTER = { x: 1500, y: 1000 };
const RING = [470, 420, 480, 400, 470, 420];

/**
 * A small constellation: a random walk of `steps` segments, the same for the
 * same id, centred on its own middle. No two ids look alike.
 */
export function figure(id: string, steps = 5, near = 70, far = 120): Array<[number, number]> {
  const rand = seeded(hash(`${id}#figure`));
  const points: Array<[number, number]> = [[0, 0]];
  let angle = rand() * Math.PI * 2;
  for (let i = 0; i < steps; i++) {
    angle += (rand() - 0.5) * 2.2;
    const step = near + rand() * (far - near);
    const [px, py] = points[points.length - 1];
    points.push([px + Math.cos(angle) * step, py + Math.sin(angle) * step]);
  }
  const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return points.map(([x, y]) => [x - cx, y - cy]);
}

/** Six constellations on a ring round the middle of the world, starting at the top. */
export const REGIONS: Region[] = REGION_IDS.map((id, i) => {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return {
    id,
    x: CENTER.x + Math.cos(angle) * RING[i],
    y: CENTER.y + Math.sin(angle) * RING[i],
    stars: figure(id),
  };
});

export const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export function toWorld(cam: Camera, view: View, sx: number, sy: number): [number, number] {
  return [(sx - view.w / 2) / cam.zoom + cam.x, (sy - view.h / 2) / cam.zoom + cam.y];
}

export function toScreen(cam: Camera, view: View, wx: number, wy: number): [number, number] {
  return [(wx - cam.x) * cam.zoom + view.w / 2, (wy - cam.y) * cam.zoom + view.h / 2];
}

export function clampCamera(cam: Camera): Camera {
  return {
    zoom: clampZoom(cam.zoom),
    x: Math.min(WORLD.w, Math.max(0, cam.x)),
    y: Math.min(WORLD.h, Math.max(0, cam.y)),
  };
}

/** Zoom by `factor` keeping the world point under the pointer where it is. */
export function zoomAt(cam: Camera, view: View, sx: number, sy: number, factor: number): Camera {
  const [wx, wy] = toWorld(cam, view, sx, sy);
  const zoom = clampZoom(cam.zoom * factor);
  return clampCamera({
    zoom,
    x: wx - (sx - view.w / 2) / zoom,
    y: wy - (sy - view.h / 2) / zoom,
  });
}

/** Drag the sky by (dx, dy) screen pixels. */
export function panBy(cam: Camera, dx: number, dy: number): Camera {
  return clampCamera({ ...cam, x: cam.x - dx / cam.zoom, y: cam.y - dy / cam.zoom });
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function flyStep(from: Camera, to: Camera, t: number): Camera {
  const e = easeInOut(Math.min(1, Math.max(0, t)));
  return {
    x: from.x + (to.x - from.x) * e,
    y: from.y + (to.y - from.y) * e,
    zoom: from.zoom * (to.zoom / from.zoom) ** e,
  };
}

/** A coast of v * 220 ms at most: a hard flick used to carry the sky 800 px past the finger. */
const decay = (v: number, dt: number) => v * Math.exp(-dt / 220);

/** Fastest coast, in screen pixels per millisecond. */
export const MAX_COAST = 2.5;

/**
 * One frame of camera motion: a flight if there is one, else the coast left over
 * from a drag. Mutates `motion`, returns the next camera (the same object when idle).
 */
export function stepCamera(cam: Camera, motion: Motion, now: number, dt: number): Camera {
  const fly = motion.fly;
  if (fly) {
    const t = (now - fly.at) / fly.ms;
    if (t >= 1) {
      motion.fly = null;
      return { ...fly.to };
    }
    return flyStep(fly.from, fly.to, t);
  }
  if (Math.abs(motion.vx) < 0.01 && Math.abs(motion.vy) < 0.01) {
    motion.vx = 0;
    motion.vy = 0;
    return cam;
  }
  const next = panBy(cam, motion.vx * dt, motion.vy * dt);
  motion.vx = decay(motion.vx, dt);
  motion.vy = decay(motion.vy, dt);
  return next;
}

/** The constellation nearest a world point, if it is within `radius` world units. */
export function hitRegion(regions: Region[], wx: number, wy: number, radius = 130): Region | null {
  let best: Region | null = null;
  let bestDistance = radius;
  for (const region of regions) {
    const distance = Math.hypot(region.x - wx, region.y - wy);
    if (distance <= bestDistance) {
      best = region;
      bestDistance = distance;
    }
  }
  return best;
}

export const panelWidth = (view: View) => (view.w >= 1024 ? PANEL_W : 0);

/**
 * A camera that puts `region` in the middle of the part of the screen the panel leaves free.
 * Beside a panel, Projects is zoomed to fit its ring of project figures (about 550 world units across).
 */
export function cameraFor(region: Region, view: View, zoom?: number): Camera {
  const free = view.w - panelWidth(view);
  zoom ??=
    region.id === 'projects' && panelWidth(view) > 0
      ? Math.min(1.6, Math.max(MIN_ZOOM, (free - 40) / 550))
      : 1.6;
  return clampCamera({ zoom, x: region.x - (free / 2 - view.w / 2) / zoom, y: region.y });
}

/** Every constellation on screen, with the middle of the ring pushed away from the title block. */
export function overviewCamera(view: View): Camera {
  const zoom = clampZoom(Math.min(view.w / 1400, (view.h - 140) / 1400) * 0.95);
  const wide = view.w >= 1024;
  return clampCamera({
    zoom,
    x: CENTER.x - (wide ? (0.14 * view.w) / zoom : 0),
    y: CENTER.y - (wide ? 0 : (0.1 * view.h) / zoom),
  });
}

/** The camera for the open region, or the overview when none is open. */
export const frameFor = (region: Region | undefined, view: View): Camera =>
  region ? cameraFor(region, view) : overviewCamera(view);

/** Where a region's label button goes: centred under its figure. */
export function labelPosition(region: Region, cam: Camera, view: View): [number, number] {
  const [sx, sy] = toScreen(cam, view, region.x, region.y);
  return [sx, sy + Math.min(150, 130 * cam.zoom) + 8];
}

export interface ProjectFigure {
  id: string;
  /** World positions. */
  stars: Array<[number, number]>;
}

/** One small figure per project, set on a ring inside the Projects region. */
export function projectFigures(ids: string[], around: Region): ProjectFigure[] {
  return ids.map((id, i) => {
    const angle = ((45 + (360 / Math.max(ids.length, 1)) * i) * Math.PI) / 180;
    const cx = around.x + Math.cos(angle) * 170;
    const cy = around.y + Math.sin(angle) * 170;
    return {
      id,
      stars: figure(id, 3, 45, 70).map(([x, y]): [number, number] => [cx + x, cy + y]),
    };
  });
}

/**
 * Advance a trace along a figure's stars. `index` is the last star reached
 * (-1: not started). The pointer must come within `tol` of the next star; a
 * trace begins only at the first star and never skips one.
 */
export function traceStep(
  points: Array<[number, number]>,
  index: number,
  px: number,
  py: number,
  tol = 28,
): number {
  const next = index + 1;
  if (next >= points.length) return index;
  const [x, y] = points[next];
  return Math.hypot(x - px, y - py) <= tol ? next : index;
}

/** The order sections are visited in: the overview, then the six regions. */
export const SEQUENCE: Array<RegionId | null> = [null, ...REGION_IDS];

/** The next (dir 1) or previous (dir -1) place in the sequence; the same place at either end. */
export function stepFrom(region: RegionId | null, dir: 1 | -1): RegionId | null {
  const at = SEQUENCE.indexOf(region);
  return SEQUENCE[Math.min(SEQUENCE.length - 1, Math.max(0, at + dir))];
}

/** Where the previous and next buttons lead; undefined means there is no such neighbour (the overview has no previous, Contact has no next). */
export function neighbours(region: RegionId): { prev: RegionId | null; next: RegionId | undefined } {
  const at = SEQUENCE.indexOf(region);
  return { prev: SEQUENCE[at - 1] ?? null, next: SEQUENCE[at + 1] ?? undefined };
}

/**
 * Turns a stream of wheel deltas into one step per gesture. A step needs
 * `threshold` pixels of delta; after it, the stepper stays locked until the
 * wheel has been quiet for 200 ms AND 700 ms have passed, so a trackpad's long
 * inertia tail cannot skip sections. A pause of 300 ms starts a fresh sum.
 * The caller supplies the clock (`now`), which keeps this pure.
 */
export function createWheelStepper(onStep: (dir: 1 | -1) => void, threshold: number) {
  let sum = 0;
  let last = -Infinity;
  let lockedAt = -Infinity;
  let locked = false;
  return {
    push(delta: number, now: number) {
      if (now - last > 300) sum = 0;
      const quiet = now - last > 200;
      last = now;
      if (locked) {
        if (quiet && now - lockedAt > 700) locked = false;
        else return;
      }
      sum += delta;
      if (Math.abs(sum) >= threshold) {
        onStep(sum > 0 ? 1 : -1);
        sum = 0;
        locked = true;
        lockedAt = now;
      }
    },
    reset() {
      sum = 0;
    },
  };
}
