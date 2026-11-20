import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import { profile } from '@/data/profile';
import { skillCategories } from '@/data/skills';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';

describe('Hero', () => {
  it('renders the name as the only h1, with the tagline beneath it', () => {
    const { container } = render(<Hero />);
    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.textContent).toContain(profile.tagline);
  });

  it('states the role in one static line, not a rotating one', () => {
    render(<Hero />);

    // The old hero cycled through every role and had to render the longest one
    // invisibly to stop the line reflowing. A reader now meets the role once,
    // and a screen reader announces it once.
    expect(screen.getByText(profile.roles.slice(0, 2).join(' · '))).toBeInTheDocument();
    for (const role of profile.roles.slice(2)) {
      expect(screen.queryByText(role)).not.toBeInTheDocument();
    }
  });

  it('says where he is and whether he is open to work, as a credits row', () => {
    render(<Hero />);
    expect(screen.getByText(profile.location)).toBeInTheDocument();
    if (profile.openToWork) {
      expect(screen.getByText(/open to work/i)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/open to work/i)).not.toBeInTheDocument();
    }
  });

  it('shows the portrait with a name in its alt text', () => {
    render(<Hero />);
    expect(screen.getByRole('img', { name: `${profile.name} avatar` })).toHaveAttribute(
      'src',
      profile.avatarUrl,
    );
  });

  it('presses a round stamp onto the portrait plate, hidden from assistive technology', () => {
    const { container } = render(<Hero />);

    // Everything the stamp says (name, role, city) is real text elsewhere, so
    // it is decoration and must never be read out around its ring.
    const stamp = container.querySelector('.stamp');
    expect(stamp).not.toBeNull();
    expect(stamp).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.plate')).not.toBeNull();
  });

  it('prints no stat counters and no backdrop: the page makes its case in prose', () => {
    const { container } = render(<Hero />);
    for (const stat of profile.stats) {
      expect(screen.queryByText(stat.label)).not.toBeInTheDocument();
    }
    expect(container.querySelector('[data-testid="backdrop-fallback"]')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });
});

describe('About', () => {
  it('renders every bio paragraph', () => {
    render(<About />);
    for (const paragraph of profile.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('credits the paper in full, in publication order, and links its doi', () => {
    render(<About />);
    const paper = profile.publication;
    if (!paper) return;

    // The label names the credential; the title is the paper's own.
    expect(screen.getByText(/published research/i)).toBeInTheDocument();
    expect(screen.getByText(paper.title)).toBeInTheDocument();

    // Every co-author, not just the owner. The failure this guards against is
    // quietly dropping the other three, which would turn a four-author paper
    // into a claim of sole authorship.
    const authors = screen.getByText(new RegExp(paper.authors[0]));
    for (const author of paper.authors) {
      expect(authors.textContent).toContain(author);
    }
    expect(authors.textContent!.indexOf(paper.authors[0])).toBe(0);

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
      // Exact match on purpose: a word-splitting effect joins words with
      // non-breaking spaces, so the lookup would fail and say so.
      const match = [...container.querySelectorAll('p')].find((p) => p.textContent === paragraph);
      expect(match, 'a bio paragraph was split across elements').toBeDefined();
      expect(match!.childElementCount).toBe(0);
    }
  });
});

describe('Skills', () => {
  it('names every category and shows every skill at once, with no tabs to hide any', () => {
    render(<Skills />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    for (const category of skillCategories) {
      expect(screen.getByText(category.name)).toBeInTheDocument();
      for (const skill of category.skills) {
        expect(screen.getByRole('button', { name: skill.name })).toBeInTheDocument();
      }
    }
  });

  it('keeps categories and their skills in a real description list', () => {
    const { container } = render(<Skills />);

    for (const term of container.querySelectorAll('dt, dd')) {
      expect(term.closest('dl'), `${term.tagName} has no dl ancestor`).not.toBeNull();
    }
    expect(container.querySelectorAll('dt')).toHaveLength(skillCategories.length);
  });

  it('marks the hovered skill itself, not just the projects it lights elsewhere', async () => {
    // The dimming this drives lands on Projects, which can be a scroll away.
    // highlight/cross-highlight.test.tsx covers that link end to end; this
    // covers the half of the feature that stays inside this section. The state
    // is carried by weight and an underline as well as colour.
    render(
      <SkillHighlightProvider>
        <Skills />
      </SkillHighlightProvider>,
    );
    const [{ name }] = skillCategories.flatMap((c) => c.skills);
    const button = screen.getByRole('button', { name });

    expect(button).not.toHaveClass('underline');

    await userEvent.hover(button);
    expect(button).toHaveClass('underline', 'font-medium');

    await userEvent.unhover(button);
    expect(button).not.toHaveClass('underline');

    // Plain button.focus() moves document.activeElement without going through
    // React's act() batching, so the update is not guaranteed to have committed
    // by the next line.
    act(() => button.focus());
    expect(button).toHaveClass('underline');

    act(() => button.blur());
    expect(button).not.toHaveClass('underline');
  });
});
