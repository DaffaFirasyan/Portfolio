import { observers } from './stubs';

describe('jsdom stubs', () => {
  it('defines the APIs jsdom is missing', () => {
    expect(typeof globalThis.IntersectionObserver).toBe('function');
    expect(typeof globalThis.ResizeObserver).toBe('function');
    expect(typeof window.matchMedia).toBe('function');
    expect(typeof document.createElement('div').scrollIntoView).toBe('function');
  });

  it('registers each IntersectionObserver so tests can drive it', () => {
    const seen: string[] = [];
    const target = document.createElement('div');
    target.id = 'probe';

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) seen.push((entry.target as HTMLElement).id);
    });
    io.observe(target);

    const registered = observers.at(-1);
    expect(registered).toBeDefined();
    expect(registered!.targets.has(target)).toBe(true);

    registered!.emit([{ target, intersectionRatio: 0.7, isIntersecting: true }]);
    expect(seen).toEqual(['probe']);

    io.disconnect();
    expect(observers).not.toContain(registered);
  });

  it('reports matchMedia queries as not matching by default', () => {
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
    expect(window.matchMedia('(hover: hover) and (pointer: fine)').matches).toBe(false);
  });
});
