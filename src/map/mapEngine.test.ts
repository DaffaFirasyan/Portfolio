import {
  FLY_MS,
  MAX_ZOOM,
  MIN_ZOOM,
  REGIONS,
  REGION_IDS,
  SEQUENCE,
  WORLD,
  cameraFor,
  clampCamera,
  createWheelStepper,
  figure,
  flyStep,
  frameFor,
  hitRegion,
  labelPosition,
  neighbours,
  overviewCamera,
  panBy,
  projectFigures,
  stepCamera,
  stepFrom,
  traceStep,
  toScreen,
  toWorld,
  zoomAt,
  type Camera,
  type Motion,
} from './mapEngine';

const desktop = { w: 1280, h: 800 };
const phone = { w: 375, h: 700 };
const mid: Camera = { x: 1500, y: 1000, zoom: 1 };

describe('regions', () => {
  it('has one constellation per section, in order', () => {
    expect(REGIONS.map((r) => r.id)).toEqual([...REGION_IDS]);
  });

  it('keeps every constellation well apart and inside the world', () => {
    for (const a of REGIONS) {
      expect(a.x).toBeGreaterThan(0);
      expect(a.x).toBeLessThan(WORLD.w);
      expect(a.y).toBeGreaterThan(0);
      expect(a.y).toBeLessThan(WORLD.h);
      for (const b of REGIONS) {
        if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(300);
      }
    }
  });

  it('draws the same small figure for the same id', () => {
    expect(figure('about')).toEqual(figure('about'));
    expect(figure('about')).not.toEqual(figure('skills'));
    for (const r of REGIONS) {
      expect(r.stars).toHaveLength(6);
      for (const [x, y] of r.stars) expect(Math.hypot(x, y)).toBeLessThanOrEqual(320);
    }
  });
});

describe('camera', () => {
  it('converts between screen and world and back', () => {
    const cam: Camera = { x: 1200, y: 900, zoom: 1.7 };
    const [wx, wy] = toWorld(cam, desktop, 333, 222);
    const [sx, sy] = toScreen(cam, desktop, wx, wy);
    expect(sx).toBeCloseTo(333, 6);
    expect(sy).toBeCloseTo(222, 6);
  });

  it('keeps the point under the pointer still while zooming', () => {
    const before = toWorld(mid, desktop, 900, 300);
    const next = zoomAt(mid, desktop, 900, 300, 1.8);
    const after = toWorld(next, desktop, 900, 300);
    expect(next.zoom).toBeCloseTo(1.8, 6);
    expect(after[0]).toBeCloseTo(before[0], 6);
    expect(after[1]).toBeCloseTo(before[1], 6);
  });

  it('never zooms past its limits', () => {
    expect(zoomAt(mid, desktop, 10, 10, 1000).zoom).toBe(MAX_ZOOM);
    expect(zoomAt(mid, desktop, 10, 10, 0.0001).zoom).toBe(MIN_ZOOM);
  });

  it('keeps the camera centre inside the world', () => {
    const far = clampCamera({ x: -500, y: 99999, zoom: 1 });
    expect(far.x).toBe(0);
    expect(far.y).toBe(WORLD.h);
  });

  it('pans opposite to the drag, scaled by zoom', () => {
    const next = panBy({ x: 1500, y: 1000, zoom: 2 }, 100, -40);
    expect(next.x).toBeCloseTo(1450, 6);
    expect(next.y).toBeCloseTo(1020, 6);
  });
});

describe('flying and inertia', () => {
  const from: Camera = { x: 1000, y: 1000, zoom: 0.5 };
  const to: Camera = { x: 2000, y: 1400, zoom: 2 };

  it('starts at the start, ends at the end and zooms geometrically', () => {
    expect(flyStep(from, to, 0)).toEqual(from);
    const end = flyStep(from, to, 1);
    expect(end.x).toBeCloseTo(to.x, 6);
    expect(end.zoom).toBeCloseTo(to.zoom, 6);
    expect(flyStep(from, to, 0.5).zoom).toBeCloseTo(1, 6);
  });

  it('finishes a flight exactly on the target and clears it', () => {
    const motion: Motion = { vx: 0, vy: 0, fly: { from, to, at: 0, ms: FLY_MS } };
    const mid = stepCamera(from, motion, FLY_MS / 2, 16);
    expect(mid).not.toEqual(from);
    expect(motion.fly).not.toBeNull();
    const done = stepCamera(mid, motion, FLY_MS + 1, 16);
    expect(done).toEqual(to);
    expect(motion.fly).toBeNull();
  });

  it('coasts after a drag and comes to rest', () => {
    const motion: Motion = { vx: 1.2, vy: 0, fly: null };
    let cam: Camera = { x: 1500, y: 1000, zoom: 1 };
    const start = cam.x;
    for (let i = 0; i < 400; i++) cam = stepCamera(cam, motion, i * 16, 16);
    expect(cam.x).toBeLessThan(start);
    expect(motion.vx).toBe(0);
    const rest = cam.x;
    cam = stepCamera(cam, motion, 9999, 16);
    expect(cam.x).toBe(rest);
  });
});

