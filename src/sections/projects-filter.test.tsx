import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from './Projects';
import { projects } from '@/data/projects';
import { ALL, categoriesOf } from '@/lib/filter';

const categories = categoriesOf(projects);
const firstReal = categories[1];

function visibleTitles() {
  return screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
}

describe('project filter', () => {
  it('offers All plus every category the data uses', () => {
    render(<Projects />);
    for (const name of categories) {
      expect(screen.getByRole('button', { name, pressed: name === ALL })).toBeInTheDocument();
    }
  });

  it('starts on All, showing everything', () => {
    render(<Projects />);
    expect(visibleTitles()).toHaveLength(projects.length);
  });

  it('narrows to one category and moves the pressed state with it', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));

    const expected = projects.filter((p) => p.category === firstReal);
    expect(visibleTitles()).toHaveLength(expected.length);
    for (const project of expected) expect(screen.getByText(project.title)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: firstReal })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: ALL })).toHaveAttribute('aria-pressed', 'false');
  });

  it('goes back to everything when All is chosen again', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));
    await userEvent.click(screen.getByRole('button', { name: ALL }));

    expect(visibleTitles()).toHaveLength(projects.length);
  });

  it('shows every project exactly once, never in both tiers', () => {
    render(<Projects />);
    const titles = visibleTitles();

    // The split is a partition. A project appearing as both a featured row and
    // a compact card is the obvious way to get this wrong.
    expect(titles).toHaveLength(projects.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('promotes the featured projects while All is selected', () => {
    render(<Projects />);

    const expected = projects.filter((p) => p.featured);
    expect(expected.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/— Featured$/)).toHaveLength(expected.length);

    // Promoted, not merely reordered: they lead the section.
    expect(visibleTitles().slice(0, expected.length)).toEqual(expected.map((p) => p.title));
  });

  it('drops the split entirely once a category narrows the set', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));

    // Featuring judges the whole body of work. Inside a filtered subset it
    // claims an importance it does not have, and a single match would render
    // one enormous row above an empty grid.
    expect(screen.queryAllByText(/— Featured$/)).toHaveLength(0);
    expect(visibleTitles()).toHaveLength(
      projects.filter((p) => p.category === firstReal).length,
    );
  });

  it('brings the split back when the filter is cleared', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));
    await userEvent.click(screen.getByRole('button', { name: ALL }));

    expect(screen.getAllByText(/— Featured$/)).toHaveLength(
      projects.filter((p) => p.featured).length,
    );
  });

  it('keeps the data order rather than reshuffling what stays on screen', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));

    const expected = projects.filter((p) => p.category === firstReal).map((p) => p.title);
    expect(visibleTitles()).toEqual(expected);
  });
});
