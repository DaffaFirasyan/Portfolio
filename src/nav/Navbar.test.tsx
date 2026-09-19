import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { observers } from '@/test/stubs';
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
    const cvLink = screen.getByRole('link', { name: /cv/i });
    expect(cvLink).toHaveAttribute('href', profile.cvUrl);
    expect(cvLink).toHaveAttribute('target', '_blank');
    expect(cvLink).toHaveAttribute('rel', 'noopener noreferrer');
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

  it('names the section the reader is in, without needing hover', () => {
    render(<Navbar />);
    expect(screen.getByText('00 / Home')).toBeInTheDocument();
  });

  it('follows the reader from one section to the next', () => {
    render(<Navbar />);

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('home')!, intersectionRatio: 0.1 },
        { target: document.getElementById('projects')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(screen.getByText('04 / Projects')).toBeInTheDocument();
    expect(screen.queryByText('00 / Home')).not.toBeInTheDocument();
  });

  it('is the only file that names the navigation implementation', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });

    const naming = walk(join(process.cwd(), 'src'))
      .filter((file) => /\.tsx?$/.test(file) && !file.includes('.test.'))
      .filter((file) => readFileSync(file, 'utf8').includes('NodeRailNav'))
      .map((file) => file.replace(/\\/g, '/').split('/src/')[1])
      .sort();

    // The component names itself; nothing else may, or swapping the navigation
    // stops being a one-line change.
    expect(naming).toEqual(['nav/Navbar.tsx', 'nav/NodeRailNav.tsx']);
  });
});
