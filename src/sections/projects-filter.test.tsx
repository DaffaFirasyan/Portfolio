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

  it('keeps the data order rather than reshuffling what stays on screen', async () => {
    render(<Projects />);
    await userEvent.click(screen.getByRole('button', { name: firstReal }));

    const expected = projects.filter((p) => p.category === firstReal).map((p) => p.title);
    expect(visibleTitles()).toEqual(expected);
  });
});
