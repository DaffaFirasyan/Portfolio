import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SECTIONS } from '@/data/sections';
import NodeRailNav from './NodeRailNav';

const props = {
  sections: SECTIONS,
  activeId: 'projects',
  progress: 0.62,
  onNavigate: () => {},
};

describe('NodeRailNav', () => {
  it('gives every section a link with its label as the accessible name', () => {
    render(<NodeRailNav {...props} />);
    for (const section of SECTIONS) {
      expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }
  });

  it('marks only the active section as current', () => {
    render(<NodeRailNav {...props} />);
    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Projects');
  });

  it('reports reading progress as a percentage', () => {
    render(<NodeRailNav {...props} />);
    expect(screen.getByRole('progressbar', { name: /reading progress/i })).toHaveAttribute(
      'aria-valuenow',
      '62',
    );
  });

  it('navigates on a plain click instead of jumping', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NodeRailNav {...props} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(onNavigate).toHaveBeenCalledWith('about');
  });

  it('leaves modified clicks to the browser, so open-in-new-tab still works', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NodeRailNav {...props} onNavigate={onNavigate} />);

    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('link', { name: 'About' }));
    await user.keyboard('{/Control}');

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('keeps a real anchor for every section so the page works without javascript', () => {
    render(<NodeRailNav {...props} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(SECTIONS.map((section) => `#${section.id}`));
  });
});
