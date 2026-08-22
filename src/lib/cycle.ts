/**
 * The next index in a list that wraps at both ends.
 *
 * JavaScript's `%` keeps the sign of the dividend, so `-1 % 5` is `-1` rather
 * than `4` — stepping back from the first item would index nothing. Adding the
 * length before the second modulo is what makes the wrap work in both
 * directions.
 */
export function cycleIndex(current: number, length: number, delta: number): number {
  if (length <= 0) return 0;
  return (((current + delta) % length) + length) % length;
}
