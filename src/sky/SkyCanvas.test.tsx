import { useEffect, type ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { ViewProvider, useView } from '@/map/ViewProvider';
import { FLY_MS, REGIONS } from '@/map/mapEngine';
import { PassportProvider, usePassport } from '@/passport/PassportProvider';
import { ALL_STAMPS, STORAGE_KEY } from '@/passport/stamps';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';
import SkyCanvas from './SkyCanvas';

function fakeContext(alpha?: Uint8ClampedArray) {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (prop === 'createLinearGradient') return () => ({ addColorStop() {} });
        if (prop === 'getImageData') return () => ({ data: alpha ?? new Uint8ClampedArray(4) });
        return () => {
          calls.push(prop);
        };
      },
      set: () => true,
    },
  );
  return { ctx, calls };
}

function mockMotion(reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes('reduce'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
}

const tree = (
  <LanguageProvider>
    <PassportProvider>
      <SkillHighlightProvider>
        <SkyCanvas />
      </SkillHighlightProvider>
    </PassportProvider>
  </LanguageProvider>
);

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

/** Captures the loop so a test can run its frames by hand. */
function captureLoop() {
  let callback: FrameRequestCallback | null = null;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    callback = cb;
    return 1;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  return (now: number) => callback?.(now);
}

/** Every performance.now() call advances the clock by `ms`, so a frame's draw costs `ms`. */
function frameCost(ms: number) {
  let clock = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += ms));
}

function Stamps() {
  const { stamps } = usePassport();
  return <p data-testid="stamps">{stamps.join(',')}</p>;
}

const LISTENED = ['scroll', 'resize', 'pointermove', 'pointerup', 'pointercancel'];

describe('SkyCanvas', () => {
  it('renders a decorative canvas and a hidden comet button even without a 2D context', () => {
    const { container } = render(tree);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    const comet = container.querySelector('button');
    expect(comet).toHaveAttribute('hidden');
    expect(comet).toHaveAttribute('aria-label', expect.stringMatching(/shooting star/i));
  });

  it('paints one still frame and starts no loop when motion is reduced', () => {
    const { ctx, calls } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(true);
    const raf = vi.spyOn(window, 'requestAnimationFrame');

    render(tree);

    expect(calls).toContain('arc');
    expect(raf).not.toHaveBeenCalled();
  });

  it('runs the animation loop when motion is welcome', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(false);
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);

    render(tree);

    expect(raf).toHaveBeenCalled();
  });

  describe('with a device pixel ratio of 2', () => {
    let dpr: number;
    beforeEach(() => {
      dpr = window.devicePixelRatio;
      window.devicePixelRatio = 2;
    });
    afterEach(() => {
      window.devicePixelRatio = dpr;
    });

    it('steps down to lite when the drawing work of the first sixty frames is slow', () => {
      const { ctx } = fakeContext();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
      mockMotion(false);
      const run = captureLoop();
      const { container } = render(tree);
      const canvas = container.querySelector('canvas')!;
      expect(canvas.width).toBe(window.innerWidth * 2);

      frameCost(20);
      for (let i = 1; i <= 60; i++) run(i * 16);
      // The first frame is never measured, so sixty frames are one short of a window.
      expect(canvas.width).toBe(window.innerWidth * 2);
      run(61 * 16);

      // Lite draws at a density of 1.
      expect(canvas.width).toBe(window.innerWidth);
    });

    it('keeps full when frames arrive every 33 ms but the work is cheap', () => {
      const { ctx } = fakeContext();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
      mockMotion(false);
      const run = captureLoop();
      const { container } = render(tree);
      const canvas = container.querySelector('canvas')!;

      frameCost(1);
      for (let i = 1; i <= 200; i++) run(i * 33);

      expect(canvas.width).toBe(window.innerWidth * 2);
    });
  });

  it('earns the comet stamp when the shooting star is caught', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(false);
    captureLoop();
    const { container } = render(
      <LanguageProvider>
        <PassportProvider>
          <SkillHighlightProvider>
            <SkyCanvas />
            <Stamps />
          </SkillHighlightProvider>
        </PassportProvider>
      </LanguageProvider>,
    );
    expect(screen.getByTestId('stamps').textContent).toBe('');

    fireEvent.click(container.querySelector('button')!);

    expect(screen.getByTestId('stamps').textContent).toBe('comet');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('["comet"]');
  });

  it('writes the initials in stars once the passport is full', () => {
    // Half the offscreen sample is opaque, so the initials field has dots to draw.
    const alpha = new Uint8ClampedArray(480 * 220 * 4).fill(255, 0, 480 * 110 * 4);
    mockMotion(true);

    const without = fakeContext(alpha);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(without.ctx as never);
    const first = render(tree);
    first.unmount();
    const plainArcs = without.calls.filter((call) => call === 'arc').length;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_STAMPS));
    const full = fakeContext(alpha);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(full.ctx as never);
    expect(() => render(tree)).not.toThrow();
    const fullArcs = full.calls.filter((call) => call === 'arc').length;

    expect(plainArcs).toBeGreaterThan(0);
    expect(fullArcs).toBeGreaterThan(plainArcs);
  });

  it('removes every window listener it added when it unmounts', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(false);
    captureLoop();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const names = (spy: typeof add | typeof remove) =>
      new Set(spy.mock.calls.map(([name]) => name).filter((name) => LISTENED.includes(name)));

    const { unmount } = render(tree);
    expect(names(add)).toEqual(new Set(LISTENED));

    unmount();
    expect(names(remove)).toEqual(names(add));
  });
});

