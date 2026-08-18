import { cssToken } from './token';

describe('cssToken', () => {
  it('never returns a var() reference, which a canvas cannot use', () => {
    for (const name of ['--color-accent', '--color-accent-2', '--color-edge']) {
      expect(cssToken(name)).not.toMatch(/^var\(/);
    }
  });

  it('falls back to the value in index.css when the token is not applied', () => {
    // jsdom applies no stylesheet, so this exercises the fallback path.
    expect(cssToken('--color-accent')).toBe('#f0a32e');
    expect(cssToken('--color-accent-2')).toBe('#5ec8d8');
  });

  it('returns a usable colour even for a token it has never heard of', () => {
    expect(cssToken('--color-nonesuch')).toMatch(/^#/);
  });

  it('prefers the computed value over the fallback when one is set', () => {
    document.documentElement.style.setProperty('--color-accent', '#123456');
    expect(cssToken('--color-accent')).toBe('#123456');
    document.documentElement.style.removeProperty('--color-accent');
  });
});
