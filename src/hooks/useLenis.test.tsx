import { renderHook } from '@testing-library/react';
import { useLenis } from './useLenis';

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

describe('useLenis', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="about"></section>';
  });

  afterEach(() => mockMedia(() => false));

  it('falls back to native scrolling when the reader asked for reduced motion', () => {
    mockMedia((query) => query.includes('prefers-reduced-motion'));
    const spy = vi.spyOn(document.getElementById('about')!, 'scrollIntoView');

    const { result } = renderHook(() => useLenis());
    result.current.scrollTo('about');

    expect(spy).toHaveBeenCalled();
  });

  it('mounts smooth scrolling when motion is allowed, and scrolls without throwing', () => {
    mockMedia(() => false);

    const { result, unmount } = renderHook(() => useLenis());
    expect(() => result.current.scrollTo('about')).not.toThrow();
    expect(() => unmount()).not.toThrow();
  });

  it('does nothing for an id that is not on the page', () => {
    mockMedia(() => false);
    const { result } = renderHook(() => useLenis());
    expect(() => result.current.scrollTo('nowhere')).not.toThrow();
  });
});