describe('picking', () => {
  it('finds the constellation under a point and nothing far from any', () => {
    const r = REGIONS[3];
    expect(hitRegion(REGIONS, r.x + 20, r.y - 20)?.id).toBe(r.id);
    expect(hitRegion(REGIONS, WORLD.w - 5, 5)).toBeNull();
  });

  it('prefers the nearer of two candidates', () => {
    const a = REGIONS[0];
    const near = hitRegion(REGIONS, a.x + 10, a.y, 2000);
    expect(near?.id).toBe(a.id);
  });
});

describe('placing the view', () => {
  it('puts a region in the middle of the free side when a panel is open', () => {
    const r = REGIONS[1];
    const cam = cameraFor(r, desktop);
    const [sx, sy] = toScreen(cam, desktop, r.x, r.y);
    expect(sx).toBeCloseTo((desktop.w - 720) / 2, 4);
    expect(sy).toBeCloseTo(desktop.h / 2, 4);
  });

  it('centres a region on a phone, where the sheet covers everything', () => {
    const r = REGIONS[1];
    const [sx] = toScreen(cameraFor(r, phone, 1.4), phone, r.x, r.y);
    expect(sx).toBeCloseTo(phone.w / 2, 4);
  });

  it.each([
    ['desktop', desktop],
    ['phone', phone],
  ])('shows all six constellations in the overview on a %s', (_name, view) => {
    const cam = overviewCamera(view);
    for (const r of REGIONS) {
      const [sx, sy] = toScreen(cam, view, r.x, r.y);
      expect(sx, `${r.id} x`).toBeGreaterThan(40);
      expect(sx, `${r.id} x`).toBeLessThan(view.w - 40);
      expect(sy, `${r.id} y`).toBeGreaterThan(90);
      expect(sy, `${r.id} y`).toBeLessThan(view.h - 30);
    }
  });

  it('puts the label under its figure', () => {
    const cam = overviewCamera(desktop);
    const r = REGIONS[0];
    const [sx, sy] = toScreen(cam, desktop, r.x, r.y);
    const [lx, ly] = labelPosition(r, cam, desktop);
    expect(lx).toBeCloseTo(sx, 6);
    expect(ly).toBeGreaterThan(sy);
  });

  it('frames a region when there is one and the overview when there is not', () => {
    expect(frameFor(REGIONS[2], desktop)).toEqual(cameraFor(REGIONS[2], desktop));
    expect(frameFor(undefined, phone)).toEqual(overviewCamera(phone));
  });
});

describe('project figures', () => {
  const ids = ['assetmind', 'village-portal', 'simpel-ibs', 'animart'];
  const projects = REGIONS.find((r) => r.id === 'projects')!;

  it('gives every project its own small figure round the Projects region', () => {
    const figures = projectFigures(ids, projects);
    expect(figures.map((f) => f.id)).toEqual(ids);
    expect(new Set(figures.map((f) => f.stars.join(','))).size).toBe(ids.length);
    for (const f of figures) {
      expect(f.stars).toHaveLength(4);
      for (const [x, y] of f.stars) expect(Math.hypot(x - projects.x, y - projects.y)).toBeLessThan(300);
    }
  });

  it('is the same every time', () => {
    expect(projectFigures(ids, projects)).toEqual(projectFigures(ids, projects));
  });

  it.each([
    ['1280x800', { w: 1280, h: 800 }],
    ['1024x768', { w: 1024, h: 768 }],
  ])('fits every project star into the free sky beside the panel at %s', (_name, view) => {
    const free = view.w - 720;
    const cam = cameraFor(projects, view);
    for (const f of projectFigures(ids, projects)) {
      for (const [x, y] of f.stars) {
        const [sx, sy] = toScreen(cam, view, x, y);
        expect(sx, `${f.id} x`).toBeGreaterThanOrEqual(10);
        expect(sx, `${f.id} x`).toBeLessThanOrEqual(free - 10);
        expect(sy, `${f.id} y`).toBeGreaterThanOrEqual(70);
        expect(sy, `${f.id} y`).toBeLessThanOrEqual(view.h - 10);
      }
    }
  });

  it('keeps zoom 1.6 by default for every other region', () => {
    for (const r of REGIONS.filter((r) => r.id !== 'projects')) {
      expect(cameraFor(r, desktop).zoom).toBe(1.6);
    }
  });

  it('keeps zoom 1.6 for Projects on a phone, and an explicit zoom always wins', () => {
    expect(cameraFor(projects, phone).zoom).toBe(1.6);
    expect(cameraFor(projects, phone, 1.4).zoom).toBe(1.4);
    expect(cameraFor(projects, desktop, 1.2).zoom).toBe(1.2);
  });
});

