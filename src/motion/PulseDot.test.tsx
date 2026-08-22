import { render } from '@testing-library/react';

import PulseDot from './PulseDot';

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

describe('PulseDot', () => {
  it('is hidden from assistive technology — the date line already says Present', () => {
    setMotion(true);
    const { container } = render(<PulseDot active />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('rings only on the active entry', () => {
    setMotion(true);
    const { container: on } = render(<PulseDot active />);
    const { container: off } = render(<PulseDot />);

    expect(on.querySelector('.animate-pulse-ring')).not.toBeNull();
    expect(off.querySelector('.animate-pulse-ring')).toBeNull();
  });

  it('drops the ring under reduced motion but keeps the entry marked', () => {
    setMotion(false);
    const { container } = render(<PulseDot active />);

    expect(container.querySelector('.animate-pulse-ring')).toBeNull();
    // Colour is what carries the marking when motion is refused.
    expect(container.querySelector('.bg-accent')).not.toBeNull();
  });

  it('uses the quiet colour when it is not the current entry', () => {
    setMotion(true);
    const { container } = render(<PulseDot />);
    expect(container.querySelector('.bg-edge')).not.toBeNull();
    expect(container.querySelector('.bg-accent')).toBeNull();
  });
});
