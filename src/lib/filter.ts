/** The pseudo-category meaning "do not filter". */
export const ALL = 'All';

interface Categorised {
  category: string;
}

/**
 * The filter tabs to offer, in the order the data introduces them.
 *
 * First-appearance order rather than alphabetical: sorting would silently
 * rearrange the tabs whenever a project is added, and the order projects are
 * listed in is already an editorial decision.
 */
export function categoriesOf<T extends Categorised>(items: T[]): string[] {
  const seen: string[] = [ALL];

  for (const item of items) {
    if (!seen.includes(item.category)) seen.push(item.category);
  }

  return seen;
}

/**
 * The items in one category, or all of them.
 *
 * Order is preserved, so switching categories never reshuffles what stays on
 * screen — the cards that remain hold their positions.
 */
export function filterByCategory<T extends Categorised>(items: T[], category: string): T[] {
  if (category === ALL) return items;
  return items.filter((item) => item.category === category);
}
