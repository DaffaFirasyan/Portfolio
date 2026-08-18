import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

const realMatchMedia = window.matchMedia;

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('the page under reduced motion', () => {
  it('puts no canvas on the page at all', () => {
    setReducedMotion(true);
    const { container } = render(<App />);
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('still renders every section heading, so nothing was hidden by a dead animation', () => {
    setReducedMotion(true);
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(6);
  });
});

describe('accessible names', () => {
  it('gives every button one', () => {
    setReducedMotion(true);
    render(<App />);
    for (const button of screen.getAllByRole('button')) {
      expect(button, button.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every link one', () => {
    setReducedMotion(true);
    render(<App />);
    for (const link of screen.getAllByRole('link')) {
      expect(link, link.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every navigation landmark a distinct name', async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    render(<App />);

    // The disclosure nav only exists while the menu is open, and it is the one
    // that could collide with the rail. Testing the closed page proves nothing.
    await user.click(screen.getByRole('button', { name: /menu/i }));

    const names = screen.getAllByRole('navigation').map((nav) => nav.getAttribute('aria-label'));
    expect(names.length).toBeGreaterThanOrEqual(2);
    expect(names.every(Boolean)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
  });
});
