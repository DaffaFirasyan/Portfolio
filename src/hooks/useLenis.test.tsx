import { renderHook } from '@testing-library/react';
import { useLenis } from './useLenis';

/** Records every Lenis the module builds, so "exactly one" is assertable. */
const { built } = vi.hoisted(() => ({
  built: [] as Array<{ stopped: boolean; destroyed: boolean }>,
}));

vi.mock('lenis', () => ({
  default: class {
    stopped = false;
    destroyed = false;
    constructor() {
      built.push(this);
    }
    raf() {}
    scrollTo() {}
    stop() {
      this.stopped = true;
    }
    start() {
      this.stopped = false;
    }
    destroy() {
      this.destroyed = true;
    }
  },
}));

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

  it('exposes the scroll lock a modal needs', () => {
    mockMedia(() => false);
    const { result } = renderHook(() => useLenis());

    expect(typeof result.current.stop).toBe('function');
    expect(typeof result.current.start).toBe('function');
    expect(() => {
      result.current.stop();
      result.current.start();
    }).not.toThrow();
  });

  it('leaves stop and start safe to call when smooth scrolling never mounted', () => {
    // Under reduced motion there is no Lenis instance at all, and a modal must
    // still be able to ask for the lock without knowing that.
    mockMedia((query) => query.includes('prefers-reduced-motion'));
    const { result } = renderHook(() => useLenis());

    expect(() => {
      result.current.stop();
      result.current.start();
    }).not.toThrow();
  });
});

describe('the shared instance', () => {
  it('builds one Lenis no matter how many callers there are', () => {
    mockMedia(() => false);
    built.length = 0;

    // Navbar and Dialog both call the hook. Before this was shared they got an
    // instance each, both bound to the same window — so a dialog stopped its
    // own copy while the navbar's kept driving the page behind it.
    const first = renderHook(() => useLenis());
    const second = renderHook(() => useLenis());

    expect(built).toHaveLength(1);

    // Releasing one holder must not destroy the instance the other is using.
    first.unmount();
    expect(built[0].destroyed).toBe(false);

    second.unmount();
    expect(built[0].destroyed).toBe(true);
  });

  it('stops and starts the instance the page is actually using', () => {
    mockMedia(() => false);
    built.length = 0;

    const navbar = renderHook(() => useLenis());
    const dialog = renderHook(() => useLenis());

    dialog.result.current.stop();
    expect(built[0].stopped).toBe(true);

    dialog.result.current.start();
    expect(built[0].stopped).toBe(false);

    dialog.unmount();
    navbar.unmount();
  });

  it('builds a fresh one after every caller has gone', () => {
    mockMedia(() => false);
    built.length = 0;

    renderHook(() => useLenis()).unmount();
    renderHook(() => useLenis()).unmount();

    expect(built).toHaveLength(2);
  });
});
