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

  it('never lets the pulse dot decide where a year starts', () => {
    const { container } = render(<Experience />);

    // The year cell used to be `justify-end` inside a 7rem column. Measured at
    // 1280: the year renders 120–123px wide, so it did not fit and the
    // overflow went leftwards, putting every year past the section's own left
    // edge — and because the dot shares this flex row, the one current entry
    // lost a further 18px to it and sat 19px left of its neighbours.
    //
    // jsdom computes no layout, so this guards the two mechanisms rather than
    // the pixels: left-aligned, so only the year's own box sets its start, and
    // a column wide enough that it fits.
    for (const cell of container.querySelectorAll('ol > li > div:first-child')) {
      expect(cell.className).not.toMatch(/justify-end/);
    }
    for (const item of container.querySelectorAll('ol > li')) {
      expect(item.className).toContain('md:grid-cols-[10rem_1fr]');
    }
  });
});

describe('Projects', () => {
  it('gives every project a heading, in both tiers', () => {
    render(<Projects />);

    // The quiet tier is rows now: name on the surface, everything else a click
    // away. So the heading is what every project owes — it is how a screen
    // reader moves between them — while the featured rows additionally lead
    // with their outcome, and the problem sentence lives in the dialog only.
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
    }

    const featured = projects.filter((p) => p.featured);
    for (const p of featured) {
      expect(screen.getByText(p.outcome!)).toBeInTheDocument();
    }
  });

  it('renders a repo link only for featured projects that have one', () => {
    render(<Projects />);

    // Links live where there is room for them: the featured rows and the
    // dialog. A 76px row carrying three controls would be a worse row.
    // queryAll, not getAll: getAll throws on an empty result, and none of the
    // real projects carry a repo URL yet. Zero expected and zero found is the
    // assertion doing its job — no project renders a link it does not have.
    const withRepo = projects.filter((p) => p.featured && p.links.repo);
    expect(screen.queryAllByRole('link', { name: /repository/i })).toHaveLength(withRepo.length);
  });

  it('opens external links safely', () => {
    render(<Projects />);
    for (const link of screen.queryAllByRole('link', { name: /repository|live demo/i })) {
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
    // Matched on the whole accessible name rather than a regex built from the
    // title. Real titles broke that twice over: "Python (Basic)" has regex
    // groups in it, and "Web Developer" is a substring of "Junior Web
    // Developer — Programming and Software Development", so one tile matched
    // two certificates. The tile names itself with its title and issuer, and
    // asserting both is stricter than what it replaced.
    for (const c of certificates) {
      expect(
        screen.getByRole('button', {
          name: (name: string) => name.startsWith(c.title) && name.includes(c.issuer),
        }),
      ).toBeInTheDocument();
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
