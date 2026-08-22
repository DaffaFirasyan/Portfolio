import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  it('renders the title as a heading that opens the detail', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={onOpen} />);

    const heading = screen.getByRole('heading', { level: 3, name: base.title });
    expect(heading).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: base.title }));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it('also opens the detail from the image, since nothing here gets a hover cue on touch', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={onOpen} />);

    // A named button distinct from the title button, wrapping the image
    // rather than nested inside it — a button cannot contain the Repository
    // and Live demo links this row also carries.
    await user.click(screen.getByRole('button', { name: `View ${base.title} case study` }));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it('offers an explicit "view case study" control, not just an implicit click on the title', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={onOpen} />);

    await user.click(screen.getByRole('button', { name: /view case study/i }));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it('leads with the outcome and keeps the problem for the dialog, so the tile stays a teaser', () => {
    render(<ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={() => {}} />);
    expect(screen.getByText(base.outcome!)).toBeInTheDocument();

    // The whole reason this row shrank: `problem` used to be printed here in
    // full, often three or four wrapped lines, duplicating what the dialog
    // already says. It must not come back by accident.
    expect(screen.queryByText(base.problem)).toBeNull();
  });

  it('falls back to the problem sentence if a project is ever missing its outcome', () => {
    const { outcome, ...withoutOutcome } = base;
    void outcome;
    render(
      <ProjectTile project={withoutOutcome} index={0} lead promoted dimmed={false} onOpen={() => {}} />,
    );

    // data/invariants.test.ts guarantees every real project has one, so this
    // path is a safety net rather than a case the data ever actually reaches
    // — worth covering so a relaxed invariant degrades instead of rendering
    // an empty line.
    expect(screen.getByText(base.problem)).toBeInTheDocument();
  });

  it('keeps the thumbnail dimensions that stop the layout shifting', () => {
    render(<ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={() => {}} />);
    const img = screen.getByAltText(`${base.title} preview`);

    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '500');
  });

  it('renders no control at all for a link the data does not have', () => {
    const noLinks: Project = { ...base, links: {} };
    render(<ProjectTile project={noLinks} index={0} lead promoted dimmed={false} onOpen={() => {}} />);

    // Spec 7: an absent link renders nothing, never a dead control.
    expect(screen.queryByRole('link', { name: /repository/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /live demo/i })).toBeNull();
  });

  it('carries the dim state on an article, where the cross-highlight looks for it', () => {
    const { container, rerender } = render(
      <ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={() => {}} />,
    );

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).not.toHaveAttribute('data-dimmed');

    rerender(<ProjectTile project={base} index={0} lead promoted dimmed onOpen={() => {}} />);
    expect(container.querySelector('article')).toHaveAttribute('data-dimmed', 'true');
  });

  it('changes nothing but opacity when it dims, so the tile cannot shift', () => {
    const { container, rerender } = render(
      <ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={() => {}} />,
    );
    const lit = container.querySelector('article')!.className;

    rerender(<ProjectTile project={base} index={0} lead promoted dimmed onOpen={() => {}} />);
    const dim = container.querySelector('article')!.className;

    const strip = (c: string) => c.replace(/opacity-\d+/g, '').trim();
    expect(strip(dim)).toBe(strip(lit));
  });

  it('numbers the entry, so the grid reads as a ranked set', () => {
    render(<ProjectTile project={base} index={2} lead promoted dimmed={false} onOpen={() => {}} />);
    expect(screen.getByText(/03/)).toBeInTheDocument();
  });

  it('claims featured only while the set is unfiltered', () => {
    const { rerender } = render(
      <ProjectTile project={base} index={0} lead promoted dimmed={false} onOpen={() => {}} />,
    );
    expect(screen.getByText(/— Featured$/)).toBeInTheDocument();

    // Featuring judges the whole body of work. Inside a filtered subset the
    // badge asserts an importance it does not have, which is why the section
    // stops passing `promoted` the moment a category narrows the set.
    rerender(
      <ProjectTile project={base} index={0} lead promoted={false} dimmed={false} onOpen={() => {}} />,
    );
    expect(screen.queryByText(/— Featured$/)).toBeNull();
  });

  it('never marks an unfeatured project as featured, however it is placed', () => {
    render(
      <ProjectTile
        project={{ ...base, featured: false }}
        index={0}
        lead
        promoted
        dimmed={false}
        onOpen={() => {}}
      />,
    );
    expect(screen.queryByText(/— Featured$/)).toBeNull();
  });

  it('shows fewer stack chips in a column cell than in the lead', () => {
    const many = { ...base, stack: ['Python', 'Neo4j', 'FastAPI', 'LangChain', 'Docker', 'Redis'] };
    const { container, rerender } = render(
      <ProjectTile project={many} index={0} lead promoted dimmed={false} onOpen={() => {}} />,
    );
    const wideCount = container.querySelectorAll('ul li').length;

    // A single-column cell cannot carry six chips without wrapping into a
    // third line and dragging the whole grid row taller with it. The lead
    // tile has a full-width row to spend and can show the set.
    rerender(
      <ProjectTile project={many} index={0} lead={false} promoted dimmed={false} onOpen={() => {}} />,
    );
    expect(container.querySelectorAll('ul li').length).toBeLessThan(wideCount);
  });
});
