import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import { profile } from '@/data/profile';
import { skillCategories } from '@/data/skills';
import { skillIcon } from '@/lib/skillIcon';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';

describe('Hero', () => {
  it('renders the name as the only h1, plus tagline and both calls to action', () => {
    const { container } = render(<Hero />);
    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument();
    // The tagline animates word by word, and the words are joined with
    // non-breaking spaces so they keep their spacing as inline-block flex
    // items. Normalise those before comparing — the rendered sentence is
    // correct, it just is not made of U+0020.
    expect(container.textContent?.replace(/\u00A0/g, " ")).toContain(profile.tagline);
    expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: /download cv/i })).toHaveAttribute('href', profile.cvUrl);
  });

  it('still exposes the name as the page h1 when animated', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(profile.name);
  });

  it('announces one role at a time rather than all of them', () => {
    render(<Hero />);
    // A rotator that renders every phrase and hides the inactive ones visually
    // still reads all four job titles to a screen reader.
    for (const role of profile.roles.slice(1)) {
      expect(screen.queryByText(role)).not.toBeInTheDocument();
    }
    expect(screen.getByText(profile.roles[0])).toBeInTheDocument();
  });

  it('keeps the stat labels and values readable', () => {
    render(<Hero />);
    for (const stat of profile.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it('renders exactly one backdrop, hidden from assistive technology', () => {
    const { container } = render(<Hero />);
    const backdrops = container.querySelectorAll('[data-testid="backdrop-fallback"]');
    expect(backdrops).toHaveLength(1);
    expect(backdrops[0].closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('About', () => {
  it('renders every bio paragraph and the avatar with descriptive alt text', () => {
    render(<About />);
    for (const paragraph of profile.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByRole('img', { name: new RegExp(profile.name, 'i') })).toBeInTheDocument();
  });

  it('keeps every bio paragraph as one element, not one per word', () => {
    const { container } = render(<About />);

    for (const paragraph of profile.bio) {
      // Exact match on purpose. A word-splitting effect joins words with
      // non-breaking spaces, so the lookup fails and this reports the real
      // problem rather than a confusing count.
      const match = [...container.querySelectorAll('p')].find(
        (p) => p.textContent === paragraph,
      );
      expect(match, 'a bio paragraph was split across elements').toBeDefined();
      // A word-splitting effect here would mean roughly two hundred elements
      // and two hundred scroll triggers on prose, which is the pattern the
      // spec's own performance note warns against.
      expect(match!.childElementCount).toBe(0);
    }
  });

  it('keeps the quick facts a real description list', () => {
    const { container } = render(<About />);

    // Surface renders a div, so wrapping the dl in it is fine but replacing
    // the dl with it leaves dt and dd with no list parent — invalid markup
    // that silently drops the semantics assistive technology relies on.
    for (const term of container.querySelectorAll('dt, dd')) {
      expect(term.closest('dl'), `${term.tagName} has no dl ancestor`).not.toBeNull();
    }
    expect(container.querySelectorAll('dt').length).toBeGreaterThan(0);
  });
});

describe('Skills', () => {
  it('renders every category name and every skill name', () => {
    render(<Skills />);
    for (const category of skillCategories) {
      expect(screen.getByRole('heading', { level: 3, name: category.name })).toBeInTheDocument();
      for (const skill of category.skills) {
        expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every skill an icon, distinct from the text that names it', () => {
    render(<Skills />);
    const allSkills = skillCategories.flatMap((c) => c.skills);

    // One svg per skill, and skillIcon(...) is what the data invariant in
    // invariants.test.ts already proves resolves for every icon name — this
    // just confirms the component actually renders one, rather than only
    // being capable of it.
    expect(document.querySelectorAll('.grid svg').length).toBe(allSkills.length);
    for (const skill of allSkills) {
      expect(skillIcon(skill.icon)).toBeDefined();
    }
  });

  it('lays the skills out one per row, so no name can wrap beside another', () => {
    const { container } = render(<Skills />);

    // The reason the pills went: flex-wrap gave a ragged right edge, and the
    // longest name the limit permits (24 chars) wrapped inside its own pill,
    // leaving one item in the set two lines tall. jsdom computes no layout,
    // so this asserts the mechanism that makes wrapping impossible rather
    // than measuring the result — the browser check is in the commit.
    for (const list of container.querySelectorAll('.grid ul')) {
      expect(list.className).not.toMatch(/flex-wrap/);
    }
    for (const button of container.querySelectorAll('.grid ul button')) {
      expect(button.className).toContain('w-full');
    }
  });

  it('marks the hovered chip itself, not just the projects it lights elsewhere', async () => {
    // The dimming this drives lands on Projects, which can be a scroll away.
    // Skills.tsx must not go inert for want of a provider — highlight/
    // cross-highlight.test.tsx covers that link end to end; this covers the
    // half of the feature that stays inside this section.
    render(
      <SkillHighlightProvider>
        <Skills />
      </SkillHighlightProvider>,
    );
    const [{ name }] = skillCategories.flatMap((c) => c.skills);
    const button = screen.getByRole('button', { name });

    expect(button).not.toHaveClass('bg-accent/10');

    await userEvent.hover(button);
    expect(button).toHaveClass('bg-accent/10');

    await userEvent.unhover(button);
    expect(button).not.toHaveClass('bg-accent/10');

    // Plain button.focus() moves document.activeElement without going
    // through React's act() batching, so the state update this handler
    // schedules is not guaranteed to have committed by the next line.
    // fireEvent.focus would flush it but skips the real focus() call
    // entirely, which is the part act() lets us keep.
    act(() => button.focus());
    expect(button).toHaveClass('bg-accent/10');

    act(() => button.blur());
    expect(button).not.toHaveClass('bg-accent/10');
  });
});
