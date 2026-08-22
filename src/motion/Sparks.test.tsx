import { act, render, screen } from '@testing-library/react';

import Sparks from './Sparks';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * jsdom's canvas has no 2D context, and ClickSpark bails out of its effect
 * entirely when getContext returns null — so without this the loop never
 * starts and a test about the loop would prove nothing.
 */
function stubCanvas() {
  const ctx = {
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    strokeStyle: '',
    lineWidth: 0,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
}

/** A hand-driven frame clock, so "did it schedule another frame?" is answerable. */
function frameClock() {
  const queue: FrameRequestCallback[] = [];
  let nextId = 1;

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    queue.push(cb);
    return nextId++;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});

  return {
    pending: () => queue.length,
    /** Runs every frame queued so far. Frames they schedule land in the next batch. */
    flush(time: number) {
      const batch = queue.splice(0, queue.length);
      act(() => {
        batch.forEach((cb) => cb(time));
      });
      return batch.length;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Sparks', () => {
  it('always renders whatever it wraps', () => {
    setMotion(false);
    render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('adds no canvas under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('adds a canvas when motion is welcome', () => {
    setMotion(true);
    const { container } = render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('stops scheduling frames once no spark is alive', () => {
    setMotion(true);
    stubCanvas();
    const clock = frameClock();

    render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );

    // One frame on mount, to size and clear the canvas.
    expect(clock.pending()).toBe(1);

    clock.flush(0);

    // Nothing was clicked, so that frame must not have queued another.
    // Upstream re-schedules unconditionally and this would be 1 forever.
    expect(clock.pending()).toBe(0);
  });

  it('starts the loop again on a click, and stops when the sparks expire', () => {
    setMotion(true);
    stubCanvas();
    const clock = frameClock();

    render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    clock.flush(0);
    expect(clock.pending()).toBe(0);

    act(() => {
      screen.getByRole('button', { name: 'Send message' }).click();
    });

    expect(clock.pending()).toBe(1);

    // While sparks are alive it keeps going.
    clock.flush(1);
    expect(clock.pending()).toBe(1);

    // Past the 400ms duration every spark is filtered out, so it idles again.
    //
    // Relative to performance.now(), not an absolute 10_000: ClickSpark stamps
    // each spark with performance.now(), so a fixed timestamp stops being "in
    // the future" once the test process has been alive that long. That made
    // this fail intermittently, and only in full-suite runs.
    clock.flush(performance.now() + 10_000);
    expect(clock.pending()).toBe(0);
  });
});

describe('the colour handed to the canvas', () => {
  it('is a resolved value, never a var() reference', () => {
    setMotion(true);

    let received: string | undefined;

    // Records what the component actually assigns, rather than trusting the
    // prop — the prop can look fine while the canvas discards it.
    const ctx: Record<string, unknown> = {
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      lineWidth: 0,
    };
    Object.defineProperty(ctx, 'strokeStyle', {
      set(value: string) {
        received = value;
      },
      get() {
        return received ?? '';
      },
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );

    const clock = frameClock();
    render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    clock.flush(0);

    act(() => {
      screen.getByRole('button', { name: 'Send message' }).click();
    });
    clock.flush(1);

    expect(received).toBeDefined();
    // Canvas ignores var() silently and keeps the previous value, which is
    // black — invisible against this palette.
    expect(received).not.toMatch(/^var\(/);
    expect(received).toMatch(/^#|^rgb/);
  });
});
