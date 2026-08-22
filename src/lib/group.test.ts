import type { Certificate } from '@/types';
import { CATEGORY_ORDER, groupByCategory } from './group';

const make = (id: string, category: Certificate['category']): Certificate => ({
  id,
  title: `${id} title`,
  issuer: 'Issuer',
  imageUrl: `/certificates/${id}.webp`,
  thumbnailUrl: `/certificates/thumb-${id}.webp`,
  category,
  skills: ['SQL'],
});

describe('groupByCategory', () => {
  it('keeps each certificate at its position in the flat list', () => {
    const list = [
      make('a', 'course'),
      make('b', 'competition'),
      make('c', 'course'),
      make('d', 'workshop'),
    ];

    const groups = groupByCategory(list);
    const flat = groups.flatMap((g) => g.items);

    // The lightbox walks the flat array by index with the arrow keys. If
    // grouping renumbered anything, the arrows would jump to the wrong
    // certificate — so every item carries the index it had before grouping.
    for (const item of flat) {
      expect(list[item.index], `index ${item.index}`).toBe(item.certificate);
    }
    expect(flat).toHaveLength(list.length);
  });

  it('keeps data order inside a group', () => {
    const list = [make('a', 'course'), make('b', 'competition'), make('c', 'course')];
    const courses = groupByCategory(list).find((g) => g.category === 'course');

    expect(courses?.items.map((i) => i.certificate.id)).toEqual(['a', 'c']);
  });

  it('returns groups in a documented order, not the order they happen to appear', () => {
    // Object key order would put workshop first here; the display order is a
    // decision, so it lives in CATEGORY_ORDER rather than in the data.
    const list = [make('a', 'workshop'), make('b', 'competition')];
    const groups = groupByCategory(list);

    const expected = CATEGORY_ORDER.filter((c) => c === 'workshop' || c === 'competition');
    expect(groups.map((g) => g.category)).toEqual(expected);
  });

  it('omits a category nothing falls into', () => {
    const groups = groupByCategory([make('a', 'course')]);

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('course');
  });

  it('gives every group a readable label and a count', () => {
    const groups = groupByCategory([make('a', 'course'), make('b', 'course')]);

    expect(groups[0].label).toMatch(/course/i);
    expect(groups[0].items).toHaveLength(2);
  });

  it('covers every category the type allows, so a new one cannot vanish silently', () => {
    const list = CATEGORY_ORDER.map((c, i) => make(`c${i}`, c));
    const groups = groupByCategory(list);

    expect(groups.map((g) => g.category)).toEqual([...CATEGORY_ORDER]);
    expect(groups.flatMap((g) => g.items)).toHaveLength(CATEGORY_ORDER.length);
  });

  it('returns nothing for an empty list', () => {
    expect(groupByCategory([])).toEqual([]);
  });
});
