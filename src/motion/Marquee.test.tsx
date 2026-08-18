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

  it('hides the moving copy from assistive technology, because it repeats', () => {
    setMotion(true);
    const { container } = render(<Marquee text="Open to work" />);
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
