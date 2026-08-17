import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PillNavAdapter from './PillNavAdapter';
import { SECTIONS } from '@/data/sections';

const props = {
  sections: SECTIONS,
  activeId: 'about',
  progress: 0.25,
  onNavigate: () => {},
};

describe('PillNavAdapter', () => {
  it('renders one link per section, pointing at its anchor', () => {
    render(<PillNavAdapter {...props} />);
    for (const section of SECTIONS) {
      expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }
  });

  it('marks the active section for assistive technology', () => {
    render(<PillNavAdapter {...props} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate instead of letting the browser jump', async () => {
    const onNavigate = vi.fn();
    render(<PillNavAdapter {...props} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', { name: 'Skills' }));

    expect(onNavigate).toHaveBeenCalledWith('skills');
  });

  it.each(['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const)(
    'leaves %s clicks to the browser, so open-in-new-tab still works',
    (modifier) => {
      const onNavigate = vi.fn();
      render(<PillNavAdapter {...props} onNavigate={onNavigate} />);

      const link = screen.getByRole('link', { name: 'Skills' });
      const event = fireEvent.click(link, { [modifier]: true });

      expect(onNavigate).not.toHaveBeenCalled();
      // Not preventing default is what lets the browser act on the modifier.
      expect(event).toBe(true);
    },
  );

  it('exposes scroll progress to assistive technology', () => {
    render(<PillNavAdapter {...props} />);
    const bar = screen.getByRole('progressbar', { name: /reading progress/i });
    expect(bar).toHaveAttribute('aria-valuenow', '25');
  });
});
