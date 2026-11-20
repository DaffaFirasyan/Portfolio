import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contrast } from './contrast';

const css = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf8');

function tokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/--c-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
  );
}

const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
const light = tokens(css.slice(css.indexOf(':root {'), darkAt));
const dark = tokens(css.slice(darkAt, css.indexOf('@theme')));

describe('contrast', () => {
  it('knows the extremes', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});

describe.each([
  ['light', light],
  ['dark', dark],
])('%s palette', (_mode, palette) => {
  it('defines every token', () => {
    for (const name of ['ground', 'surface', 'elevated', 'hair', 'ink', 'muted', 'seal', 'on-seal', 'danger']) {
      expect(palette[name], `--c-${name}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it.each([
    ['ink', 'ground'],
    ['ink', 'surface'],
    ['muted', 'ground'],
    ['muted', 'surface'],
    ['seal', 'ground'],
    ['seal', 'surface'],
    ['on-seal', 'seal'],
    ['danger', 'ground'],
    ['danger', 'surface'],
  ])('%s on %s clears 4.5:1', (fg, bg) => {
    expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
