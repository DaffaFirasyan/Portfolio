import type { SectionMeta } from '@/types';

export type NodeState = 'done' | 'active' | 'todo';

export interface RailNode {
  id: string;
  label: string;
  /** 0..1 down the rail. */
  offset: number;
  state: NodeState;
}

export interface RailGeometry {
  nodes: RailNode[];
  /** 0..1 length of the filled part of the rail. */
  fill: number;
}

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/**
 * Where the rail's dots sit and how far the line is filled.
 *
 * The fill is page progress, clamped between the active node and the next one.
 * Sections differ in height, so raw progress routinely overshoots a dot the
 * reader has not reached — a filled line running past a hollow dot reads as a
 * bug rather than as a subtlety. The clamp keeps the line moving smoothly while
 * it and the active dot never contradict each other.
 */
export function railGeometry(
  sections: SectionMeta[],
  activeId: string,
  progress: number,
): RailGeometry {
  const last = sections.length - 1;
  const offsetOf = (index: number) => (last <= 0 ? 0 : index / last);
  const activeIndex = sections.findIndex((section) => section.id === activeId);

  const nodes: RailNode[] = sections.map((section, index) => ({
    id: section.id,
    label: section.label,
    offset: offsetOf(index),
    state:
      activeIndex < 0 || index > activeIndex ? 'todo' : index === activeIndex ? 'active' : 'done',
  }));

  const safe = Number.isFinite(progress) ? progress : 0;
  if (activeIndex < 0) return { nodes, fill: clamp(safe, 0, 1) };

  const low = offsetOf(activeIndex);
  const high = activeIndex >= last ? 1 : offsetOf(activeIndex + 1);
  return { nodes, fill: clamp(safe, low, high) };
}
