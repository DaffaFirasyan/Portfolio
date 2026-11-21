import { render, screen, within } from '@testing-library/react';
import App from './App';
import { SECTIONS } from '@/data/sections';

describe('App', () => {
  // The map test spies on the canvas and matchMedia; restore even if it fails.
  afterEach(() => vi.restoreAllMocks());

  it('renders every section anchor in the documented order', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section')).map((s) => s.id);
    expect(ids).toEqual(SECTIONS.map((s) => s.id));
  });

  it('has exactly one h1', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('builds every section header from the shared metadata', () => {
    const { container } = render(<App />);

    for (const meta of SECTIONS) {
      if (!meta.title) continue;

      const section = container.querySelector<HTMLElement>(`#${meta.id}`);
      expect(section, `no section rendered for "${meta.id}"`).not.toBeNull();

      // No eyebrow and no section number: the heading carries its own weight,
      // and the rail's index says where a reader is.
      const eyebrow = `${String(meta.index).padStart(2, '0')} / ${meta.label}`;
      expect(within(section!).queryByText(eyebrow)).not.toBeInTheDocument();
      expect(
        within(section!).getByRole('heading', { level: 2, name: meta.title }),
      ).toBeInTheDocument();
    }
  });

  it('keeps the skip link ahead of the navigation', () => {
    const { container } = render(<App />);
    const focusable = container.querySelectorAll('a[href], button');
    expect(focusable[0]).toHaveTextContent(/skip to content/i);
  });

  it('points the skip link at the first section of the reading column', () => {
    // Not #home: the identity block sits in the rail ahead of the column, so
    // skipping to it would land on the content the link exists to skip past.
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#about',
    );
  });

  it('mounts the decorative sky and the passport chip', () => {
    localStorage.clear();
    const { container } = render(<App />);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: /passport 0\/10/i })).toBeInTheDocument();
  });

  it('keeps the footer in Reading mode', () => {
    const { container } = render(<App />);
    expect(container.querySelector('footer')).not.toBeNull();
  });

  it('starts on the star map when a canvas is available', () => {
    // The sky really draws here, so the context must answer every call; and
    // reduced motion keeps it to one still frame instead of a running loop.
    const ctx = new Proxy(
      {},
      {
        get: (_target, prop: string) =>
          prop === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {},
        set: () => true,
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('reduce'),
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    const { container } = render(<App />);
    expect(container.querySelector('[data-map-surface]')).not.toBeNull();
    expect(container.querySelector('footer')).toBeNull();
    expect(screen.getByRole('button', { name: 'Skills' })).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('gives every section a stamp slot', () => {
    const { container } = render(<App />);
    for (const meta of SECTIONS) {
      expect(container.querySelector(`[data-stamp="${meta.id}"]`), meta.id).not.toBeNull();
    }
  });
});
