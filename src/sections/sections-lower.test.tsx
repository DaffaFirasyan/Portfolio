import { render, screen, within } from '@testing-library/react';
import Experience from './Experience';
import Projects from './Projects';
import Education from './Education';
import Contact from './Contact';
import { experiences } from '@/data/experiences';
import { projects } from '@/data/projects';
import { certificates } from '@/data/certificates';
import { profile } from '@/data/profile';

describe('Experience', () => {
  it('renders every role with its organisation and marks the current one', () => {
    render(<Experience />);
    for (const e of experiences) {
      expect(screen.getByRole('heading', { level: 3, name: e.role })).toBeInTheDocument();
      expect(screen.getAllByText(e.organization).length).toBeGreaterThan(0);
    }
    // The date line renders as "Feb 2026 — Present" in a single element,
    // so match the tail rather than the bare word.
    expect(screen.getAllByText(/— Present$/).length).toBe(
      experiences.filter((e) => e.endDate === 'present').length,
    );
  });
});

describe('Projects', () => {
  it('renders every project title and problem statement', () => {
    render(<Projects />);
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
      expect(screen.getByText(p.problem)).toBeInTheDocument();
    }
  });

  it('renders a repo link only for projects that have one', () => {
    render(<Projects />);
    const withRepo = projects.filter((p) => p.links.repo);
    expect(screen.getAllByRole('link', { name: /repository/i })).toHaveLength(withRepo.length);
  });

  it('opens external links safely', () => {
    render(<Projects />);
    for (const link of screen.getAllByRole('link', { name: /repository|live demo/i })) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });
});

describe('Education', () => {
  it('renders the degree and every certificate title', () => {
    render(<Education />);
    expect(screen.getByText('Bachelor of Information Systems')).toBeInTheDocument();
    for (const c of certificates) {
      expect(screen.getByText(c.title)).toBeInTheDocument();
    }
  });

  it('renders a verify link only for certificates that carry one', () => {
    render(<Education />);
    const verifiable = certificates.filter((c) => c.credentialUrl);
    expect(screen.getAllByRole('link', { name: /verify/i })).toHaveLength(verifiable.length);
  });
});

describe('Contact', () => {
  it('renders a mailto link and every social link', () => {
    render(<Contact />);
    const mail = screen.getByRole('link', { name: profile.email });
    expect(mail).toHaveAttribute('href', `mailto:${profile.email}`);

    const list = screen.getByRole('list', { name: /social/i });
    expect(within(list).getAllByRole('link')).toHaveLength(profile.socials.length);
  });
});
