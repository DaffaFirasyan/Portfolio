import { render } from '@testing-library/react';

import Globe from './Globe';

/**
 * The regression this file exists for froze the page.
 *
 * `markers` sits in the component's effect dependency array, and callers write
 * it as an inline array literal — a new identity every render. Rebuilding the
 * globe means `createGlobe` re-sampling `mapSamples` points, and on the page
 * `useOnScreen` re-renders on every IntersectionObserver callback, so scrolling
 * into Contact rebuilt a 60,000 point map per scroll tick until the tab stopped
 * responding.
 *
 * Nothing threw and nothing logged. Only counting the builds catches it.
 */
const destroy = vi.fn();
const createGlobe = vi.fn(() => ({ destroy }));

vi.mock('cobe', () => ({ default: () => createGlobe() }));

beforeEach(() => {
  createGlobe.mockClear();
  destroy.mockClear();
});

describe('Globe', () => {
  it('builds the globe once, however many times it is re-rendered', () => {
    const { rerender } = render(<Globe markers={[{ location: [0, 0], size: 0.1 }]} />);
    expect(createGlobe).toHaveBeenCalledTimes(1);

    // A fresh literal each time, exactly as a caller writes it — and exactly
    // what the page was doing on every scroll tick.
    for (let i = 0; i < 5; i += 1) {
      rerender(<Globe markers={[{ location: [0, 0], size: 0.1 }]} />);
    }

    expect(
      createGlobe,
      'the globe was rebuilt on re-render — markers is being compared by identity again',
    ).toHaveBeenCalledTimes(1);
  });

  it('does rebuild when the markers genuinely change', () => {
    const { rerender } = render(<Globe markers={[{ location: [0, 0], size: 0.1 }]} />);
    expect(createGlobe).toHaveBeenCalledTimes(1);

    // The fix must not go so far that real changes stop applying.
    rerender(<Globe markers={[{ location: [10, 20], size: 0.2 }]} />);
    expect(createGlobe).toHaveBeenCalledTimes(2);
  });

  it('tears the globe down when it unmounts', () => {
    const { unmount } = render(<Globe markers={[]} />);
    unmount();
    expect(destroy).toHaveBeenCalled();
  });
});
