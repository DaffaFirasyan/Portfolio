import { render, screen, within } from '@testing-library/react';
import App from './App';
import { SECTIONS } from '@/data/sections';

describe('App', () => {
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

      const eyebrow = `${String(meta.index).padStart(2, '0')} / ${meta.label}`;
      expect(within(section!).getByText(eyebrow)).toBeInTheDocument();
      expect(
        within(section!).getByRole('heading', { level: 2, name: meta.title }),
      ).toBeInTheDocument();
    }
  });

  it('exposes a skip link as the first focusable element', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#home',
    );
  });
});
