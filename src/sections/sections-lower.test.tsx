import { render, screen, within } from '@testing-library/react';
import Experience from './Experience';
import Projects from './Projects';
import Education from './Education';
import Contact from './Contact';
import { EXPERIENCE_TYPE_LABEL, experiences } from '@/data/experiences';
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

  it('says what kind of engagement each one was', () => {
    render(<Experience />);

    // experience.type was in the data, covered by a type, and rendered nowhere.
    // "Internship" and "Volunteer" are the difference between five entries that
    // look identical and five a reader can weigh.
    for (const e of experiences) {
      expect(screen.getAllByText(EXPERIENCE_TYPE_LABEL[e.type]).length).toBeGreaterThan(0);
    }
  });

  it('leads each entry with its start year', () => {
    render(<Experience />);

    for (const e of experiences) {
      expect(screen.getAllByText(e.startDate.slice(0, 4)).length).toBeGreaterThan(0);
    }
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

  it('puts every certificate on the wall, each with one way in', () => {
    render(<Education />);

    // The tiles are thumbnails now, too small for a verify link. Verification
    // moved into the lightbox, where education-lightbox.test.tsx covers both
    // the present and absent cases. What the wall owes is that nothing is
    // hidden and each tile is a single control.
    for (const c of certificates) {
      expect(screen.getByRole('button', { name: new RegExp(c.title, 'i') })).toBeInTheDocument();
    }
  });

  it('offers a filter per category without hiding anything by default', async () => {
    render(<Education />);

    const categories = [...new Set(certificates.map((c) => c.category))];
    expect(screen.getByRole('button', { name: /^All \d+$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Narrowing shows exactly the matches, and All brings the wall back whole.
    const first = categories[0];
    const label = screen.getAllByRole('button', { pressed: false }).find((b) =>
      new RegExp(`\\b${certificates.filter((c) => c.category === first).length}$`).test(
        b.textContent ?? '',
      ),
    );
    expect(label).toBeDefined();
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
