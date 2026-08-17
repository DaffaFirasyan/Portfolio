import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from './Projects';
import { ALL } from '@/lib/filter';

// Every category has projects today, so this branch cannot be reached through
// the interface. Forcing the filter to return nothing is the only way to prove
// the page says something — an empty grid reads as a broken page rather than as
// an answer. It lives in its own file because the mock has to be in place
// before Projects is imported.
vi.mock('@/lib/filter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/filter')>();
  return { ...actual, filterByCategory: () => [] };
});

describe('project filter with no matches', () => {
  it('names the empty category instead of going blank', () => {
    render(<Projects />);

    expect(screen.getByText(/no projects in/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });

  it('offers a control that puts everything back', async () => {
    render(<Projects />);

    const reset = screen.getByRole('button', { name: /show all projects/i });
    await userEvent.click(reset);

    expect(screen.getByRole('button', { name: ALL })).toHaveAttribute('aria-pressed', 'true');
  });

  it('gives the reset control a real touch target', () => {
    render(<Projects />);
    const reset = screen.getByRole('button', { name: /show all projects/i });
    expect(reset.className).toContain('min-h-11');
  });
});
