import type { SectionMeta } from '@/types';
import { railGeometry } from './rail';

const sections: SectionMeta[] = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1 },
  { id: 'skills', label: 'Skills', index: 2 },
  { id: 'contact', label: 'Contact', index: 3 },
];

describe('railGeometry', () => {
  it('spreads the nodes evenly from the top of the rail to the bottom', () => {
    const { nodes } = railGeometry(sections, 'home', 0);
    expect(nodes.map((n) => n.offset)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });

  it('carries the label through so the rail needs no data of its own', () => {
    const { nodes } = railGeometry(sections, 'home', 0);
    expect(nodes.map((n) => n.label)).toEqual(['Home', 'About', 'Skills', 'Contact']);
  });

  it('marks what is behind the reader done, what is ahead todo', () => {
    const { nodes } = railGeometry(sections, 'skills', 0.6);
    expect(nodes.map((n) => n.state)).toEqual(['done', 'done', 'active', 'todo']);
  });

  it('leaves every node todo when the active id is not in the list', () => {
    const { nodes } = railGeometry(sections, 'nowhere', 0.5);
    expect(nodes.every((n) => n.state === 'todo')).toBe(true);
  });

  it('holds the fill inside the band between the active node and the next', () => {
    expect(railGeometry(sections, 'about', 0.9).fill).toBeCloseTo(2 / 3);
    expect(railGeometry(sections, 'about', 0).fill).toBeCloseTo(1 / 3);
    expect(railGeometry(sections, 'about', 0.5).fill).toBeCloseTo(0.5);
  });

  it('fills the rail completely in the last section', () => {
    expect(railGeometry(sections, 'contact', 0.95).fill).toBe(1);
  });

  it('clamps progress that arrives outside 0..1', () => {
    expect(railGeometry(sections, 'nowhere', 1.4).fill).toBe(1);
    expect(railGeometry(sections, 'nowhere', -0.2).fill).toBe(0);
    expect(railGeometry(sections, 'nowhere', Number.NaN).fill).toBe(0);
  });

  it('survives one section and no sections at all', () => {
    expect(railGeometry([sections[0]], 'home', 0.5)).toEqual({
      nodes: [{ id: 'home', label: 'Home', offset: 0, state: 'active' }],
      fill: 0.5,
    });
    expect(railGeometry([], 'home', 0.5)).toEqual({ nodes: [], fill: 0.5 });
  });
});
