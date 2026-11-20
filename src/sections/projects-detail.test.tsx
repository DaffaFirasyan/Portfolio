import { render, screen } from '@testing-library/react';
import Projects from './Projects';
import { projects } from '@/data/projects';

describe('project detail, read in place', () => {
  it('shows every project\'s problem and solution without a click', () => {
    render(<Projects />);

    for (const project of projects) {
      expect(screen.getByText(project.problem), `${project.id} problem`).toBeInTheDocument();
      expect(screen.getByText(project.solution), `${project.id} solution`).toBeInTheDocument();
      if (project.outcome) {
        expect(screen.getByText(project.outcome), `${project.id} outcome`).toBeInTheDocument();
      }
    }
  });

  it('lists the whole stack of every project', () => {
    render(<Projects />);

    for (const project of projects) {
      expect(screen.getByText(project.stack.join(' · '))).toBeInTheDocument();
    }
  });

  it('needs no dialog, so there is nothing to open and nothing to trap focus', () => {
    render(<Projects />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
