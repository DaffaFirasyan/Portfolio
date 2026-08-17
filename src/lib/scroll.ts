export interface SectionVisibility {
  id: string;
  ratio: number;
}

/**
 * The section a reader is looking at, given how much of each is on screen.
 *
 * Ties break towards document order rather than towards whichever entry the
 * observer happened to report first: during a fast scroll several sections
 * cross the viewport in one frame with near-identical ratios, and picking by
 * report order makes the indicator jump around.
 *
 * With nothing visible — momentum scrolling past the end, or a collapsed
 * layout — the current section stands rather than resetting.
 */
export function pickActiveSection(
  visibility: SectionVisibility[],
  order: string[],
  current: string,
): string {
  let bestId = current;
  let bestRatio = 0;
  let bestIndex = Number.POSITIVE_INFINITY;

  for (const { id, ratio } of visibility) {
    const index = order.indexOf(id);
    if (index < 0 || ratio <= 0) continue;

    if (ratio > bestRatio || (ratio === bestRatio && index < bestIndex)) {
      bestId = id;
      bestRatio = ratio;
      bestIndex = index;
    }
  }

  return bestId;
}

/** How far down the page the reader is, from 0 to 1. */
export function scrollProgress(
  scrollY: number,
  documentHeight: number,
  viewportHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / scrollable));
}
