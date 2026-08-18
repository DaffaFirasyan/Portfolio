import { act, render, screen } from '@testing-library/react';

import { observers } from '@/test/stubs';
import LiveBorder from './LiveBorder';

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

describe('LiveBorder', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('always renders its content', () => {
    setMotion(false);
    render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );
    expect(screen.getByText('Research Engineer')).toBeInTheDocument();
  });

  it('adds no canvas under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('drops the border once it scrolls out of view but keeps the entry', () => {
    setMotion(true);
    const { container } = render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );

    const record = observers.at(-1);
    if (!record) throw new Error('LiveBorder registered no IntersectionObserver');

    act(() => {
      record.emit([
        { target: [...record.targets][0], isIntersecting: false, intersectionRatio: 0 },
      ]);
    });

    // The border runs a permanent render loop, so it has to leave the DOM.
    expect(container.querySelector('canvas')).toBeNull();
    // Losing the effect must never lose the entry.
    expect(screen.getByText('Research Engineer')).toBeInTheDocument();
  });
});
