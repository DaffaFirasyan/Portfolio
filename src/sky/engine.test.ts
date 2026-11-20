import {
  cometPosition,
  makeStars,
  medianOf,
  nextCometDelay,
  nextTier,
  pathFor,
  seeded,
  startTier,
  withAlpha,
} from './engine';

describe('seeded', () => {
  it('repeats for the same seed and differs for another', () => {
    const a = seeded(1);
    const b = seeded(1);
    const c = seeded(2);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seeded(1)()).not.toBe(c());
  });
});

describe('makeStars', () => {
  it('is deterministic', () => {
    expect(makeStars(150)).toEqual(makeStars(150));
  });

  it('keeps stars in the unit square and spreads them over three layers', () => {
    const stars = makeStars(150);
    expect(stars).toHaveLength(150);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThan(1);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThan(1);
    }
    expect(new Set(stars.map((s) => s.layer))).toEqual(new Set([0, 1, 2]));
  });
});

describe('pathFor', () => {
  const stars = makeStars(150);

  it('picks five distinct near-layer stars, left to right', () => {
    const path = pathFor('assetmind', stars);
    expect(path).toHaveLength(5);
    expect(new Set(path).size).toBe(5);
    for (const i of path) expect(stars[i].layer).toBe(0);
    const xs = path.map((i) => stars[i].x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it('is stable per project and differs between projects', () => {
    expect(pathFor('assetmind', stars)).toEqual(pathFor('assetmind', stars));
    expect(pathFor('assetmind', stars)).not.toEqual(pathFor('animart', stars));
  });

  it('gives every real project its own constellation', () => {
    const ids = ['assetmind', 'village-portal', 'simpel-ibs', 'animart'];
    const shapes = ids.map((id) => pathFor(id, stars).join(','));
    expect(new Set(shapes).size).toBe(ids.length);
  });

  it('keeps a constellation compact: every star within a fifth of the sky from its anchor cluster', () => {
    for (const id of ['assetmind', 'village-portal', 'simpel-ibs', 'animart']) {
      const xs = pathFor(id, stars).map((i) => stars[i].x);
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.45);
    }
  });
});

describe('tiers', () => {
  it('starts full, lite on save-data, still on reduced motion', () => {
    expect(startTier({ reducedMotion: false, saveData: false })).toBe('full');
    expect(startTier({ reducedMotion: false, saveData: true })).toBe('lite');
    expect(startTier({ reducedMotion: true, saveData: false })).toBe('still');
    expect(startTier({ reducedMotion: true, saveData: true })).toBe('still');
  });

  it('steps down on a slow median and never back up', () => {
    expect(nextTier('full', 30)).toBe('lite');
    expect(nextTier('lite', 30)).toBe('still');
    expect(nextTier('still', 99)).toBe('still');
    expect(nextTier('full', 16)).toBe('full');
    expect(nextTier('lite', 24)).toBe('lite');
  });

  it('takes the slow limit as a parameter', () => {
    expect(nextTier('full', 10, 8)).toBe('lite');
    expect(nextTier('full', 6, 8)).toBe('full');
    expect(nextTier('lite', 10, 8)).toBe('still');
  });

  it('takes the median of a window', () => {
    expect(medianOf([3, 1, 2])).toBe(2);
    expect(medianOf([1, 2, 3, 4])).toBe(2.5);
    expect(medianOf([])).toBe(0);
  });
});

describe('comet', () => {
  const flight = { x0: 100, y0: 0, x1: 0, y1: 100 };

  it('travels in a straight line from start to end', () => {
    expect(cometPosition(flight, 0)).toEqual({ x: 100, y: 0 });
    expect(cometPosition(flight, 1)).toEqual({ x: 0, y: 100 });
    expect(cometPosition(flight, 0.5)).toEqual({ x: 50, y: 50 });
  });

  it('waits 30 to 40 seconds between flights', () => {
    expect(nextCometDelay(() => 0)).toBe(30000);
    expect(nextCometDelay(() => 0.5)).toBe(35000);
  });
});

describe('withAlpha', () => {
  it('turns a hex colour into rgba', () => {
    expect(withAlpha('#f2c14e', 0.5)).toBe('rgba(242,193,78,0.5)');
  });
});
