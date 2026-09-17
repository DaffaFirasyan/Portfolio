export const STRESS_RATIO = 0.9;

export const LIMITS = {
  // `bio` went 3 -> 4 on 2026-08-22, and the reason is a measurement rather
  // than a preference. About's prose column sat 176px shorter than the
  // credential rail beside it — 8 lines at 78 characters and a 24px line
  // height, measured on the built page at 1280. Paragraphs one and two were
  // already at 407 and 419 of 420, so there was nowhere to put the words
  // except a new paragraph.
  profile: { tagline: 120, role: 28, bioParagraph: 420, roles: 5, bio: 4 },
  project: { title: 48, problem: 180, solution: 180, outcome: 140, role: 40, stack: 6 },
  experience: { role: 48, organization: 40, summary: 140, highlight: 160, highlights: 4 },
  certificate: { title: 72, issuer: 40, skills: 4 },
  education: { highlight: 160, highlights: 3 },
  // 22, not the 24 this used to say: measured in a browser, a skill row in a
  // four-across card at 1280 has 162px for its name, which fits 22 characters.
  // The section is capped at max-w-[1200px], so that column never gets wider —
  // 22 is the ceiling at every viewport above lg, not just at 1280. The old 24
  // let two characters through that the layout could not render on one line.
  skill: { name: 22 },
  counts: { projectsMin: 4, projectsMax: 9, featuredMax: 3 },
} as const;

export function longest(values: string[]): number {
  return values.reduce((max, value) => Math.max(max, value.length), 0);
}
