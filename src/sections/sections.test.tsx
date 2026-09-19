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
    const cvLink = screen.getByRole('link', { name: /download cv/i });
    expect(cvLink).toHaveAttribute('href', profile.cvUrl);
    expect(cvLink).toHaveAttribute('target', '_blank');
    expect(cvLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('still exposes the name as the page h1 when animated', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(profile.name);
  });

  it('announces one role at a time rather than all of them', () => {
    render(<Hero />);

    // Counted excluding aria-hidden, which is the difference between "on the
    // page" and "announced". The rotator now renders the longest role a second
    // time, invisibly, to hold the line's width still — without that the hero
    // reflowed by up to 109px on every rotation and the desktop audit scored
    // the container 0.243 for layout shift. That copy is aria-hidden, so the
    // guarantee this test exists for is unchanged: a screen reader still meets
    // exactly one job title.
    const announced = (text: string) =>
      screen.queryAllByText(text).filter((el) => !el.closest('[aria-hidden="true"]'));

    for (const role of profile.roles.slice(1)) {
      expect(announced(role)).toHaveLength(0);
    }
    expect(announced(profile.roles[0])).toHaveLength(1);
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
  it('renders every bio paragraph', () => {
    render(<About />);
    for (const paragraph of profile.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  // This used to also assert an avatar with descriptive alt text. That image was
  // the hero's portrait rendered a second time — the same file, twice on one
  // page — and it is gone. The assertion is replaced rather than deleted,
  // because the column still owes the reader something and this is what.
  it('credits the paper in full, in publication order, and links its doi', () => {
    render(<About />);
    const paper = profile.publication;
    if (!paper) return;

    expect(screen.getByRole('heading', { level: 3, name: paper.title })).toBeInTheDocument();

    // Every co-author, not just the owner. The card is his, so the failure this
    // guards against is quietly dropping the other three — which would turn a
    // four-author paper into a claim of sole authorship.
    for (const author of paper.authors) {
      expect(screen.getByText(new RegExp(author)), author).toBeInTheDocument();
    }

    // The link points at the DOI resolver and shows the bare DOI, so a reader
    // can cite it without following it.
    const link = screen.getByRole('link', { name: new RegExp(paper.doi.replace('.', '\\.')) });
    expect(link).toHaveAttribute('href', paper.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
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

  it('renders skills within an interactive tabbed layout with full-width buttons', () => {
    const { container } = render(<Skills />);

    expect(screen.getByRole('tablist', { name: /skill categories/i })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').length).toBe(skillCategories.length + 1);

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
