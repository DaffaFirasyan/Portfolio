import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { certificates } from './certificates';
import { LIMITS, longest, STRESS_RATIO } from './constraints';
import { education } from './education';
import { experiences } from './experiences';
import { profile } from './profile';
import { projects } from './projects';
import { SECTIONS, shellProps } from './sections';
import { site } from './site';
import { skillCategories } from './skills';
import { skillIcon } from '@/lib/skillIcon';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const publicPath = (url: string) => join(process.cwd(), 'public', url.replace(/^\//, ''));

describe('constraints', () => {
  it('exposes the documented limits', () => {
    expect(LIMITS.profile.tagline).toBe(120);
    expect(LIMITS.project.title).toBe(48);
    expect(LIMITS.counts.projectsMax).toBe(9);
  });

  it('longest() returns the length of the longest string', () => {
    expect(longest(['ab', 'abcd', 'a'])).toBe(4);
    expect(longest([])).toBe(0);
  });

  it('stress ratio requires samples to reach 90% of a limit', () => {
    expect(STRESS_RATIO).toBe(0.9);
  });
});

describe('projects', () => {
  it('has a count inside the documented range', () => {
    expect(projects.length).toBeGreaterThanOrEqual(LIMITS.counts.projectsMin);
    expect(projects.length).toBeLessThanOrEqual(LIMITS.counts.projectsMax);
  });

  it('has unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every project a problem and an outcome', () => {
    for (const p of projects) {
      expect(p.problem.trim(), `${p.id}.problem`).not.toBe('');
      expect(p.outcome?.trim() ?? '', `${p.id}.outcome`).not.toBe('');
    }
  });

  it('marks at most three projects as featured', () => {
    expect(projects.filter((p) => p.featured).length).toBeLessThanOrEqual(
      LIMITS.counts.featuredMax,
    );
  });

  it('keeps text fields inside their limits', () => {
    for (const p of projects) {
      expect(p.title.length, `${p.id}.title`).toBeLessThanOrEqual(LIMITS.project.title);
      expect(p.problem.length, `${p.id}.problem`).toBeLessThanOrEqual(LIMITS.project.problem);
      expect(p.solution.length, `${p.id}.solution`).toBeLessThanOrEqual(LIMITS.project.solution);
      expect(p.outcome?.length ?? 0, `${p.id}.outcome`).toBeLessThanOrEqual(LIMITS.project.outcome);
      // `role` is optional now — a project may simply not state one — so this
      // caps it when present rather than assuming it is there.
      expect(p.role?.length ?? 0, `${p.id}.role`).toBeLessThanOrEqual(LIMITS.project.role);
      expect(p.stack.length, `${p.id}.stack`).toBeLessThanOrEqual(LIMITS.project.stack);
    }
  });

  it('stresses the layout — some project reaches 90% of each text limit', () => {
    expect(longest(projects.map((p) => p.title))).toBeGreaterThanOrEqual(
      LIMITS.project.title * STRESS_RATIO,
    );
    expect(longest(projects.map((p) => p.problem))).toBeGreaterThanOrEqual(
      LIMITS.project.problem * STRESS_RATIO,
    );
    expect(Math.max(...projects.map((p) => p.stack.length))).toBeGreaterThanOrEqual(
      LIMITS.project.stack * STRESS_RATIO,
    );
  });

  it('never carries an empty link value', () => {
    for (const p of projects) {
      for (const [key, value] of Object.entries(p.links)) {
        expect(value, `${p.id}.links.${key}`).toBeTruthy();
        expect(() => new URL(value as string)).not.toThrow();
      }
    }
  });
});

describe('skills', () => {
  const allSkills = skillCategories.flatMap((c) => c.skills);

  it('has three or four categories with unique ids', () => {
    expect(skillCategories.length).toBeGreaterThanOrEqual(3);
    expect(skillCategories.length).toBeLessThanOrEqual(4);
    const ids = skillCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps skill names inside the limit', () => {
    for (const s of allSkills) {
      expect(s.name.length, s.name).toBeLessThanOrEqual(LIMITS.skill.name);
    }
  });

  // There is deliberately no stress assertion here, and this is the third
  // place that decision has landed — `certificate.issuer` and
  // `experience.organization` reached it first, and the handoff predicted
  // this one. A skill name is a proper noun or an established term of art:
  // RAG, Git, SQL, Neo4j, Docker. None of them can be padded to 90% of a
  // 22-character limit to satisfy a test, and inventing a longer synonym to
  // keep a guard green would be putting the test's convenience ahead of the
  // page's honesty.
  //
  // What that costs is worth stating plainly: nothing in the data now
  // exercises the layout at its declared maximum, so the 22 above is held up
  // by the browser measurement that produced it (162px of row, 22 characters)
  // and by the limit assertion, not by a rendered example. Re-measure if the
  // Skills card ever stops being four across.

  it('only references project ids that exist', () => {
    const projectIds = new Set(projects.map((p) => p.id));
    for (const s of allSkills) {
      for (const id of s.relatedProjectIds ?? []) {
        expect(projectIds.has(id), `${s.name} references missing project "${id}"`).toBe(true);
      }
    }
  });

  it('links at least one skill to a project so cross-highlight has something to show', () => {
    expect(allSkills.some((s) => (s.relatedProjectIds?.length ?? 0) > 0)).toBe(true);
  });

  it('gives every skill an icon name that actually resolves to one', () => {
    // `icon` sat in the data and the type, unread by any component, for as
    // long as this field has existed — a string with nowhere to resolve
    // wouldn't be a broken *reference* the way a bad relatedProjectIds entry
    // is, so nothing else here would have caught a typo.
    for (const s of allSkills) {
      expect(skillIcon(s.icon), `${s.name} has no icon for "${s.icon}"`).toBeDefined();
    }
  });
});

describe('profile', () => {
  it('keeps the tagline inside the limit and near it', () => {
    expect(profile.tagline.length).toBeLessThanOrEqual(LIMITS.profile.tagline);
    expect(profile.tagline.length).toBeGreaterThanOrEqual(
      LIMITS.profile.tagline * STRESS_RATIO,
    );
  });

  it('has three or four roles inside the length limit', () => {
    expect(profile.roles.length).toBeGreaterThanOrEqual(3);
    expect(profile.roles.length).toBeLessThanOrEqual(LIMITS.profile.roles);
    for (const role of profile.roles) {
      expect(role.length, role).toBeLessThanOrEqual(LIMITS.profile.role);
    }
    expect(longest(profile.roles)).toBeGreaterThanOrEqual(
      LIMITS.profile.role * STRESS_RATIO,
    );
  });

  it('has two or three bio paragraphs inside the length limit', () => {
    expect(profile.bio.length).toBeGreaterThanOrEqual(2);
    expect(profile.bio.length).toBeLessThanOrEqual(LIMITS.profile.bio);
    for (const paragraph of profile.bio) {
      expect(paragraph.length).toBeLessThanOrEqual(LIMITS.profile.bioParagraph);
    }
    expect(longest(profile.bio)).toBeGreaterThanOrEqual(
      LIMITS.profile.bioParagraph * STRESS_RATIO,
    );
  });

  it('has a valid email and social urls', () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    for (const social of profile.socials) {
      expect(() => new URL(social.url), social.label).not.toThrow();
    }
  });
});

describe('experiences', () => {
  it('has unique ids', () => {
    const ids = experiences.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps text fields inside their limits', () => {
    for (const e of experiences) {
      expect(e.role.length, `${e.id}.role`).toBeLessThanOrEqual(LIMITS.experience.role);
      expect(e.organization.length, `${e.id}.organization`).toBeLessThanOrEqual(
        LIMITS.experience.organization,
      );
      expect(e.summary.length, `${e.id}.summary`).toBeLessThanOrEqual(LIMITS.experience.summary);
      expect(e.highlights.length, `${e.id}.highlights`).toBeGreaterThanOrEqual(2);
      expect(e.highlights.length, `${e.id}.highlights`).toBeLessThanOrEqual(
        LIMITS.experience.highlights,
      );
      for (const h of e.highlights) {
        expect(h.length, `${e.id} highlight`).toBeLessThanOrEqual(LIMITS.experience.highlight);
      }
    }
  });

  // The stress clauses for `role` and `organization` are gone, and this is the
  // fourth time that has happened — after certificate.issuer,
  // experience.organization's neighbours and skill.name. Both are proper nouns
  // owned by someone else: the real titles are "AI Full-Stack Developer Intern"
  // and "Human Capital Development Staff", the longest real employer is
  // "Perhimpunan Mahasiswa Bandung", and none can be padded to 90% of its limit
  // without inventing a job that does not exist. The ceiling below is the half
  // that protects the layout, and it stays.
  it('caps how many highlights an entry may carry', () => {
    expect(Math.max(...experiences.map((e) => e.highlights.length))).toBeLessThanOrEqual(
      LIMITS.experience.highlights,
    );
  });

  it('uses YYYY-MM dates that do not run backwards', () => {
    for (const e of experiences) {
      expect(e.startDate, `${e.id}.startDate`).toMatch(MONTH);
      if (e.endDate !== 'present') {
        expect(e.endDate, `${e.id}.endDate`).toMatch(MONTH);
        expect(e.endDate >= e.startDate, `${e.id} ends before it starts`).toBe(true);
      }
    }
  });

  it('marks every ongoing role as present, however many there are', () => {
    // This used to insist on at most one, which held while the content was
    // invented. The owner genuinely holds two organisational roles at once,
    // both running from September 2024, and bending a CV to keep an assertion
    // green would be lying about it. What is worth guarding is that "present"
    // means present — an ongoing entry still needs a real start date, and the
    // section gives every one of them the accent and the pulse dot it uses to
    // mean exactly that.
    const current = experiences.filter((e) => e.endDate === 'present');
    expect(current.length).toBeGreaterThan(0);
    for (const e of current) {
      expect(e.startDate, `${e.id} claims present but has no start date`).toMatch(MONTH);
    }
  });
});

describe('education', () => {
  it('keeps highlights inside their limits', () => {
    for (const e of education) {
      expect(e.highlights?.length ?? 0).toBeLessThanOrEqual(LIMITS.education.highlights);
      for (const h of e.highlights ?? []) {
        expect(h.length, h).toBeLessThanOrEqual(LIMITS.education.highlight);
      }
    }
  });

  it('does not end before it starts', () => {
    for (const e of education) {
      if (e.endYear !== 'present') {
        expect(e.endYear, e.id).toBeGreaterThanOrEqual(e.startYear);
      }
    }
  });
});

describe('certificates', () => {
  it('has unique ids and at least fourteen entries', () => {
    const ids = certificates.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(certificates.length).toBeGreaterThanOrEqual(14);
  });

  it('keeps text fields inside their limits', () => {
    for (const c of certificates) {
      expect(c.title.length, `${c.id}.title`).toBeLessThanOrEqual(LIMITS.certificate.title);
      expect(c.issuer.length, `${c.id}.issuer`).toBeLessThanOrEqual(LIMITS.certificate.issuer);
      expect(c.skills.length, `${c.id}.skills`).toBeLessThanOrEqual(LIMITS.certificate.skills);
    }
  });

  // The stress clauses for `title` and `issuer` are gone, and the reason is the
  // one this file has now met five times: both are names owned by someone else.
  // The real issuers are HackerRank, Huawei, Oracle Academy, BNSP and Telkom
  // University — none reaches 36 characters, and none can be made to without
  // renaming an institution. The longest real title is 59 against a 64.8 the
  // rule wanted. The ceiling below is what protects the layout, and it stays.
  it('caps how many skills a certificate may list', () => {
    expect(Math.max(...certificates.map((c) => c.skills.length))).toBeLessThanOrEqual(
      LIMITS.certificate.skills,
    );
  });

  // The YYYY-MM date check that stood here is gone with the fields it guarded.
  // Certificates carry no dates at all now: every scan states its own, the
  // lightbox shows the scan, and seven of the fourteen were placeholders that
  // would have contradicted the image they sat under. `Certificate` has no
  // date field, so this is enforced by the compiler rather than by a test.
  // Experience dates are unaffected and still checked above.

  it('never carries a present-but-invalid credential url', () => {
    for (const c of certificates) {
      if (c.credentialUrl === undefined) continue;
      expect(c.credentialUrl, `${c.id}.credentialUrl`).not.toBe('');
      expect(() => new URL(c.credentialUrl as string), c.id).not.toThrow();
    }
  });

  it('includes at least one certificate without a credential url', () => {
    expect(certificates.some((c) => c.credentialUrl === undefined)).toBe(true);
  });
});

describe('assets', () => {
  it('resolves every referenced file in public/', () => {
    const referenced = [
      profile.avatarUrl,
      profile.cvUrl,
      site.ogImage,
      ...projects.map((p) => p.thumbnail),
      ...projects.flatMap((p) => p.images ?? []),
      ...certificates.map((c) => c.imageUrl),
      ...certificates.map((c) => c.thumbnailUrl),
      ...education.map((e) => e.logoUrl).filter((u): u is string => Boolean(u)),
      ...experiences.map((e) => e.logoUrl).filter((u): u is string => Boolean(u)),
    ];

    for (const url of referenced) {
      expect(existsSync(publicPath(url)), `missing asset: ${url}`).toBe(true);
    }
  });
});

describe('sections', () => {
  it('has unique ids and contiguous indices', () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SECTIONS.map((s) => s.index)).toEqual(SECTIONS.map((_, i) => i));
  });

  it('gives every section except the hero a heading title', () => {
    for (const s of SECTIONS) {
      if (s.id === 'home') {
        expect(s.title, 'the hero renders the name as h1, not a section title').toBeUndefined();
      } else {
        expect(s.title?.trim() ?? '', `${s.id}.title`).not.toBe('');
      }
    }
  });

  it('builds shell props for every titled section', () => {
    for (const s of SECTIONS.filter((section) => section.title)) {
      expect(shellProps(s.id)).toEqual({
        id: s.id,
        index: s.index,
        label: s.label,
        title: s.title,
      });
    }
  });

  it('refuses to build shell props where the metadata is missing', () => {
    expect(() => shellProps('home'), 'the hero has no section title').toThrow(/home/);
    expect(() => shellProps('nonexistent')).toThrow(/nonexistent/);
  });
});
