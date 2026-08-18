import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SECTIONS } from '@/data/sections';
import App from './App';

const realMatchMedia = window.matchMedia;

function setCapability({ animate, hover }: { animate: boolean; hover: boolean }) {
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

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('the page under reduced motion', () => {
  it('puts no canvas on the page at all', () => {
    setCapability({ animate: false, hover: false });
    const { container } = render(<App />);
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('still renders every section heading, so nothing was hidden by a dead animation', () => {
    setCapability({ animate: false, hover: false });
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(6);
  });
});

describe('the document outline', () => {
  it('contains no section the metadata does not know about', async () => {
    // Deliberately with hover on. jsdom reports no hover by default, so the
    // whole decorated branch of the page never renders — which is how a
    // vendored ProfileCard shipped an id-less <section> into the hero and a
    // ScrollVelocity another into the footer, both invisible to every test.
    setCapability({ animate: true, hover: true });
    const { container } = render(<App />);

    const ids = [...container.querySelectorAll('section')].map((s) => s.id);
    expect(ids.filter((id) => id === '')).toHaveLength(0);
    expect(ids).toEqual(SECTIONS.map((s) => s.id));
  });
});

describe('accessible names', () => {
  it('gives every button one', () => {
    setCapability({ animate: false, hover: false });
    render(<App />);
    for (const button of screen.getAllByRole('button')) {
      expect(button, button.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every link one', () => {
    setCapability({ animate: false, hover: false });
    render(<App />);
    for (const link of screen.getAllByRole('link')) {
      expect(link, link.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every navigation landmark a distinct name', async () => {
    setCapability({ animate: false, hover: false });
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
