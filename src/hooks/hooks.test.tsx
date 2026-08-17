import { act, renderHook } from '@testing-library/react';

import { useMotionAllowed } from './useMotionAllowed';
import { useScrolledPast } from './useScrolledPast';

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
  window.dispatchEvent(new Event('scroll'));
}

function mockMedia(matcher: (query: string) => boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matcher(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('useScrolledPast', () => {
  afterEach(() => setScroll(0));

  it('is false at the top and true past the threshold', () => {
    const { result } = renderHook(() => useScrolledPast(80));
    expect(result.current).toBe(false);

    act(() => setScroll(120));
    expect(result.current).toBe(true);

    act(() => setScroll(10));
    expect(result.current).toBe(false);
  });

  it('stops listening after unmount', () => {
    const { unmount } = renderHook(() => useScrolledPast(80));
    unmount();
    expect(() => setScroll(500)).not.toThrow();
  });
});

describe('useMotionAllowed', () => {
  afterEach(() => mockMedia(() => false));

  it('allows motion when nothing objects', () => {
    mockMedia(() => false);
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.animate).toBe(true);
  });

  it('refuses motion when the reader asked for less of it', () => {
    mockMedia((query) => query.includes('prefers-reduced-motion'));
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.animate).toBe(false);
    expect(result.current.webgl).toBe(false);
  });

  it('reports hover separately from motion', () => {
    mockMedia((query) => query.includes('hover'));
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.hover).toBe(true);
    expect(result.current.animate).toBe(true);
  });

  // The tests above only read the value once, and mockMedia's addEventListener
  // is a no-op — so none of them touch the subscription at all. These two do.
  it('re-reads when the reader turns on reduced motion mid-session', () => {
    const listeners: Array<() => void> = [];
    let reduced = false;

    window.matchMedia = ((query: string) => ({
      get matches() {
        return query.includes('prefers-reduced-motion') ? reduced : false;
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.animate).toBe(true);
    expect(listeners.length).toBeGreaterThan(0);

    reduced = true;
    act(() => {
      for (const fn of listeners) fn();
    });

    expect(result.current.animate).toBe(false);
    expect(result.current.webgl).toBe(false);
  });

  it('removes its listeners on unmount', () => {
    const removed: string[] = [];
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: (type: string) => removed.push(type),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const { unmount } = renderHook(() => useMotionAllowed());
    unmount();
    expect(removed).toEqual(['change', 'change']);
  });
});
