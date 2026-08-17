import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import { profile } from '@/data/profile';
import { skillCategories } from '@/data/skills';

describe('Hero', () => {
  it('renders the name as the only h1, plus tagline and both calls to action', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument();
    expect(screen.getByText(profile.tagline)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: /download cv/i })).toHaveAttribute('href', profile.cvUrl);
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
