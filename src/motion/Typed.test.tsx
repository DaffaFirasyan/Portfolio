import { render, screen } from '@testing-library/react';

import Typed from './Typed';

const LINE = 'The fastest way to reach me is email.';

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

describe('Typed', () => {
  it('renders the whole sentence immediately under reduced motion', () => {
    setMotion(false);
    render(<Typed text={LINE} />);
    expect(screen.getByText(LINE)).toBeInTheDocument();
  });

  it('adds no cursor character under reduced motion', () => {
    setMotion(false);
    const { container } = render(<Typed text={LINE} />);
    expect(container.textContent).toBe(LINE);
  });

  it('renders as a paragraph carrying the caller class, either way', () => {
    setMotion(false);
    const { container } = render(<Typed text={LINE} className="text-muted" />);
    expect(container.querySelector('p')).toHaveClass('text-muted');
  });

  it('leaves letter spacing to the caller rather than tightening body copy', () => {
    setMotion(true);
    const { container } = render(<Typed text={LINE} className="text-muted" />);
    expect(container.querySelector('p')).not.toHaveClass('tracking-tight');
  });
});
