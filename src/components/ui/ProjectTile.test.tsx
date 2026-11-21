import { render, screen } from '@testing-library/react';

import type { Project } from '@/types';
import ProjectTile from './ProjectTile';

const base: Project = {
  id: 'kg-rag',
  title: 'Knowledge graph retrieval for maintenance records',
  category: 'AI/ML',
  year: 2026,
  role: 'Lead engineer',
  problem: 'Field engineers could not find prior fixes buried in years of free-text work orders.',
  solution: 'A retrieval pipeline that walks a graph built from the records instead of the text.',
  outcome: 'Median time to find a prior fix dropped from eleven minutes to under one.',
  stack: ['Python', 'Neo4j', 'FastAPI'],
  thumbnail: '/projects/kg-rag.webp',
  links: { repo: 'https://github.com/example/kg-rag', demo: 'https://example.com/kg-rag' },
  featured: true,
};

describe('ProjectTile', () => {
  it('renders the title as a level-3 heading inside an article', () => {
    render(<ProjectTile project={base} dimmed={false} />);
    const heading = screen.getByRole('heading', { level: 3, name: base.title });
    expect(heading.closest('article')).not.toBeNull();
  });

  it('shows the problem, the solution and the outcome in place, with nothing to open', () => {
    render(<ProjectTile project={base} dimmed={false} />);

    // The whole account is on the page. A dialog would hide the evidence
    // behind a click that a recruiter scanning the page never makes.
    expect(screen.getByText(base.problem)).toBeInTheDocument();
    expect(screen.getByText(base.solution)).toBeInTheDocument();
    expect(screen.getByText(base.outcome!)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves the outcome out when a project has none, rather than printing an empty label', () => {
    render(<ProjectTile project={{ ...base, outcome: undefined }} dimmed={false} />);
    expect(screen.queryByText(/^Outcome/)).not.toBeInTheDocument();
  });

  it('puts the whole stack on one line, in order', () => {
    render(<ProjectTile project={base} dimmed={false} />);
    expect(screen.getByText('Python · Neo4j · FastAPI')).toBeInTheDocument();
  });

  it('joins category, year and role, and drops a role that is not stated', () => {
    const { rerender } = render(<ProjectTile project={base} dimmed={false} />);
    expect(screen.getByText('AI/ML · 2026 · Lead engineer')).toBeInTheDocument();

    rerender(<ProjectTile project={{ ...base, role: undefined }} dimmed={false} />);
    expect(screen.getByText('AI/ML · 2026')).toBeInTheDocument();
  });

  it('keeps the thumbnail dimensions that stop the layout shifting', () => {
    const { container } = render(<ProjectTile project={base} dimmed={false} />);
    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '500');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('carries an id the map can scroll to', () => {
    const { container } = render(<ProjectTile project={base} dimmed={false} />);
    expect(container.querySelector('article')).toHaveAttribute('id', 'project-kg-rag');
  });

  it('marks itself dimmed only when asked to', () => {
    const { container, rerender } = render(<ProjectTile project={base} dimmed={false} />);
    expect(container.querySelector('article')).not.toHaveAttribute('data-dimmed');

    rerender(<ProjectTile project={base} dimmed />);
    expect(container.querySelector('article')).toHaveAttribute('data-dimmed', 'true');
  });

  it('renders a link for each one the project has, opened safely, and nothing for the rest', () => {
    const { rerender } = render(<ProjectTile project={base} dimmed={false} />);

    for (const link of [screen.getByRole('link', { name: /repository/i }), screen.getByRole('link', { name: /live demo/i })]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    rerender(<ProjectTile project={{ ...base, links: {} }} dimmed={false} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
