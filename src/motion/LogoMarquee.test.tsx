import { act, render, screen } from '@testing-library/react';

import { technologies } from '@/data/technologies';
import { observers } from '@/test/stubs';
import LogoMarquee from './LogoMarquee';

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

describe('LogoMarquee', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('names every logo, so the strip is not a row of anonymous shapes', () => {
    setMotion(false);
    render(<LogoMarquee />);
    for (const tech of technologies) {
      expect(screen.getAllByLabelText(tech.name).length).toBeGreaterThan(0);
    }
  });

  it('shows a still row under reduced motion rather than nothing', () => {
    setMotion(false);
    const { container } = render(<LogoMarquee />);

    // The logos are content, not decoration — a reader who refuses motion
    // should still see what the work is built with.
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(
      technologies.length,
    );
  });

  it('leaves the DOM once it scrolls out of view', () => {
    setMotion(true);
    const { container } = render(<LogoMarquee />);

    const record = observers.at(-1);
    if (!record) throw new Error('LogoMarquee registered no IntersectionObserver');

    act(() => {
      record.emit([
        { target: [...record.targets][0], isIntersecting: false, intersectionRatio: 0 },
      ]);
    });

    // It scrolls on requestAnimationFrame, so hiding it would leave the loop
    // running for a section nobody is looking at.
    expect(container.querySelector('[data-marquee]')).toBeNull();
  });
});
