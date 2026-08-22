import { render, screen } from '@testing-library/react';
import Chip from './Chip';

function setMotion({ animate, hover = true }: { animate: boolean; hover?: boolean }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Chip', () => {
  it('renders its label whether or not motion is allowed', () => {
    setMotion({ animate: false });
    render(<Chip>TypeScript</Chip>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('leans towards the cursor when motion and a pointer are both available', () => {
    setMotion({ animate: true, hover: true });
    const { container } = render(<Chip>TypeScript</Chip>);
    expect(container.querySelector('[data-magnet]')).not.toBeNull();
  });

  it('drops the attraction on a touch device, which has no cursor to follow', () => {
    setMotion({ animate: true, hover: false });
    const { container } = render(<Chip>TypeScript</Chip>);
    expect(container.querySelector('[data-magnet]')).toBeNull();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('drops it under reduced motion too', () => {
    setMotion({ animate: false, hover: true });
    const { container } = render(<Chip>TypeScript</Chip>);
    expect(container.querySelector('[data-magnet]')).toBeNull();
  });

  it('carries the same pill styling on both paths', () => {
    for (const [animate, hover] of [
      [true, true],
      [false, true],
    ] as const) {
      setMotion({ animate, hover });
      const { container, unmount } = render(<Chip>TypeScript</Chip>);

      expect(container.textContent).toBe('TypeScript');
      // The styling lives in one place, so it must survive both branches.
      expect(container.innerHTML).toContain('rounded-full');
      expect(container.innerHTML).toContain('border-edge');
      unmount();
    }
  });

  it('accepts extra classes without losing the base styling', () => {
    setMotion({ animate: false });
    const { container } = render(<Chip className="font-mono">TypeScript</Chip>);
    expect(container.innerHTML).toContain('rounded-full');
    expect(container.innerHTML).toContain('font-mono');
  });
});