describe('tracing a figure', () => {
  const stars: Array<[number, number]> = [[0, 0], [100, 0], [100, 100]];

  it('starts only near the first star, then follows the stars in order', () => {
    expect(traceStep(stars, -1, 300, 300)).toBe(-1);
    expect(traceStep(stars, -1, 5, 5)).toBe(0);
    expect(traceStep(stars, 0, 100, 100)).toBe(0);
    expect(traceStep(stars, 0, 98, 3)).toBe(1);
    expect(traceStep(stars, 1, 99, 101)).toBe(2);
  });

  it('stays on the last star once it is reached', () => {
    expect(traceStep(stars, 2, 100, 100)).toBe(2);
  });
});

describe('moving through the sections', () => {
  it('walks the whole sequence forward and back, and stays put at both ends', () => {
    expect(SEQUENCE).toEqual([null, ...REGION_IDS]);
    let at: (typeof SEQUENCE)[number] = null;
    for (const id of REGION_IDS) {
      at = stepFrom(at, 1);
      expect(at).toBe(id);
    }
    expect(stepFrom('contact', 1)).toBe('contact');
    for (const id of [...REGION_IDS].reverse().slice(1)) {
      at = stepFrom(at, -1);
      expect(at).toBe(id);
    }
    expect(stepFrom('about', -1)).toBeNull();
    expect(stepFrom(null, -1)).toBeNull();
  });

  it('names the neighbours: the overview before About, nothing after Contact', () => {
    expect(neighbours('about')).toEqual({ prev: null, next: 'skills' });
    expect(neighbours('projects')).toEqual({ prev: 'experience', next: 'education' });
    expect(neighbours('contact')).toEqual({ prev: 'education', next: undefined });
  });
});

describe('createWheelStepper', () => {
  const make = () => {
    const steps: Array<1 | -1> = [];
    return { steps, stepper: createWheelStepper((d) => steps.push(d), 80) };
  };
  /** A gesture: `delta` px every 16 ms for `ms`, from `start`. Returns the time of its last event. */
  const gesture = (s: ReturnType<typeof make>, start: number, ms: number, delta: number) => {
    let t = start;
    for (; t < start + ms; t += 16) s.stepper.push(delta, t);
    return t - 16;
  };

  it('does nothing below the threshold', () => {
    const s = make();
    s.stepper.push(30, 0);
    s.stepper.push(30, 20);
    expect(s.steps).toEqual([]);
  });

  it('steps once at the threshold, with the sign of the delta', () => {
    const down = make();
    down.stepper.push(80, 0);
    expect(down.steps).toEqual([1]);
    const up = make();
    up.stepper.push(-80, 0);
    expect(up.steps).toEqual([-1]);
  });

  it('gives one step for a long gesture', () => {
    const s = make();
    gesture(s, 0, 2000, 10);
    expect(s.steps).toEqual([1]);
  });

  it('steps again once the wheel has been quiet and 700 ms have passed', () => {
    const s = make();
    const end = gesture(s, 0, 2000, 10);
    expect(s.steps).toHaveLength(1);
    gesture(s, end + 400, 200, 10);
    expect(s.steps).toEqual([1, 1]);
  });

  it('sums deltas that change sign mid-gesture', () => {
    const s = make();
    s.stepper.push(60, 0);
    s.stepper.push(-30, 16);
    expect(s.steps).toEqual([]);
    s.stepper.push(-120, 32);
    expect(s.steps).toEqual([-1]);
  });

  it('forgets the sum on reset', () => {
    const s = make();
    s.stepper.push(60, 0);
    s.stepper.reset();
    s.stepper.push(60, 16);
    expect(s.steps).toEqual([]);
  });
});
