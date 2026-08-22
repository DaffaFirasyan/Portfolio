import { act, render, screen } from '@testing-library/react';

import { observers } from '@/test/stubs';
import Marquee from './Marquee';

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

describe('Marquee', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('renders nothing that moves under reduced motion', () => {
    setMotion(false);
    const { container } = render(<Marquee text="Open to work" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('keeps the words readable to a screen reader either way', () => {
    setMotion(false);
    render(<Marquee text="Open to work" />);
    expect(screen.getByText(/open to work/i)).toBeInTheDocument();
  });

  it('shows the words on screen under reduced motion, not only to a screen reader', () => {
    // This line carries the page's copyright now, and the drifting copy that
    // normally displays it never mounts under reduced motion. sr-only here
    // would leave the footer visibly empty for anyone who asked for less
    // movement — announced but not shown is not the same as shown.
    setMotion(false);
    render(<Marquee text="Open to work" />);
    expect(screen.getByText(/open to work/i)).not.toHaveClass('sr-only');
  });

  it('hides the plain line while the moving copy is displaying it', () => {
    setMotion(true);
    const { container } = render(<Marquee text="Open to work" />);

    // Queried by element rather than by text: with the marquee mounted the
    // phrase is on the page many times over, once per repeat, which is the
    // very reason the moving copy is aria-hidden.
    expect(container.querySelector('p')).toHaveClass('sr-only');
  });

  it('does not mount the moving copy until the footer is reached', () => {
    // It used to mount on render. The footer is the furthest thing from the
    // fold there is, so that put a scrolling animation into every page load
    // for something nobody could see — measurable in Lighthouse, and the
    // reason `useOnScreen` now takes an explicit starting value.
    setMotion(true);
    const { container } = render(<Marquee text="Open to work" />);
    expect(container.querySelector('[data-marquee]')).toBeNull();
  });

  it('hides the moving copy from assistive technology, because it repeats', () => {
    setMotion(true);
    const { container } = render(<Marquee text="Open to work" />);

    const record = observers.at(-1);
    if (!record) throw new Error('Marquee registered no IntersectionObserver');
    act(() => {
      record.emit([
        { target: [...record.targets][0], isIntersecting: true, intersectionRatio: 1 },
      ]);
    });

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('leaves the DOM once it scrolls out of view', () => {
    setMotion(true);
    const { container } = render(<Marquee text="Open to work" />);

    const record = observers.at(-1);
    if (!record) throw new Error('Marquee registered no IntersectionObserver');

    // Wrapped in act: the observer fires outside React's knowledge, so without
    // it the state update is queued and never flushed before the assertion.
    act(() => {
      record.emit([
        { target: [...record.targets][0], isIntersecting: false, intersectionRatio: 0 },
      ]);
    });

    // A hidden marquee keeps its rAF loop running, so this has to unmount
    // rather than merely hide.
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByText(/open to work/i)).toBeInTheDocument();
  });
});
