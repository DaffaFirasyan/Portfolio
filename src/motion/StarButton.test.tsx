import { render, screen } from '@testing-library/react';

import StarButton from './StarButton';

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

describe('StarButton', () => {
  it('renders an anchor that still works as a link', () => {
    setMotion(true);
    render(
      <StarButton as="a" href="/cv.pdf">
        CV
      </StarButton>,
    );

    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv.pdf');
  });

  it('renders a button that still submits', () => {
    setMotion(true);
    render(
      <StarButton as="button" type="submit">
        Send message
      </StarButton>,
    );

    expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('type', 'submit');
  });

  it('drops the moving parts entirely under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <StarButton as="button" type="button">
        Send message
      </StarButton>,
    );

    expect(container.querySelector('.animate-star-movement-top')).toBeNull();
    expect(container.querySelector('.animate-star-movement-bottom')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('keeps the caller in charge of the shape', () => {
    setMotion(true);
    render(
      <StarButton as="button" type="button" className="rounded-full px-6">
        Send message
      </StarButton>,
    );

    expect(screen.getByRole('button')).toHaveClass('rounded-full');
  });

  it('does not wrap the control in a second styled box', () => {
    setMotion(true);
    const { container } = render(
      <StarButton as="button" type="button" className="bg-accent">
        Send message
      </StarButton>,
    );

    // The vendored inner div had its own gradient, border, padding and text
    // colour. If it comes back, the real control sits inside a box that looks
    // like a different button.
    expect(container.querySelector('.from-black')).toBeNull();
    expect(container.querySelector('.border-gray-800')).toBeNull();
  });
});
