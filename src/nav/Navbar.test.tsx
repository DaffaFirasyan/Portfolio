import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = SECTIONS.map((s) => `<section id="${s.id}"></section>`).join('');
  });

  it('is a landmark containing the site navigation', () => {
    render(<Navbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument();
  });

  it('offers the cv without hiding it behind the mobile menu', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /cv/i })).toHaveAttribute('href', profile.cvUrl);
  });

  it('opens and closes the mobile menu, and closes it with Escape', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile menu when a section is chosen', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    await userEvent.click(toggle);
    const menu = screen.getByRole('navigation', { name: /mobile/i });
    await userEvent.click(within(menu).getByRole('link', { name: 'Projects' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
