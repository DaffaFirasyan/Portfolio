import { LIMITS, longest, STRESS_RATIO } from './constraints';

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
