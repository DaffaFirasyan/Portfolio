import { LIMITS, longest, STRESS_RATIO } from './constraints';
import { experiences } from './experiences';
import { profile } from './profile';
import { projects } from './projects';
import { skillCategories } from './skills';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

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
      expect(p.role.length, `${p.id}.role`).toBeLessThanOrEqual(LIMITS.project.role);
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

  it('stresses the layout — some skill name reaches 90% of the limit', () => {
    expect(longest(allSkills.map((s) => s.name))).toBeGreaterThanOrEqual(
      LIMITS.skill.name * STRESS_RATIO,
    );
  });

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

  it('stresses the layout on role, organization and highlights', () => {
    expect(longest(experiences.map((e) => e.role))).toBeGreaterThanOrEqual(
      LIMITS.experience.role * STRESS_RATIO,
    );
    expect(longest(experiences.map((e) => e.organization))).toBeGreaterThanOrEqual(
      LIMITS.experience.organization * STRESS_RATIO,
    );
    expect(Math.max(...experiences.map((e) => e.highlights.length))).toBe(
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

  it('has at most one entry still marked present', () => {
    expect(experiences.filter((e) => e.endDate === 'present').length).toBeLessThanOrEqual(1);
  });
});
