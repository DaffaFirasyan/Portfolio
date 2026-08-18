import { render, screen } from '@testing-library/react';

import CircularBadge from './CircularBadge';

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

describe('CircularBadge', () => {
  it('renders nothing under reduced motion', () => {
    setMotion(false);
    const { container } = render(<CircularBadge text="Open to work · " />);
    expect(container.firstChild).toBeNull();
  });

  it('is hidden from assistive technology, because it is decoration', () => {
    setMotion(true);
    const { container } = render(<CircularBadge text="Open to work · " />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces nothing, because one span per character reads as gibberish', () => {
    setMotion(true);
    render(<CircularBadge text="Open to work · " />);
    expect(screen.queryByText(/open to work/i)).toBeNull();
  });

  it('lets the caller set the size, rather than the vendored 200px', () => {
    setMotion(true);
    const { container } = render(<CircularBadge text="Open to work · " />);
    const ring = container.querySelector('.rounded-full');

    expect(ring).not.toBeNull();
    expect(ring?.className).not.toMatch(/w-\[200px\]/);
    expect(ring?.className).not.toMatch(/text-white/);
  });

  it('leaves the letters to inherit their size from the ring', () => {
    setMotion(true);
    const { container } = render(<CircularBadge text="Open to work · " />);
    const letter = container.querySelector('.rounded-full span');

    // A font size on the letter would beat anything set on the ring, making
    // the class the wrapper passes do nothing.
    expect(letter?.className).not.toMatch(/text-2xl/);
  });
});
