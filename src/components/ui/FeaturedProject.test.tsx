import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Project } from '@/types';
import FeaturedProject from './FeaturedProject';

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

describe('FeaturedProject', () => {
  it('renders the title as a heading that opens the detail', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<FeaturedProject project={base} index={0} dimmed={false} onOpen={onOpen} />);

    const heading = screen.getByRole('heading', { level: 3, name: base.title });
    expect(heading).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: base.title }));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it('gives the outcome its own line, because it is the part worth scanning for', () => {
    render(<FeaturedProject project={base} index={0} dimmed={false} onOpen={() => {}} />);
    expect(screen.getByText(base.outcome!)).toBeInTheDocument();
  });

  it('keeps the thumbnail dimensions that stop the layout shifting', () => {
    render(<FeaturedProject project={base} index={0} dimmed={false} onOpen={() => {}} />);
    const img = screen.getByAltText(`${base.title} preview`);

    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '500');
  });

  it('renders no control at all for a link the data does not have', () => {
    const noLinks: Project = { ...base, links: {} };
    render(<FeaturedProject project={noLinks} index={0} dimmed={false} onOpen={() => {}} />);

    // Spec 7: an absent link renders nothing, never a dead control.
    expect(screen.queryByRole('link', { name: /repository/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /live demo/i })).toBeNull();
  });

  it('carries the dim state on an article, where the cross-highlight looks for it', () => {
    const { container, rerender } = render(
      <FeaturedProject project={base} index={0} dimmed={false} onOpen={() => {}} />,
    );

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).not.toHaveAttribute('data-dimmed');

    rerender(<FeaturedProject project={base} index={0} dimmed onOpen={() => {}} />);
    expect(container.querySelector('article')).toHaveAttribute('data-dimmed', 'true');
  });

  it('changes nothing but opacity when it dims, so the row cannot shift', () => {
    const { container, rerender } = render(
      <FeaturedProject project={base} index={0} dimmed={false} onOpen={() => {}} />,
    );
    const lit = container.querySelector('article')!.className;

    rerender(<FeaturedProject project={base} index={0} dimmed onOpen={() => {}} />);
    const dim = container.querySelector('article')!.className;

    const strip = (c: string) => c.replace(/opacity-\d+/g, '').trim();
    expect(strip(dim)).toBe(strip(lit));
  });

  it('numbers the entry, so three rows read as a ranked set', () => {
    render(<FeaturedProject project={base} index={2} dimmed={false} onOpen={() => {}} />);
    expect(screen.getByText(/03/)).toBeInTheDocument();
  });
});