describe('SkyCanvas in Map mode', () => {
  const inViews = (ui: ReactElement, hash = '') => {
    window.history.replaceState(null, '', `/${hash}`);
    localStorage.removeItem('daffa_view');
    return render(
      <LanguageProvider>
        <PassportProvider>
          <ViewProvider>
            <SkillHighlightProvider>{ui}</SkillHighlightProvider>
          </ViewProvider>
        </PassportProvider>
      </LanguageProvider>,
    );
  };

  function Camera() {
    const v = useView();
    return (
      <button
        data-testid="fly"
        onClick={() => v.flyTo({ x: 2000, y: 1400, zoom: 2 })}
        data-x={v.camera.current.x}
      />
    );
  }

  it('draws the six constellations on top of the stars', () => {
    const { ctx, calls } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(true);
    const read = render(
      <LanguageProvider>
        <PassportProvider>
          <SkillHighlightProvider>
            <SkyCanvas />
          </SkillHighlightProvider>
        </PassportProvider>
      </LanguageProvider>,
    );
    const inReading = calls.filter((c) => c === 'arc').length;
    read.unmount();
    calls.length = 0;

    inViews(<SkyCanvas />);
    expect(calls.filter((c) => c === 'arc').length).toBeGreaterThanOrEqual(inReading + REGIONS.length * 6);
  });

  it('draws the four project figures in place of the Projects figure when Projects is open', () => {
    mockMotion(true);
    const arcsWith = (hash: string) => {
      const { ctx, calls } = fakeContext();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
      inViews(<SkyCanvas />, hash).unmount();
      return calls.filter((c) => c === 'arc').length;
    };
    const about = arcsWith('#about');
    expect(arcsWith('#projects')).toBeGreaterThan(about);
  });

  it('draws the lines of every project figure, so they read as constellations', () => {
    mockMotion(true);
    const linesWith = (hash: string) => {
      const { ctx, calls } = fakeContext();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
      inViews(<SkyCanvas />, hash).unmount();
      return calls.filter((c) => c === 'lineTo').length;
    };
    expect(linesWith('#projects')).toBeGreaterThan(linesWith('#about'));
  });

  it('flies the camera to its target over the flight time', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(false);
    const tick = captureLoop();
    const grabbed: Partial<Pick<ReturnType<typeof useView>, 'camera' | 'motion'>> = {};
    function Grab() {
      const { camera, motion } = useView();
      // In an effect: the hooks lint forbids writing outside variables during render.
      useEffect(() => {
        grabbed.camera = camera;
        grabbed.motion = motion;
      }, [camera, motion]);
      return null;
    }
    inViews(
      <>
        <Grab />
        <Camera />
        <SkyCanvas />
      </>,
    );
    act(() => {
      screen.getByTestId('fly').click();
    });
    // The flight is timed from the moment it was queued, so tick from there.
    const at = grabbed.motion!.current.fly!.at;
    for (let t = at; t <= at + FLY_MS + 100; t += 16) tick(t);
    expect(grabbed.camera!.current.x).toBeCloseTo(2000, 3);
    expect(grabbed.camera!.current.zoom).toBeCloseTo(2, 3);
  });

  it('ends a flight on its target when reduced motion is switched on mid-flight', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    // Like mockMotion(false), but the reduced-motion query can be flipped and its listener fired.
    let reduced = false;
    const listeners: Array<() => void> = [];
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          get matches() {
            return reduced && query.includes('reduce');
          },
          media: query,
          addEventListener(_type: string, cb: () => void) {
            if (query.includes('reduce')) listeners.push(cb);
          },
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    const tick = captureLoop();
    const grabbed: Partial<Pick<ReturnType<typeof useView>, 'camera' | 'motion'>> = {};
    function Grab() {
      const { camera, motion } = useView();
      useEffect(() => {
        grabbed.camera = camera;
        grabbed.motion = motion;
      }, [camera, motion]);
      return null;
    }
    inViews(
      <>
        <Grab />
        <Camera />
        <SkyCanvas />
      </>,
    );
    act(() => {
      screen.getByTestId('fly').click();
    });
    const at = grabbed.motion!.current.fly!.at;
    for (let t = at; t <= at + FLY_MS / 2; t += 16) tick(t);
    expect(grabbed.camera!.current.x).not.toBeCloseTo(2000, 0);

    reduced = true;
    act(() => listeners.forEach((cb) => cb()));

    expect(grabbed.camera!.current.x).toBeCloseTo(2000, 3);
    expect(grabbed.camera!.current.y).toBeCloseTo(1400, 3);
    expect(grabbed.camera!.current.zoom).toBeCloseTo(2, 3);
    expect(grabbed.motion!.current.fly).toBeNull();
  });
});
