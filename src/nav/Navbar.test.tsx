import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { observers } from '@/test/stubs';
import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';

/**
 * The strip along the top: links inline from lg up, a Menu disclosure below it.
 * CSS decides which is visible, so jsdom sees both.
 */
describe('Navbar', () => {
  it('is a banner holding the name, the section links and a menu button', () => {
    render(<Navbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: profile.shortName })).toHaveAttribute('href', '#home');
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();

    // The wide-screen links are always in the document; the phone's disclosure
    // is not there until it is opened.
    const wide = screen.getByRole('navigation', { name: 'Sections' });
    for (const section of SECTIONS.filter((s) => s.id !== 'home')) {
      expect(within(wide).getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument();
  });

  it('keeps the CV on the bar itself, not only in the menu', () => {
    render(<Navbar />);
    expect(screen.getAllByRole('link', { name: /^CV \(EN\)/ })[0]).toHaveAttribute('href', profile.cvUrl);
  });

  it('marks no link as current while the board is in view, then follows the reader', () => {
    document.body.innerHTML = SECTIONS.map((s) => `<section id="${s.id}"></section>`).join('');
    render(<Navbar />);
    const wide = screen.getByRole('navigation', { name: 'Sections' });

    // Home is the board itself and is not in the list, so nothing is current yet.
    expect(wide.querySelector('[aria-current="true"]')).toBeNull();

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('home')!, intersectionRatio: 0.1 },
        { target: document.getElementById('projects')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(within(wide).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('opens and closes the menu, and closes it with Escape', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('says Close while the menu is open, and gives focus back to the button on Escape', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    await userEvent.click(toggle);
    expect(toggle).toHaveAccessibleName(/close/i);

    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAccessibleName(/menu/i);
    expect(toggle).toHaveFocus();
  });

  it('lists every section and closes when one is chosen', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    await userEvent.click(toggle);
    const menu = screen.getByRole('navigation', { name: /mobile/i });
    for (const section of SECTIONS) {
      expect(within(menu).getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }

    await userEvent.click(within(menu).getByRole('link', { name: 'Projects' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the email inside the menu, where the bar has no room for it', async () => {
    render(<Navbar />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));

    const mail = within(screen.getByRole('navigation', { name: /mobile/i })).getByRole('link', {
      name: /email/i,
    });
    expect(mail).toHaveAttribute('href', `mailto:${profile.email}`);
  });

  it('keeps the cv inside the menu too', async () => {
    render(<Navbar />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));

    const cv = within(screen.getByRole('navigation', { name: /mobile/i })).getByRole('link', {
      name: /cv/i,
    });
    expect(cv).toHaveAttribute('href', profile.cvUrl);
    expect(cv).toHaveAttribute('target', '_blank');
    expect(cv).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('offers the language toggle on the bar and again inside the menu', async () => {
    render(<Navbar />);
    expect(screen.getAllByRole('group', { name: /language/i })).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    expect(screen.getAllByRole('group', { name: /language/i })).toHaveLength(2);
  });
});
