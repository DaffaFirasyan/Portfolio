import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import { profile } from '@/data/profile';
import { skillCategories } from '@/data/skills';

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
});
