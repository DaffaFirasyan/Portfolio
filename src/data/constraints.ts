export const STRESS_RATIO = 0.9;

export const LIMITS = {
  profile: { tagline: 120, role: 28, bioParagraph: 420, roles: 4, bio: 3 },
  project: { title: 48, problem: 180, solution: 180, outcome: 140, role: 40, stack: 6 },
  experience: { role: 48, organization: 40, summary: 140, highlight: 160, highlights: 4 },
  certificate: { title: 72, issuer: 40, skills: 4 },
  education: { highlight: 160, highlights: 3 },
  skill: { name: 24 },
  counts: { projectsMin: 4, projectsMax: 9, featuredMax: 3 },
} as const;

export function longest(values: string[]): number {
  return values.reduce((max, value) => Math.max(max, value.length), 0);
}
