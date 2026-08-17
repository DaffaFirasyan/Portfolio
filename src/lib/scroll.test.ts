import { pickActiveSection, scrollProgress } from './scroll';

const ORDER = ['home', 'about', 'skills', 'experience'];

describe('pickActiveSection', () => {
  it('picks the most visible section', () => {
    expect(
      pickActiveSection([{ id: 'about', ratio: 0.3 }, { id: 'skills', ratio: 0.8 }], ORDER, 'home'),
    ).toBe('skills');
  });

  it('breaks ties by document order, so fast scrolling does not jitter', () => {
    expect(
      pickActiveSection([{ id: 'skills', ratio: 0.5 }, { id: 'about', ratio: 0.5 }], ORDER, 'home'),
    ).toBe('about');
  });

  it('keeps the current section when nothing is visible', () => {
    expect(pickActiveSection([], ORDER, 'skills')).toBe('skills');
    expect(pickActiveSection([{ id: 'about', ratio: 0 }], ORDER, 'skills')).toBe('skills');
  });

  it('ignores ids that are not in the known order', () => {
    expect(pickActiveSection([{ id: 'ghost', ratio: 0.9 }], ORDER, 'home')).toBe('home');
  });
});

describe('scrollProgress', () => {
  it('reports 0 at the top and 1 at the bottom', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(2000, 3000, 1000)).toBe(1);
  });

  it('reports the fraction in between', () => {
    expect(scrollProgress(1000, 3000, 1000)).toBeCloseTo(0.5);
  });

  it('returns 0 when the page does not scroll', () => {
    expect(scrollProgress(0, 500, 1000)).toBe(0);
    expect(scrollProgress(0, 1000, 1000)).toBe(0);
  });

  it('clamps values outside the range, which happens during overscroll', () => {
    expect(scrollProgress(-50, 3000, 1000)).toBe(0);
    expect(scrollProgress(99999, 3000, 1000)).toBe(1);
  });
});
