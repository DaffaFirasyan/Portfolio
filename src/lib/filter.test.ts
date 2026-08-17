import { ALL, categoriesOf, filterByCategory } from './filter';
import { projects } from '@/data/projects';

describe('categoriesOf', () => {
  it('lists every category once, in first-appearance order, with All first', () => {
    const list = categoriesOf(projects);

    expect(list[0]).toBe(ALL);
    expect(new Set(list).size).toBe(list.length);
    for (const project of projects) expect(list).toContain(project.category);
  });

  it('follows the data order rather than sorting alphabetically', () => {
    const list = categoriesOf([
      { category: 'Web' },
      { category: 'AI/ML' },
      { category: 'Web' },
    ] as Parameters<typeof categoriesOf>[0]);

    // Sorting would put AI/ML first and quietly reorder the tabs whenever the
    // data changes; first-appearance keeps the author in control.
    expect(list).toEqual([ALL, 'Web', 'AI/ML']);
  });
});

describe('filterByCategory', () => {
  it('returns everything for All', () => {
    expect(filterByCategory(projects, ALL)).toHaveLength(projects.length);
  });

  it('returns only the matching category', () => {
    const category = projects[0].category;
    const result = filterByCategory(projects, category);

    expect(result.length).toBeGreaterThan(0);
    for (const project of result) expect(project.category).toBe(category);
  });

  it('preserves the original order rather than reshuffling', () => {
    const category = projects[0].category;
    const result = filterByCategory(projects, category);
    const expected = projects.filter((p) => p.category === category);

    expect(result.map((p) => p.id)).toEqual(expected.map((p) => p.id));
  });

  it('returns nothing for a category no project uses', () => {
    expect(filterByCategory(projects, 'Nonexistent')).toHaveLength(0);
  });
});
