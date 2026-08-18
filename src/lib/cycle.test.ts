import { cycleIndex } from './cycle';

describe('cycleIndex', () => {
  it('steps forward and back', () => {
    expect(cycleIndex(0, 5, 1)).toBe(1);
    expect(cycleIndex(3, 5, -1)).toBe(2);
  });

  it('wraps past the end', () => {
    expect(cycleIndex(4, 5, 1)).toBe(0);
  });

  it('wraps before the start', () => {
    // The modulo operator alone returns -1 here, which would index nothing.
    expect(cycleIndex(0, 5, -1)).toBe(4);
  });

  it('handles steps larger than the list', () => {
    expect(cycleIndex(0, 5, 7)).toBe(2);
    expect(cycleIndex(0, 5, -7)).toBe(3);
  });

  it('stays put in a single-item list', () => {
    expect(cycleIndex(0, 1, 1)).toBe(0);
    expect(cycleIndex(0, 1, -1)).toBe(0);
  });

  it('returns 0 for an empty list rather than NaN', () => {
    expect(cycleIndex(0, 0, 1)).toBe(0);
  });
});
