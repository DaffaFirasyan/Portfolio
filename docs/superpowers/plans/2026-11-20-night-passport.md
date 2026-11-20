# Night Passport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the design-plate look with a night-sky portfolio whose reading is rewarded by a passport of stamps, with a canvas 2D sky behind a calm reading column.

**Architecture:** A fixed canvas (`src/sky/`) paints stars, parallax, pointer drift, project constellations, dawn progress and an occasional comet. A passport (`src/passport/`) records which sections were read (visible 5 s and scrolled past) plus three secret stamps, persisted in `localStorage`. The sky adapts through three tiers (full, lite, still) chosen from measured frame time and user preferences. All copy stays in `src/data/i18n/dictionary.ts`.

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind 4 (`@theme` tokens), Vitest + Testing Library + jsdom. No new runtime dependency except one font package (`@fontsource-variable/fraunces`).

Spec: `docs/superpowers/specs/2026-11-20-night-passport-design.md`.

---

## House rules for whoever executes this

- **The owner commits himself.** Every task ends with a "Checkpoint" step that lists exact paths and a message. Do not run `git add` or `git commit` unless the owner has said to; otherwise stop at the checkpoint and report. **Never `git add -A`.**
- Windows, PowerShell. Run commands from the repo root `C:\Daffa\Kuliah\PROJECT\PORTFOLIO-REACT`.
- Components use semantic tokens only (`bg-void`, `text-primary`, `text-muted`, `border-edge`, `bg-surface`, `text-accent`, `text-on-accent`). No hex colours and no `dark:` in components. No blur, no glow, no shadow.
- All copy lives in `src/data/i18n/dictionary.ts` (EN and ID). Do not run prettier on existing files (it flips quotes).
- Do not touch `public/profile/avatar.webp`. Do not run `npm run avatar` or `npm run placeholders`.
- A browser check is part of "done". Visual work with a green suite has shipped broken five times in this project.

## File structure

| File | Responsibility |
|---|---|
| `src/lib/contrast.ts` (+test) | WCAG contrast maths; the test reads `index.css` and fails if any text pair drops below 4.5:1 |
| `src/index.css` | Night/chart tokens, serif display font token, stamp press keyframes |
| `src/lib/token.ts` (+test) | Canvas colour fallbacks updated to the new palette |
| `src/sky/engine.ts` (+test) | Pure sky logic: seeded stars, parallax constants, constellation paths, tier choice, comet path |
| `src/sky/SkyCanvas.tsx` (+test) | Canvas, loop, tiers, pointer, scroll, constellations, comet, finale dots |
| `src/passport/stamps.ts` | Stamp ids, constants, storage load/save |
| `src/passport/sound.ts` | WebAudio click (no files) |
| `src/passport/PassportProvider.tsx` (+test) | Stamp state, `earn`, `justEarned`, sound preference, inert default |
| `src/passport/useStampOnRead.ts` (+test) | The "5 s in view and scrolled past" rule |
| `src/passport/StampMark.tsx` | The SVG stamp (dashed when empty, inked when earned) |
| `src/passport/stampName.ts` | Name and hint of each stamp in the current language |
| `src/passport/Passport.tsx` (+test) | Corner chip, live region, sheet with stamps, reward and sound toggle |
| `src/passport/secrets.test.tsx` | Secret stamps wired from language toggle, contact and hero |
| `src/components/layout/SectionShell.tsx` | Stamp slot at the end of each section, reading rule hook |
| `src/sections/Hero.tsx` | Passport data page |
| `src/App.tsx` | Providers, sky, chip, footer clearance |
| `src/test/stubs.ts` | `HTMLCanvasElement.getContext` stub returning `null` |

---

### Task 0: Preconditions and branch

**Files:** none

- [ ] **Step 1: Check the tree**

Run: `git status --short`
Expected: the design-plate changes appear as modified/deleted/untracked. If the owner has not committed them, **stop and ask him to commit `redesign/design-plate` first** (branching from an uncommitted tree mixes two designs).

- [ ] **Step 2: Create the branch**

Run: `git switch -c redesign/night-passport`
Expected: `Switched to a new branch 'redesign/night-passport'`

- [ ] **Step 3: Baseline**

Run: `npm test`
Expected: all tests pass (221 at the time of writing). Note the count; Task 11 updates it.

---

### Task 1: Palette, font, contrast guard

**Files:**
- Create: `src/lib/contrast.ts`, `src/lib/contrast.test.ts`
- Modify: `src/index.css`, `src/lib/token.ts`, `src/lib/token.test.ts`, `src/main.tsx`, `package.json` (via npm)

- [ ] **Step 1: Write the failing contrast test**

`src/lib/contrast.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { contrast } from './contrast';

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

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
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/contrast.test.ts`
Expected: FAIL, `Cannot find module './contrast'`.

- [ ] **Step 3: Write `src/lib/contrast.ts`**

```ts
function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG contrast ratio between two `#rrggbb` colours, 1 to 21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Replace the tokens in `src/index.css`**

Replace everything from the comment `/* Warm paper and a never-pure-black ink` through the closing brace of `@theme { … }` (lines 8–56) with:

```css
/* A night sky by default and a printed star chart in daylight. Components use
   the semantic tokens below and never name a mode; the values behind them swap
   with prefers-color-scheme. Every text pair is checked by
   src/lib/contrast.test.ts, which reads this file and fails under 4.5:1. */
:root {
  color-scheme: light dark;
  --c-ground: #eef1f7;
  --c-surface: #e1e6f1;
  --c-elevated: #d6dcea;
  --c-hair: #b9c0d4;
  --c-ink: #11162b;
  --c-muted: #4a5272;
  --c-seal: #8a4b00;
  --c-on-seal: #eef1f7;
  --c-danger: #b3261e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --c-ground: #0c1022;
    --c-surface: #151a33;
    --c-elevated: #1d2342;
    --c-hair: #2c3358;
    --c-ink: #eef0ff;
    --c-muted: #a3a9c9;
    --c-seal: #f2c14e;
    --c-on-seal: #0c1022;
    --c-danger: #ff8a80;
  }
}

@theme {
  --color-void: var(--c-ground);
  --color-surface: var(--c-surface);
  --color-elevated: var(--c-elevated);
  --color-edge: var(--c-hair);
  --color-primary: var(--c-ink);
  --color-muted: var(--c-muted);
  --color-accent: var(--c-seal);
  --color-on-accent: var(--c-on-seal);
  --color-danger: var(--c-danger);

  /* A soft serif for the name and the section titles, Geist for reading, mono
     for coordinates, dates and credit-row labels. */
  --font-display: 'Fraunces Variable', Georgia, serif;
  --font-sans: 'Geist Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
}
```

- [ ] **Step 5: Replace the stamp animation in `src/index.css`**

Find the block that starts `/* ----… The one moment: the letterpress stamp` and ends after `.stamp { animation: press … }` inside its media query (the `@keyframes press` plus the `@media (prefers-reduced-motion: no-preference) { .stamp { … } }`). Replace it with:

```css
/* ---------------------------------------------------------------------------
   A stamp lands on the page. `.stamp` is the resting tilt; `.stamp-new` is added
   for a few seconds to the stamp that was just earned and presses it down.
   Transform and opacity only, and only when motion is welcome.
   --------------------------------------------------------------------------- */
@keyframes press {
  0% {
    opacity: 0;
    transform: translateY(-1.25rem) rotate(-16deg) scale(1.18);
  }
  55% {
    opacity: 1;
    transform: translateY(0.15rem) rotate(-9deg) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(-9deg) scale(1);
  }
}

.stamp {
  transform: rotate(-9deg);
}

@media (prefers-reduced-motion: no-preference) {
  .stamp-new {
    animation: press 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
}
```

Then delete the final block of the file (from `/* Below lg the plate stacks under the text` to the end), which drove the old stamp with a view timeline.

- [ ] **Step 6: Install and load the serif**

Run: `npm view @fontsource-variable/fraunces version`
Then: `npm install @fontsource-variable/fraunces@<that version>` (use the exact number printed, with a caret in package.json as npm writes it).

In `src/main.tsx` add, after the Geist import: `import '@fontsource-variable/fraunces';`

- [ ] **Step 7: Update the canvas fallbacks in `src/lib/token.ts`**

Replace the `FALLBACKS` object with:

```ts
/** Fallbacks match the dark palette in src/index.css, for the render before styles are applied. */
const FALLBACKS: Record<string, string> = {
  '--color-accent': '#f2c14e',
  '--color-edge': '#2c3358',
  '--color-muted': '#a3a9c9',
  '--color-primary': '#eef0ff',
  '--color-void': '#0c1022',
};
```

and delete the line above it (`/** Fallbacks match src/index.css, … */`) so there is one comment. In `src/lib/token.test.ts` replace the `for` list with `['--color-accent', '--color-edge', '--color-primary']`, and the fallback test body with:

```ts
    expect(cssToken('--color-accent')).toBe('#f2c14e');
    expect(cssToken('--color-void')).toBe('#0c1022');
```

- [ ] **Step 8: Run**

Run: `npx vitest run src/lib/contrast.test.ts src/lib/token.test.ts`
Expected: PASS. If a pair is under 4.5, change that token (not the test) and re-run.

- [ ] **Step 9: Checkpoint**

Stage only: `src/lib/contrast.ts src/lib/contrast.test.ts src/index.css src/lib/token.ts src/lib/token.test.ts src/main.tsx package.json package-lock.json`
Message: `feat(design): night and star-chart palette with a contrast guard`

---

### Task 2: Sky engine (pure logic)

**Files:**
- Create: `src/sky/engine.ts`, `src/sky/engine.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/sky/engine.test.ts`:

```ts
import {
  cometPosition,
  makeStars,
  medianOf,
  nextCometDelay,
  nextTier,
  pathFor,
  seeded,
  startTier,
  withAlpha,
} from './engine';

describe('seeded', () => {
  it('repeats for the same seed and differs for another', () => {
    const a = seeded(1);
    const b = seeded(1);
    const c = seeded(2);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seeded(1)()).not.toBe(c());
  });
});

describe('makeStars', () => {
  it('is deterministic', () => {
    expect(makeStars(150)).toEqual(makeStars(150));
  });

  it('keeps stars in the unit square and spreads them over three layers', () => {
    const stars = makeStars(150);
    expect(stars).toHaveLength(150);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThan(1);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThan(1);
    }
    expect(new Set(stars.map((s) => s.layer))).toEqual(new Set([0, 1, 2]));
  });
});

describe('pathFor', () => {
  const stars = makeStars(150);

  it('picks five distinct near-layer stars, left to right', () => {
    const path = pathFor('assetmind', stars);
    expect(path).toHaveLength(5);
    expect(new Set(path).size).toBe(5);
    for (const i of path) expect(stars[i].layer).toBe(0);
    const xs = path.map((i) => stars[i].x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it('is stable per project and differs between projects', () => {
    expect(pathFor('assetmind', stars)).toEqual(pathFor('assetmind', stars));
    expect(pathFor('assetmind', stars)).not.toEqual(pathFor('animart', stars));
  });
});

describe('tiers', () => {
  it('starts full, lite on save-data, still on reduced motion', () => {
    expect(startTier({ reducedMotion: false, saveData: false })).toBe('full');
    expect(startTier({ reducedMotion: false, saveData: true })).toBe('lite');
    expect(startTier({ reducedMotion: true, saveData: false })).toBe('still');
    expect(startTier({ reducedMotion: true, saveData: true })).toBe('still');
  });

  it('steps down on a slow median and never back up', () => {
    expect(nextTier('full', 30)).toBe('lite');
    expect(nextTier('lite', 30)).toBe('still');
    expect(nextTier('still', 99)).toBe('still');
    expect(nextTier('full', 16)).toBe('full');
    expect(nextTier('lite', 24)).toBe('lite');
  });

  it('takes the median of a window', () => {
    expect(medianOf([3, 1, 2])).toBe(2);
    expect(medianOf([1, 2, 3, 4])).toBe(2.5);
    expect(medianOf([])).toBe(0);
  });
});

describe('comet', () => {
  const flight = { x0: 100, y0: 0, x1: 0, y1: 100 };

  it('travels in a straight line from start to end', () => {
    expect(cometPosition(flight, 0)).toEqual({ x: 100, y: 0 });
    expect(cometPosition(flight, 1)).toEqual({ x: 0, y: 100 });
    expect(cometPosition(flight, 0.5)).toEqual({ x: 50, y: 50 });
  });

  it('waits 30 to 40 seconds between flights', () => {
    expect(nextCometDelay(() => 0)).toBe(30000);
    expect(nextCometDelay(() => 0.5)).toBe(35000);
  });
});

describe('withAlpha', () => {
  it('turns a hex colour into rgba', () => {
    expect(withAlpha('#f2c14e', 0.5)).toBe('rgba(242,193,78,0.5)');
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/sky/engine.test.ts`
Expected: FAIL, `Cannot find module './engine'`.

- [ ] **Step 3: Write `src/sky/engine.ts`**

```ts
export type Tier = 'full' | 'lite' | 'still';

export interface Star {
  /** 0 to 1 across the viewport. */
  x: number;
  y: number;
  /** 0 is the nearest layer: biggest, fastest under scroll. */
  layer: 0 | 1 | 2;
  size: number;
  phase: number;
}

/** How far each layer moves, as a fraction of the scroll distance. */
export const LAYER_SPEED = [0.12, 0.05, 0.02] as const;

const SIZE = [1.8, 1.2, 0.8] as const;

/** mulberry32: small, fast and repeatable, so the sky is the same every visit. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function makeStars(count: number, seed = 7): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const layer = (i % 3) as 0 | 1 | 2;
    return {
      x: rand(),
      y: rand(),
      layer,
      size: SIZE[layer] * (0.7 + 0.6 * rand()),
      phase: rand() * Math.PI * 2,
    };
  });
}

/**
 * The stars of one project's constellation: `length` distinct near-layer stars
 * chosen by the project's id, joined left to right. Same id, same shape.
 */
export function pathFor(projectId: string, stars: Star[], length = 5): number[] {
  const rand = seeded(hash(projectId));
  const pool = stars.flatMap((s, i) => (s.layer === 0 ? [i] : []));
  const picked: number[] = [];
  while (picked.length < Math.min(length, pool.length)) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return picked.sort((a, b) => stars[a].x - stars[b].x);
}

export function startTier({
  reducedMotion,
  saveData,
}: {
  reducedMotion: boolean;
  saveData: boolean;
}): Tier {
  if (reducedMotion) return 'still';
  return saveData ? 'lite' : 'full';
}

/** One step down when a window of frames is slow. A tier never moves back up. */
export function nextTier(current: Tier, medianMs: number): Tier {
  if (medianMs <= 24) return current;
  return current === 'full' ? 'lite' : 'still';
}

export function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function cometPosition(
  flight: { x0: number; y0: number; x1: number; y1: number },
  p: number,
): { x: number; y: number } {
  return { x: flight.x0 + (flight.x1 - flight.x0) * p, y: flight.y0 + (flight.y1 - flight.y0) * p };
}

/** Milliseconds until the next comet: 30 to 40 seconds. */
export function nextCometDelay(rand: () => number): number {
  return 30000 + rand() * 10000;
}

/** `#rrggbb` to `rgba(...)`, because a canvas gradient cannot fade a hex colour to transparent. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
```

- [ ] **Step 4: Run to see it pass**

Run: `npx vitest run src/sky/engine.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Checkpoint**

Stage only: `src/sky/engine.ts src/sky/engine.test.ts`
Message: `feat(sky): pure sky engine with seeded stars, constellations and tiers`

---

### Task 3: Passport state

**Files:**
- Create: `src/passport/stamps.ts`, `src/passport/sound.ts`, `src/passport/PassportProvider.tsx`, `src/passport/PassportProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/passport/PassportProvider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassportProvider, usePassport } from './PassportProvider';
import { SOUND_KEY, STORAGE_KEY } from './stamps';
import { playStamp } from './sound';

vi.mock('./sound', () => ({ playStamp: vi.fn(), prepareSound: vi.fn() }));

function Probe() {
  const { stamps, earn, has, justEarned, soundOn, setSoundOn } = usePassport();
  return (
    <>
      <p data-testid="list">{stamps.join(',')}</p>
      <p data-testid="fresh">{justEarned ?? ''}</p>
      <p data-testid="has">{String(has('about'))}</p>
      <p data-testid="sound">{String(soundOn)}</p>
      <button onClick={() => earn('about')}>about</button>
      <button onClick={() => earn('comet')}>comet</button>
      <button onClick={() => setSoundOn(true)}>sound</button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('PassportProvider', () => {
  it('records a stamp once', async () => {
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    await user.click(screen.getByText('about'));
    expect(screen.getByTestId('list').textContent).toBe('about');
    expect(screen.getByTestId('has').textContent).toBe('true');
    expect(screen.getByTestId('fresh').textContent).toBe('about');
  });

  it('saves progress and restores it, dropping ids it does not know', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('comet'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['comet']);
    unmount();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(['skills', 'skills', 'bogus']));
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    expect(screen.getByTestId('list').textContent).toBe('skills');
  });

  it('keeps working when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(screen.getByTestId('list').textContent).toBe('about');
    vi.restoreAllMocks();
  });

  it('is silent by default and only sounds once the reader opts in', async () => {
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(playStamp).not.toHaveBeenCalled();

    await user.click(screen.getByText('sound'));
    expect(localStorage.getItem(SOUND_KEY)).toBe('true');
    await user.click(screen.getByText('comet'));
    expect(playStamp).toHaveBeenCalledTimes(1);
  });

  it('vibrates briefly where the device can', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(vibrate).toHaveBeenCalledWith(30);
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('is inert outside a provider', async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(screen.getByText('about'));
    expect(screen.getByTestId('list').textContent).toBe('');
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/passport/PassportProvider.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Write `src/passport/stamps.ts`**

```ts
export const SECTION_STAMPS = [
  'home',
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'contact',
] as const;
export const SECRET_STAMPS = ['comet', 'language', 'reach'] as const;
export const ALL_STAMPS = [...SECTION_STAMPS, ...SECRET_STAMPS] as const;

export type StampId = (typeof ALL_STAMPS)[number];
export type SecretStampId = (typeof SECRET_STAMPS)[number];

export const TOTAL = ALL_STAMPS.length;
/** Time a section must spend near the middle of the screen before it can be stamped. */
export const DWELL_MS = 5000;

export const STORAGE_KEY = 'daffa_passport';
export const SOUND_KEY = 'daffa_passport_sound';

export function isStampId(value: unknown): value is StampId {
  return typeof value === 'string' && (ALL_STAMPS as readonly string[]).includes(value);
}

export function isSecret(id: StampId): id is SecretStampId {
  return (SECRET_STAMPS as readonly string[]).includes(id);
}

/** Every section stamp is in. The secrets are a bonus and never required. */
export function sectionsComplete(ids: readonly StampId[]): boolean {
  return SECTION_STAMPS.every((id) => ids.includes(id));
}

export function loadStamps(): StampId[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isStampId))] : [];
  } catch {
    return [];
  }
}

export function saveStamps(ids: readonly StampId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage is blocked: progress lasts for this visit and the page is unaffected.
  }
}

export function loadSound(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveSound(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(on));
  } catch {
    // Same as above: the choice lasts for this visit.
  }
}
```

- [ ] **Step 4: Write `src/passport/sound.ts`**

```ts
let audio: AudioContext | undefined;

/** Call from the click that turns sound on, so the browser lets the context run. */
export function prepareSound(): void {
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
  } catch {
    // No Web Audio here: the stamp still lands, silently.
  }
}

/** A short low thump, made from one oscillator. No audio files. */
export function playStamp(): void {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // See above.
  }
}
```

- [ ] **Step 5: Write `src/passport/PassportProvider.tsx`**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { prepareSound, playStamp } from './sound';
import { loadSound, loadStamps, saveSound, saveStamps, type StampId } from './stamps';

interface Passport {
  stamps: readonly StampId[];
  earn: (id: StampId) => void;
  has: (id: string) => boolean;
  /** The stamp earned in the last few seconds, for the press animation and the live region. */
  justEarned: StampId | null;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
}

const INERT: Passport = {
  stamps: [],
  earn: () => {},
  has: () => false,
  justEarned: null,
  soundOn: false,
  setSoundOn: () => {},
};

const Context = createContext<Passport>(INERT);

/**
 * The reader's stamps. Progress is a list of ids in localStorage; nothing about
 * the reader is stored. Like SkillHighlight it is inert outside a provider, so
 * any section can render on its own in a test.
 */
export function PassportProvider({ children }: { children: ReactNode }) {
  const [stamps, setStamps] = useState<StampId[]>(loadStamps);
  const [justEarned, setJustEarned] = useState<StampId | null>(null);
  const [soundOn, setSound] = useState<boolean>(loadSound);

  // Read inside callbacks so `earn` stays stable and a double-fired observer cannot stamp twice.
  const owned = useRef(stamps);
  const sounding = useRef(soundOn);

  const earn = useCallback((id: StampId) => {
    if (owned.current.includes(id)) return;
    owned.current = [...owned.current, id];
    setStamps(owned.current);
    setJustEarned(id);
    saveStamps(owned.current);
    if (typeof navigator.vibrate === 'function') navigator.vibrate(30);
    if (sounding.current) playStamp();
  }, []);

  const setSoundOn = useCallback((on: boolean) => {
    sounding.current = on;
    setSound(on);
    saveSound(on);
    if (on) prepareSound();
  }, []);

  useEffect(() => {
    if (!justEarned) return;
    const timer = setTimeout(() => setJustEarned(null), 4000);
    return () => clearTimeout(timer);
  }, [justEarned]);

  const value = useMemo<Passport>(
    () => ({
      stamps,
      earn,
      has: (id) => (stamps as readonly string[]).includes(id),
      justEarned,
      soundOn,
      setSoundOn,
    }),
    [stamps, earn, justEarned, soundOn, setSoundOn],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePassport(): Passport {
  return useContext(Context);
}
```

- [ ] **Step 6: Run to see it pass**

Run: `npx vitest run src/passport/PassportProvider.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 7: Checkpoint**

Stage only: `src/passport/stamps.ts src/passport/sound.ts src/passport/PassportProvider.tsx src/passport/PassportProvider.test.tsx`
Message: `feat(passport): stamp state with storage, vibration and opt-in sound`

---

### Task 4: Strings for the passport (EN and ID)

**Files:**
- Modify: `src/data/i18n/dictionary.ts`

- [ ] **Step 1: Add the English keys**

In `DICTIONARY.en`, after `emailMe: 'Email me',` add:

```ts

    // Passport
    passport: 'Passport',
    stamped: 'Stamped',
    notStamped: 'Not yet stamped',
    arrival: 'Arrival',
    stampEarned: (name: string) => `Stamp earned: ${name}`,
    passportHint:
      'Read a section for five seconds and move on, and it is stamped. Nothing here is locked behind a stamp.',
    secretStamp: 'Secret stamp',
    stampComet: 'Comet',
    stampLanguage: 'Two tongues',
    stampReach: 'Reaching out',
    hintComet: 'A shooting star crosses the sky now and then. Click it.',
    hintLanguage: 'Switch the language of the page.',
    hintReach: 'Open the CV or copy the email address.',
    completeTitle: 'You read all of it.',
    completeNote: 'Thank you. If something here fits what you are building, write to me.',
    sound: 'Sound',
    cometLabel: 'Shooting star. Catch it for a secret stamp.',
```

- [ ] **Step 2: Add the Indonesian keys**

In `DICTIONARY.id`, after `emailMe: 'Kirim email',` add:

```ts

    // Passport
    passport: 'Paspor',
    stamped: 'Sudah dicap',
    notStamped: 'Belum dicap',
    arrival: 'Kedatangan',
    stampEarned: (name: string) => `Stempel didapat: ${name}`,
    passportHint:
      'Baca satu bagian selama lima detik lalu lanjutkan, maka bagian itu dicap. Tidak ada isi yang dikunci di balik stempel.',
    secretStamp: 'Stempel rahasia',
    stampComet: 'Komet',
    stampLanguage: 'Dua bahasa',
    stampReach: 'Menghubungi',
    hintComet: 'Sesekali ada bintang jatuh melintas. Klik bintang itu.',
    hintLanguage: 'Ganti bahasa halaman.',
    hintReach: 'Buka CV atau salin alamat email.',
    completeTitle: 'Anda membaca semuanya.',
    completeNote: 'Terima kasih. Jika ada yang cocok dengan yang sedang Anda bangun, tulis ke saya.',
    sound: 'Suara',
    cometLabel: 'Bintang jatuh. Tangkap untuk stempel rahasia.',
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (a key missing from one language fails here, because `t` is typed `Dictionary`).

- [ ] **Step 4: Checkpoint**

Stage only: `src/data/i18n/dictionary.ts`
Message: `feat(i18n): passport strings in English and Indonesian`

---

### Task 5: Reading rule, stamp mark, section stamp slot

**Files:**
- Create: `src/passport/useStampOnRead.ts`, `src/passport/useStampOnRead.test.tsx`, `src/passport/StampMark.tsx`, `src/passport/stampName.ts`
- Modify: `src/components/layout/SectionShell.tsx`, `src/components/layout/SectionShell.test.tsx`

- [ ] **Step 1: Write the failing hook test**

`src/passport/useStampOnRead.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';
import { observers } from '@/test/stubs';
import { PassportProvider, usePassport } from './PassportProvider';
import { hasPassed, useStampOnRead } from './useStampOnRead';

function Probe() {
  const ref = useStampOnRead<HTMLElement>('about');
  return <section ref={ref} data-testid="probe" />;
}

function List() {
  const { stamps } = usePassport();
  return <p data-testid="list">{stamps.join(',')}</p>;
}

function setup() {
  render(
    <PassportProvider>
      <Probe />
      <List />
    </PassportProvider>,
  );
  return screen.getByTestId('probe');
}

const see = (el: Element, isIntersecting: boolean) =>
  act(() => {
    observers.at(-1)!.emit([{ target: el, isIntersecting }]);
  });
const placeBottomAt = (el: Element, bottom: number) => {
  el.getBoundingClientRect = () => ({ bottom }) as DOMRect;
};
const scroll = () =>
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const list = () => screen.getByTestId('list').textContent;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  // jsdom has no layout: give the page a height so "end of page" is not always true.
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 });
});
afterEach(() => vi.useRealTimers());

describe('hasPassed', () => {
  it('is true above the middle of the screen, or at the end of the page', () => {
    expect(hasPassed(100, 800, false)).toBe(true);
    expect(hasPassed(500, 800, false)).toBe(false);
    expect(hasPassed(500, 800, true)).toBe(true);
  });
});

describe('useStampOnRead', () => {
  it('does not stamp a section that was seen but not scrolled past', () => {
    const el = setup();
    placeBottomAt(el, 900);
    see(el, true);
    wait(5000);
    scroll();
    expect(list()).toBe('');
  });

  it('does not stamp a section scrolled past in under five seconds', () => {
    const el = setup();
    placeBottomAt(el, -10);
    see(el, true);
    wait(4000);
    see(el, false);
    scroll();
    expect(list()).toBe('');
  });

  it('stamps once it was seen for five seconds and then scrolled past', () => {
    const el = setup();
    placeBottomAt(el, 900);
    see(el, true);
    wait(5000);
    expect(list()).toBe('');
    placeBottomAt(el, -10);
    scroll();
    expect(list()).toBe('about');
  });

  it('adds up separate visits', () => {
    const el = setup();
    placeBottomAt(el, -10);
    see(el, true);
    wait(3000);
    see(el, false);
    expect(list()).toBe('');
    see(el, true);
    wait(2000);
    expect(list()).toBe('about');
  });

  it('counts the end of the page as scrolled past', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 768 });
    const el = setup();
    placeBottomAt(el, 700);
    see(el, true);
    wait(5000);
    expect(list()).toBe('about');
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run src/passport/useStampOnRead.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `src/passport/useStampOnRead.ts`**

```ts
import { useEffect, useRef } from 'react';

import { usePassport } from './PassportProvider';
import { DWELL_MS, isStampId } from './stamps';

/** Past the reader's eye line: the bottom edge is above mid-screen, or the page can scroll no further. */
export function hasPassed(bottom: number, viewportHeight: number, atEnd: boolean): boolean {
  return atEnd || bottom < viewportHeight * 0.5;
}

/**
 * Stamps a section when it has been near the middle of the screen for five
 * seconds in total and the reader has then scrolled past it. A quick flick
 * through the page earns nothing; the last section counts the end of the page
 * as "past", because nothing can scroll above it.
 *
 * "Near the middle" is a band across the centre of the viewport rather than a
 * share of the section, so a section three screens tall counts as readily as a
 * short one.
 */
export function useStampOnRead<T extends HTMLElement>(id: string) {
  const { earn, has } = usePassport();
  const ref = useRef<T>(null);
  const earned = has(id);

  useEffect(() => {
    const el = ref.current;
    if (!el || earned || !isStampId(id)) return;

    let dwelled = 0;
    let since = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      if (dwelled < DWELL_MS) return;
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (hasPassed(el.getBoundingClientRect().bottom, window.innerHeight, atEnd)) earn(id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        if (visible && !since) {
          since = Date.now();
          timer = setTimeout(() => {
            dwelled = DWELL_MS;
            check();
          }, DWELL_MS - dwelled);
        } else if (!visible && since) {
          clearTimeout(timer);
          dwelled += Date.now() - since;
          since = 0;
          check();
        }
      },
      { rootMargin: '-35% 0px -35% 0px' },
    );

    observer.observe(el);
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', check);
      clearTimeout(timer);
    };
  }, [earned, earn, id]);

  return ref;
}
```

- [ ] **Step 4: Run to see it pass**

Run: `npx vitest run src/passport/useStampOnRead.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Write `src/passport/stampName.ts`**

```ts
import type { Dictionary } from '@/data/i18n/dictionary';
import type { SectionMeta } from '@/types';
import type { SecretStampId, StampId } from './stamps';

export function stampName(id: StampId, sections: SectionMeta[], t: Dictionary): string {
  if (id === 'comet') return t.stampComet;
  if (id === 'language') return t.stampLanguage;
  if (id === 'reach') return t.stampReach;
  return sections.find((section) => section.id === id)?.label ?? id;
}

export function stampHint(id: SecretStampId, t: Dictionary): string {
  if (id === 'comet') return t.hintComet;
  if (id === 'language') return t.hintLanguage;
  return t.hintReach;
}
```

- [ ] **Step 6: Write `src/passport/StampMark.tsx`**

```tsx
import { useId } from 'react';

import { useLanguage } from '@/context/LanguageContext';

interface StampMarkProps {
  stampId: string;
  label: string;
  earned: boolean;
  /** Just earned: press it down. */
  fresh?: boolean;
  className?: string;
}

/**
 * One stamp. Empty, it is a dashed ring waiting to be filled; earned, it is
 * inked in the accent colour with the section's name around the ring and the
 * owner's initials in the middle. Decorative: the state is said in words beside
 * it, so the whole thing is hidden from assistive technology.
 */
export default function StampMark({
  stampId,
  label,
  earned,
  fresh = false,
  className = 'h-20 w-20',
}: StampMarkProps) {
  const { profile } = useLanguage();
  const ringId = useId();
  const initials = profile.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const word = label.toUpperCase();
  const ring = `${Array(Math.ceil(40 / (word.length + 3))).fill(word).join(' · ')} ·`;

  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      data-stamp={stampId}
      data-earned={earned}
      className={`stamp ${fresh ? 'stamp-new' : ''} ${earned ? 'text-accent' : 'text-muted'} ${className}`}
    >
      <defs>
        <path id={ringId} d="M80,80 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" />
      </defs>
      <circle
        cx="80"
        cy="80"
        r="75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={earned ? undefined : '4 6'}
      />
      {earned && (
        <>
          <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
          <text className="font-mono" fontSize="10.5" fill="currentColor" letterSpacing="1.6">
            <textPath href={`#${ringId}`} textLength="368" lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
          <text
            x="80"
            y="91"
            textAnchor="middle"
            fontSize="32"
            fontWeight="500"
            letterSpacing="-1"
            fill="currentColor"
          >
            {initials}
          </text>
        </>
      )}
    </svg>
  );
}
```

- [ ] **Step 7: Add failing slot tests to `src/components/layout/SectionShell.test.tsx`**

Add imports at the top: `import { PassportProvider } from '@/passport/PassportProvider';` and `import { STORAGE_KEY } from '@/passport/stamps';`. Append inside the `describe`:

```tsx
  it('ends with an empty stamp slot until the section is stamped', () => {
    localStorage.clear();
    const { container } = render(
      <PassportProvider>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>body</p>
        </SectionShell>
      </PassportProvider>,
    );
    expect(container.querySelector('[data-stamp="about"]')).toHaveAttribute('data-earned', 'false');
    expect(screen.getByText('Not yet stamped')).toBeInTheDocument();
  });

  it('fills the slot once the section is stamped', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['about']));
    const { container } = render(
      <PassportProvider>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>body</p>
        </SectionShell>
      </PassportProvider>,
    );
    expect(container.querySelector('[data-stamp="about"]')).toHaveAttribute('data-earned', 'true');
    expect(screen.getByText('Stamped')).toBeInTheDocument();
    localStorage.clear();
  });

  it('prints no slot for an id that is not a stamp', () => {
    const { container } = render(
      <SectionShell id="zzz" index={9} label="Zzz" title="Nothing">
        <p>body</p>
      </SectionShell>,
    );
    expect(container.querySelector('[data-stamp]')).toBeNull();
  });
```

Run: `npx vitest run src/components/layout/SectionShell.test.tsx`
Expected: the three new tests FAIL.

- [ ] **Step 8: Rewrite `src/components/layout/SectionShell.tsx`**

```tsx
import type { ReactNode } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { usePassport } from '@/passport/PassportProvider';
import StampMark from '@/passport/StampMark';
import { isStampId } from '@/passport/stamps';
import { useStampOnRead } from '@/passport/useStampOnRead';

interface SectionShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
  /** A working control for the left columns, set under the title (a filter, say). */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * One section of the passport. A hairline draws across the top as it arrives;
 * under it the title takes the left four of twelve columns and the evidence
 * takes the right eight, so every section is laid out the same way and the eye
 * learns the page once. At the end of the evidence sits a stamp slot: dashed
 * until the reader has spent five seconds here and moved on, inked after.
 *
 * `index` is accepted because the section metadata supplies it; it is not
 * printed. The heading carries its own weight.
 */
export default function SectionShell({ id, label, title, aside, children }: SectionShellProps) {
  const { t } = useLanguage();
  const { has, justEarned } = usePassport();
  const ref = useStampOnRead<HTMLElement>(id);
  const earned = has(id);

  return (
    <section ref={ref} id={id} className="scroll-mt-14 px-6 md:px-10">
      <div className="mx-auto grid w-full max-w-[1120px] gap-x-10 gap-y-10 pb-20 md:pb-28 lg:grid-cols-12">
        <div aria-hidden="true" className="rule h-px bg-edge lg:col-span-12" />
        <div className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <h2 className="font-display text-4xl leading-[1.08] font-normal tracking-[-0.02em] text-primary text-balance md:text-5xl">
            {title}
          </h2>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className="min-w-0 lg:col-span-8">
          {children}
          {isStampId(id) && (
            <div className="mt-16 flex items-center gap-4">
              <StampMark
                stampId={id}
                label={label}
                earned={earned}
                fresh={justEarned === id}
                className="h-16 w-16"
              />
              <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                {earned ? t.stamped : t.notStamped}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Run**

Run: `npx vitest run src/components/layout/SectionShell.test.tsx src/passport`
Expected: PASS.

- [ ] **Step 10: Checkpoint**

Stage only: `src/passport/useStampOnRead.ts src/passport/useStampOnRead.test.tsx src/passport/StampMark.tsx src/passport/stampName.ts src/components/layout/SectionShell.tsx src/components/layout/SectionShell.test.tsx`
Message: `feat(passport): stamp each section after it is read, with a slot at its end`

---

### Task 6: The sky

**Files:**
- Create: `src/sky/SkyCanvas.tsx`, `src/sky/SkyCanvas.test.tsx`
- Modify: `src/test/stubs.ts`

- [ ] **Step 1: Stub the canvas for jsdom**

Append to `src/test/stubs.ts`:

```ts

/**
 * jsdom has no canvas: `getContext` logs "not implemented" and returns
 * undefined. A stub that says "no 2D context" keeps the log quiet and exercises
 * the same path a browser without canvas would take. Tests that want to see
 * drawing spy on this and return a fake context.
 */
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
```

- [ ] **Step 2: Write the failing test**

`src/sky/SkyCanvas.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { PassportProvider } from '@/passport/PassportProvider';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';
import SkyCanvas from './SkyCanvas';

function fakeContext() {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (prop === 'createLinearGradient') return () => ({ addColorStop() {} });
        return () => {
          calls.push(prop);
        };
      },
      set: () => true,
    },
  );
  return { ctx, calls };
}

function mockMotion(reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes('reduce'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
}

const tree = (
  <LanguageProvider>
    <PassportProvider>
      <SkillHighlightProvider>
        <SkyCanvas />
      </SkillHighlightProvider>
    </PassportProvider>
  </LanguageProvider>
);

afterEach(() => vi.restoreAllMocks());

describe('SkyCanvas', () => {
  it('renders a decorative canvas and a hidden comet button even without a 2D context', () => {
    const { container } = render(tree);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    const comet = container.querySelector('button');
    expect(comet).toHaveAttribute('hidden');
    expect(comet).toHaveAttribute('aria-label', expect.stringMatching(/shooting star/i));
  });

  it('paints one still frame and starts no loop when motion is reduced', () => {
    const { ctx, calls } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(true);
    const raf = vi.spyOn(window, 'requestAnimationFrame');

    render(tree);

    expect(calls).toContain('arc');
    expect(raf).not.toHaveBeenCalled();
  });

  it('runs the animation loop when motion is welcome', () => {
    const { ctx } = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    mockMotion(false);
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);

    render(tree);

    expect(raf).toHaveBeenCalled();
  });
});
```

Run: `npx vitest run src/sky/SkyCanvas.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `src/sky/SkyCanvas.tsx`**

```tsx
import { useEffect, useRef } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { scrollProgress } from '@/lib/scroll';
import { cssToken } from '@/lib/token';
import { usePassport } from '@/passport/PassportProvider';
import { TOTAL } from '@/passport/stamps';
import {
  LAYER_SPEED,
  cometPosition,
  makeStars,
  medianOf,
  nextCometDelay,
  nextTier,
  pathFor,
  startTier,
  withAlpha,
  type Star,
  type Tier,
} from './engine';

const STAR_COUNT = 150;
const TRAIL_MS = 600;
const COMET_MS = 4500;
const FIRST_COMET_MS = 15000;

interface Live {
  projectIds: string[];
  lit: string[];
  finale: boolean;
  initials: string;
  redraw: () => void;
}

/** The owner's initials as a field of dots: set in a big serif, then sampled on a grid. */
function initialsDots(text: string): Array<[number, number]> {
  const W = 480;
  const H = 220;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d');
  if (!octx) return [];
  octx.font = `700 ${H * 0.95}px Georgia, serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillText(text, W / 2, H / 2);
  const { data } = octx.getImageData(0, 0, W, H);
  const dots: Array<[number, number]> = [];
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      if (data[(y * W + x) * 4 + 3] > 128) dots.push([x / W, y / H]);
    }
  }
  return dots;
}

/**
 * The sky behind the whole page: three layers of stars that drift under scroll,
 * give way to the pointer, join into a project's constellation when a skill that
 * project used is hovered, warm towards dawn as the page is read, and now and
 * then let a comet cross. One canvas, one loop, no library.
 *
 * It looks after the device it is on. The first sixty frames are timed, and a
 * slow median steps it down from full to lite (half the stars, thirty frames a
 * second, no trail, no comet) and then to still (one frame, redrawn only when
 * something changes). Reduced motion starts it still. It never steps back up,
 * and it stops while the tab is hidden.
 */
export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cometRef = useRef<HTMLButtonElement>(null);
  const { projects, profile, t } = useLanguage();
  const { isHighlighted } = useSkillHighlight();
  const { earn, stamps } = usePassport();

  const lit = projects
    .filter((project) => isHighlighted(project.id))
    .map((project) => project.id)
    .join(',');
  const initials = profile.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const finale = stamps.length === TOTAL;

  // The loop reads these live instead of restarting whenever one changes.
  const live = useRef<Live>({ projectIds: [], lit: [], finale: false, initials: '', redraw: () => {} });

  useEffect(() => {
    live.current.projectIds = projects.map((project) => project.id);
    live.current.lit = lit ? lit.split(',') : [];
    live.current.finale = finale;
    live.current.initials = initials;
    live.current.redraw();
  }, [projects, lit, finale, initials]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cometButton = cometRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !cometButton || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let tier: Tier = startTier({
      reducedMotion: reduced.matches,
      saveData: connection?.saveData === true,
    });

    const stars: Star[] = makeStars(STAR_COUNT);
    const paths = new Map(live.current.projectIds.map((id) => [id, pathFor(id, stars)]));
    const reveal = new Map<string, number>();
    const pointer = { x: -9999, y: -9999 };
    const trail: Array<{ x: number; y: number; at: number }> = [];
    const deltas: number[] = [];
    let flight: { x0: number; y0: number; x1: number; y1: number; at: number } | null = null;
    let nextComet = FIRST_COMET_MS;
    let dots: Array<[number, number]> | null = null;
    let colors = readColors();
    let w = 0;
    let h = 0;
    let scrollY = window.scrollY;
    let progress = 0;
    let raf = 0;
    let last = 0;
    let frame = 0;
    let queued = false;

    function readColors() {
      return {
        ink: cssToken('--color-primary'),
        accent: cssToken('--color-accent'),
      };
    }

    const measure = () => {
      scrollY = window.scrollY;
      progress = scrollProgress(scrollY, document.documentElement.scrollHeight, window.innerHeight);
    };

    // Forced: used at start and whenever the tier changes the pixel density.
    const size = () => {
      const dpr = tier === 'full' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const place = (s: Star): [number, number] => {
      let x = s.x * w;
      let y = (((s.y * h - scrollY * LAYER_SPEED[s.layer]) % h) + h) % h;
      if (tier === 'full' && pointer.x > -9000) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 120) {
          const k = ((1 - d / 120) * 18) / d;
          x += dx * k;
          y += dy * k;
        }
      }
      return [x, y];
    };

    const endComet = (now: number) => {
      flight = null;
      cometButton.hidden = true;
      nextComet = now + nextCometDelay(Math.random);
    };

    const step = (now: number, dt: number) => {
      for (const id of paths.keys()) {
        const target = live.current.lit.includes(id) ? 1 : 0;
        const current = reveal.get(id) ?? 0;
        reveal.set(id, tier === 'still' ? target : current + (target - current) * Math.min(1, dt / 220));
      }
      while (trail.length && now - trail[0].at > TRAIL_MS) trail.shift();
      if (tier !== 'full') return;

      if (!flight && now >= nextComet) {
        const x0 = w * (0.55 + Math.random() * 0.4);
        const y0 = h * (0.05 + Math.random() * 0.15);
        flight = { x0, y0, x1: x0 - w * 0.45, y1: y0 + h * 0.35, at: now };
        cometButton.hidden = false;
      }
      if (flight) {
        const p = (now - flight.at) / COMET_MS;
        if (p >= 1) {
          endComet(now);
        } else {
          const head = cometPosition(flight, p);
          cometButton.style.transform = `translate(${head.x - 24}px, ${head.y - 24}px)`;
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // Dawn: the lower sky warms as the page is read, a flat band and no glow.
      if (progress > 0) {
        const band = ctx.createLinearGradient(0, h * 0.55, 0, h);
        band.addColorStop(0, withAlpha(colors.accent, 0));
        band.addColorStop(1, withAlpha(colors.accent, 0.14 * progress));
        ctx.fillStyle = band;
        ctx.fillRect(0, h * 0.55, w, h * 0.45);
      }

      const spots: Array<[number, number]> = [];
      ctx.fillStyle = colors.ink;
      stars.forEach((s, i) => {
        const pos = place(s);
        spots[i] = pos;
        if (tier === 'lite' && i % 2) return;
        const twinkle = tier === 'full' ? 0.7 + 0.3 * Math.sin(now / 1100 + s.phase) : 1;
        ctx.globalAlpha = (0.55 - s.layer * 0.12) * twinkle;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 1;
      for (const [id, path] of paths) {
        const amount = reveal.get(id) ?? 0;
        if (amount <= 0.01) continue;
        const points = path.map((i) => spots[i]);
        const reach = amount * (points.length - 1);
        ctx.globalAlpha = 0.9 * Math.min(1, amount * 2);
        ctx.beginPath();
        for (let i = 0; i < points.length - 1; i++) {
          const [x0, y0] = points[i];
          const [x1, y1] = points[i + 1];
          const fraction = Math.min(1, reach - i);
          if (fraction <= 0) break;
          // A star that wrapped past the edge would draw a line across the screen.
          if (Math.hypot(x1 - x0, y1 - y0) > h * 0.6) continue;
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + (x1 - x0) * fraction, y0 + (y1 - y0) * fraction);
        }
        ctx.stroke();
        points.forEach(([x, y], i) => {
          if (i > reach) return;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (tier === 'full') {
        for (const p of trail) {
          const age = now - p.at;
          if (age > TRAIL_MS) continue;
          ctx.globalAlpha = 0.5 * (1 - age / TRAIL_MS);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (flight) {
        const p = (now - flight.at) / COMET_MS;
        const head = cometPosition(flight, p);
        const tail = cometPosition(flight, Math.max(0, p - 0.12));
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
      }

      // The reward for a full passport: the owner's initials, written in stars.
      if (live.current.finale) {
        dots ??= initialsDots(live.current.initials);
        const boxW = Math.min(w * 0.8, 560);
        const boxH = boxW * (220 / 480);
        ctx.fillStyle = colors.accent;
        for (const [dx, dy] of dots) {
          ctx.globalAlpha = tier === 'full' ? 0.3 + 0.15 * Math.sin(now / 900 + dx * 9) : 0.35;
          ctx.beginPath();
          ctx.arc(w / 2 - boxW / 2 + dx * boxW, h * 0.38 - boxH / 2 + dy * boxH, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const paintStill = () => {
      const now = performance.now();
      step(now, 0);
      draw(now);
    };

    const paintStillSoon = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (tier === 'still') paintStill();
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? now - last : 16;
      last = now;
      // A frame after the tab came back is not a measurement of the device.
      if (dt < 200) {
        deltas.push(dt);
        if (deltas.length === 60) {
          const next = nextTier(tier, medianOf(deltas));
          deltas.length = 0;
          if (next !== tier) setTier(next);
          if (tier === 'still') return;
        }
      }
      frame++;
      if (tier === 'lite' && frame % 2) return;
      step(now, dt);
      draw(now);
    };

    function setTier(next: Tier) {
      tier = next;
      if (next !== 'full' && flight) {
        flight = null;
        cometButton.hidden = true;
      }
      size();
      if (next === 'still') {
        cancelAnimationFrame(raf);
        raf = 0;
        paintStill();
      }
    }

    const onScroll = () => {
      measure();
      if (tier === 'still') paintStillSoon();
    };
    const onResize = () => {
      // Mobile browsers resize the window as the address bar slides; only a real change reallocates.
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 150) return;
      size();
      measure();
      if (tier === 'still') paintStill();
    };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (event.pointerType === 'mouse' && tier === 'full') {
        trail.push({ x: event.clientX, y: event.clientY, at: performance.now() });
        if (trail.length > 24) trail.shift();
      }
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onTheme = () => {
      colors = readColors();
      if (tier === 'still') paintStill();
    };
    const onReduced = () => {
      if (reduced.matches && tier !== 'still') setTier('still');
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (tier !== 'still' && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const onCatch = () => {
      earn('comet');
      endComet(performance.now());
    };

    live.current.redraw = () => {
      if (tier === 'still') paintStill();
    };

    size();
    measure();
    if (tier === 'still') paintStill();
    else raf = requestAnimationFrame(tick);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onLeave);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    dark.addEventListener('change', onTheme);
    reduced.addEventListener('change', onReduced);
    cometButton.addEventListener('click', onCatch);

    return () => {
      cancelAnimationFrame(raf);
      live.current.redraw = () => {};
      cometButton.hidden = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onLeave);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      dark.removeEventListener('change', onTheme);
      reduced.removeEventListener('change', onReduced);
      cometButton.removeEventListener('click', onCatch);
    };
  }, [earn]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      <button
        ref={cometRef}
        type="button"
        hidden
        aria-label={t.cometLabel}
        className="fixed top-0 left-0 z-30 h-12 w-12 rounded-full"
      />
    </>
  );
}
```

- [ ] **Step 4: Run**

Run: `npx vitest run src/sky`
Expected: PASS. If `react-hooks` lint later complains about `setTier` used before definition inside `tick`, it is a function declaration (hoisted) and is fine; if it complains about refs, keep all `live.current` access inside effects as written.

- [ ] **Step 5: Lint and type-check**

Run: `npx tsc --noEmit; npm run lint`
Expected: both clean.

- [ ] **Step 6: Checkpoint**

Stage only: `src/sky/SkyCanvas.tsx src/sky/SkyCanvas.test.tsx src/test/stubs.ts`
Message: `feat(sky): adaptive canvas sky with constellations, comet and dawn`

---

### Task 7: The passport chip and sheet

**Files:**
- Create: `src/passport/Passport.tsx`, `src/passport/Passport.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/passport/Passport.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/context/LanguageContext';
import Passport from './Passport';
import { PassportProvider, usePassport } from './PassportProvider';
import { SECTION_STAMPS, SOUND_KEY, STORAGE_KEY } from './stamps';

function Earner() {
  const { earn } = usePassport();
  return <button onClick={() => earn('about')}>earn about</button>;
}

const tree = (
  <LanguageProvider>
    <PassportProvider>
      <Earner />
      <Passport />
    </PassportProvider>
  </LanguageProvider>
);

beforeEach(() => localStorage.clear());

describe('Passport', () => {
  it('shows the count on a corner chip', () => {
    render(tree);
    expect(screen.getByRole('button', { name: /passport 0\/10/i })).toBeInTheDocument();
  });

  it('opens a sheet with ten stamps and closes it again', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport 0\/10/i }));

    const sheet = screen.getByRole('dialog', { name: 'Passport' });
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(10);
    expect(within(sheet).getAllByText('Secret stamp')).toHaveLength(3);

    await user.click(within(sheet).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'Passport' })).not.toBeInTheDocument();
  });

  it('announces a stamp when it is earned', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByText('earn about'));
    expect(screen.getByRole('status')).toHaveTextContent('Stamp earned: About');
    expect(screen.getByRole('button', { name: /passport 1\/10/i })).toBeInTheDocument();
  });

  it('keeps the closing note back until every section is stamped', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport/i }));
    expect(screen.queryByText('You read all of it.')).not.toBeInTheDocument();
  });

  it('shows the closing note and a way to write once every section is stamped', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...SECTION_STAMPS]));
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport 7\/10/i }));
    expect(screen.getByText('You read all of it.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/),
    );
  });

  it('turns sound on only when asked, and remembers it', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport/i }));
    const toggle = screen.getByRole('checkbox', { name: 'Sound' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(localStorage.getItem(SOUND_KEY)).toBe('true');
  });
});
```

Run: `npx vitest run src/passport/Passport.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 2: Write `src/passport/Passport.tsx`**

```tsx
import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import Dialog from '@/motion/Dialog';
import { usePassport } from './PassportProvider';
import StampMark from './StampMark';
import { stampHint, stampName } from './stampName';
import { ALL_STAMPS, TOTAL, isSecret, sectionsComplete } from './stamps';

/**
 * The corner chip and the sheet it opens. Everything on the page is readable
 * without it; this is where the reader sees what they have collected, what the
 * three secrets hint at, and, once every section is stamped, a closing note and
 * a way to write.
 */
export default function Passport() {
  const { stamps, has, earn, justEarned, soundOn, setSoundOn } = usePassport();
  const { t, sections, profile } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-edge bg-void px-4 font-mono text-xs tabular-nums text-primary transition-colors hover:border-primary"
      >
        {t.passport} {stamps.length}/{TOTAL}
      </button>

      {/* Always mounted, so the announcement is heard when its text arrives. */}
      <p role="status" className="sr-only">
        {justEarned ? t.stampEarned(stampName(justEarned, sections, t)) : ''}
      </p>

      <Dialog open={open} onClose={() => setOpen(false)} label={t.passport}>
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <h2 className="font-display text-3xl font-normal tracking-[-0.02em] text-primary">
              {t.passport}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-primary underline underline-offset-4"
            >
              {t.close}
            </button>
          </div>

          <p className="mt-3 max-w-[48ch] text-muted text-pretty">{t.passportHint}</p>

          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-5">
            {ALL_STAMPS.map((id) => {
              const earned = has(id);
              return (
                <li key={id} className="flex flex-col items-center gap-2 text-center">
                  <StampMark
                    stampId={id}
                    label={stampName(id, sections, t)}
                    earned={earned}
                    className="h-20 w-20"
                  />
                  <span className="text-sm text-primary">
                    {isSecret(id) && !earned ? t.secretStamp : stampName(id, sections, t)}
                  </span>
                  {isSecret(id) && !earned && (
                    <span className="text-xs text-pretty text-muted">{stampHint(id, t)}</span>
                  )}
                </li>
              );
            })}
          </ul>

          {sectionsComplete(stamps) && (
            <div className="mt-10 border-t border-edge pt-6">
              <p className="font-display text-2xl text-primary">{t.completeTitle}</p>
              <p className="mt-2 max-w-[48ch] text-muted text-pretty">{t.completeNote}</p>
              <a
                href={`mailto:${profile.email}`}
                onClick={() => earn('reach')}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
              >
                {t.emailMe}
              </a>
            </div>
          )}

          <label className="mt-10 flex min-h-11 items-center gap-3 text-sm text-primary">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(event) => setSoundOn(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            {t.sound}
          </label>
        </div>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 3: Run**

Run: `npx vitest run src/passport/Passport.test.tsx`
Expected: PASS (6 tests). If "Passport 0/10" is split across text nodes and the accessible-name query fails, wrap the count in one template string: `{`${t.passport} ${stamps.length}/${TOTAL}`}`.

- [ ] **Step 4: Checkpoint**

Stage only: `src/passport/Passport.tsx src/passport/Passport.test.tsx`
Message: `feat(passport): corner chip and sheet with reward and sound toggle`

---

### Task 8: Secret stamps from the language toggle, contact and hero

**Files:**
- Create: `src/passport/secrets.test.tsx`
- Modify: `src/components/ui/LanguageToggle.tsx`, `src/sections/Contact.tsx`
- (Hero is covered in Task 9, which rewrites it.)

- [ ] **Step 1: Write the failing test**

`src/passport/secrets.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { LanguageProvider } from '@/context/LanguageContext';
import Contact from '@/sections/Contact';
import { PassportProvider, usePassport } from './PassportProvider';

function List() {
  const { stamps } = usePassport();
  return <p data-testid="list">{stamps.join(',')}</p>;
}

const tree = (ui: ReactNode) =>
  render(
    <LanguageProvider>
      <PassportProvider>
        {ui}
        <List />
      </PassportProvider>
    </LanguageProvider>,
  );

beforeEach(() => localStorage.clear());

describe('secret stamps', () => {
  it('stamps "language" only when the language actually changes', async () => {
    const user = userEvent.setup();
    tree(<LanguageToggle />);

    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByTestId('list').textContent).toBe('');

    await user.click(screen.getByRole('button', { name: 'ID' }));
    expect(screen.getByTestId('list').textContent).toBe('language');
  });

  it('stamps "reach" when the email address is copied', async () => {
    const user = userEvent.setup();
    tree(<Contact />);

    await user.click(screen.getByRole('button', { name: /copy email/i }));
    await waitFor(() => expect(screen.getByTestId('list').textContent).toBe('reach'));
  });
});
```

Run: `npx vitest run src/passport/secrets.test.tsx`
Expected: both FAIL (nothing is stamped).

- [ ] **Step 2: Edit `src/components/ui/LanguageToggle.tsx`**

Add the import `import { usePassport } from '@/passport/PassportProvider';`. Replace the first line of the component body and the two handlers:

```tsx
  const { language, setLanguage } = useLanguage();
  const { earn } = usePassport();

  const choose = (next: 'en' | 'id') => {
    if (next !== language) earn('language');
    setLanguage(next);
  };
```

and change `onClick={() => setLanguage('en')}` to `onClick={() => choose('en')}` and `onClick={() => setLanguage('id')}` to `onClick={() => choose('id')}`.

- [ ] **Step 3: Edit `src/sections/Contact.tsx`**

Add `import { usePassport } from '@/passport/PassportProvider';`, add `const { earn } = usePassport();` under the `useLanguage` line, and in `handleCopyEmail` add `earn('reach');` directly after `await navigator.clipboard.writeText(profile.email);`. On the headline `<a href={`mailto:${profile.email}`}` add `onClick={() => earn('reach')}`.

- [ ] **Step 4: Run**

Run: `npx vitest run src/passport/secrets.test.tsx src/sections/contact.test.tsx`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Stage only: `src/passport/secrets.test.tsx src/components/ui/LanguageToggle.tsx src/sections/Contact.tsx`
Message: `feat(passport): secret stamps for switching language and reaching out`

---

### Task 9: Hero as the passport data page

**Files:**
- Modify: `src/sections/Hero.tsx`, `src/sections/sections.test.tsx`

- [ ] **Step 1: Update the hero tests first**

In `src/sections/sections.test.tsx` replace the test `'presses a round stamp onto the portrait plate, hidden from assistive technology'` with:

```tsx
  it('is the data page of a passport, with a stamp slot that is hidden from assistive technology', () => {
    const { container } = render(<Hero />);

    // The state of the stamp is said in words beside it; the ring is decoration.
    const stamp = container.querySelector('[data-stamp="home"]');
    expect(stamp).not.toBeNull();
    expect(stamp).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.plate')).not.toBeNull();
    expect(screen.getByText('Arrival')).toBeInTheDocument();
    expect(screen.getByText('Not yet stamped')).toBeInTheDocument();
  });
```

Add a second test directly after it:

```tsx
  it('stamps "reach" when the CV is opened', async () => {
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Hero />
        <Peek />
      </PassportProvider>,
    );
    await user.click(screen.getByRole('link', { name: /download cv/i }));
    expect(screen.getByTestId('peek').textContent).toContain('reach');
  });
```

and, at the top of the file, add imports `import { PassportProvider, usePassport } from '@/passport/PassportProvider';` and this helper below the imports:

```tsx
function Peek() {
  const { stamps } = usePassport();
  return <p data-testid="peek">{stamps.join(',')}</p>;
}
```

Run: `npx vitest run src/sections/sections.test.tsx`
Expected: the two hero tests FAIL.

- [ ] **Step 2: Rewrite `src/sections/Hero.tsx`**

```tsx
import { useLanguage } from '@/context/LanguageContext';
import { usePassport } from '@/passport/PassportProvider';
import StampMark from '@/passport/StampMark';
import { useStampOnRead } from '@/passport/useStampOnRead';

/** A credit-row label: small, mono, wide-tracked, never above a heading. */
const LABEL = 'font-mono text-xs uppercase tracking-[0.14em] text-muted';

const PILL =
  'inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-medium text-primary transition-colors hover:border-primary';

/**
 * The first page of the passport. His name is set as large as the page sets
 * anything, in the serif. Under it is the data page: the portrait in the photo
 * slot, where he is and whether he is open to work, the empty stamp for arrival,
 * and a machine-readable line along the bottom, as a passport has.
 *
 * The h1 is the name and the only h1 on the page.
 */
export default function Hero() {
  const { profile, t, sections } = useLanguage();
  const { earn, has, justEarned } = usePassport();
  const ref = useStampOnRead<HTMLElement>('home');
  const status = profile.openToWork ? t.openToWork : t.notLooking;
  const home = sections.find((section) => section.id === 'home')?.label ?? 'Home';
  const machineLine = `P<${profile.name.toUpperCase().replace(/\s+/g, '<<')}`.padEnd(40, '<');

  return (
    <section
      ref={ref}
      id="home"
      className="scroll-mt-14 px-6 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1120px]">
        <h1
          aria-label={profile.name}
          className="font-display text-[clamp(3.25rem,10vw,8rem)] leading-[0.95] font-normal tracking-[-0.03em] text-primary"
        >
          {profile.name.split(' ').map((word) => (
            <span key={word}>
              <span className="block">{word}</span>{' '}
            </span>
          ))}
        </h1>

        <p className="mt-8 text-xl text-primary md:text-2xl">
          {profile.roles.slice(0, 2).join(' · ')}
        </p>
        <p className="mt-3 max-w-[40ch] text-lg text-muted text-pretty">{profile.tagline}</p>

        <div className="plate mt-14 max-w-[46rem] bg-surface/70">
          <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-[14rem_1fr] md:p-8">
            {/* srcSet and sizes come before src on purpose: React applies props in
                order, and a src applied first starts a fetch of the 2000px original
                before the browser has seen the smaller candidates.

                Width and height carry the file's aspect ratio (0.750), which is
                what the browser reserves a box from before the image arrives.
                hero-avatar.test.ts reads public/profile/avatar.webp and fails if
                these drift, which has shipped silently twice. The portrait is
                the owner's own file and is not to be regenerated. */}
            <img
              srcSet={profile.avatarSrcSet}
              sizes="224px"
              src={profile.avatarUrl}
              alt={`${profile.name} avatar`}
              width={240}
              height={320}
              decoding="async"
              fetchPriority="high"
              className="mx-auto aspect-[3/4] w-56 object-cover sm:mx-0"
            />

            <div className="flex flex-col justify-between gap-8">
              <dl className="border-t border-edge">
                <div className="border-b border-edge py-3">
                  <dt className={LABEL}>{t.location}</dt>
                  <dd className="mt-1 text-primary">{profile.location}</dd>
                </div>
                <div className="border-b border-edge py-3">
                  <dt className={LABEL}>{t.status}</dt>
                  <dd className="mt-1 text-primary">{status}</dd>
                </div>
              </dl>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className={LABEL}>{t.arrival}</p>
                  <p className="mt-1 text-sm text-muted">{has('home') ? t.stamped : t.notStamped}</p>
                </div>
                <StampMark
                  stampId="home"
                  label={home}
                  earned={has('home')}
                  fresh={justEarned === 'home'}
                  className="h-20 w-20"
                />
              </div>
            </div>
          </div>

          <p
            aria-hidden="true"
            className="overflow-hidden border-t border-edge px-6 py-3 font-mono text-xs whitespace-nowrap text-muted md:px-8"
          >
            {machineLine}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => earn('reach')}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            {t.downloadCv} ↗
          </a>
          <a href={`mailto:${profile.email}`} className={PILL}>
            {t.emailMe}
          </a>
          <a href="#projects" className={PILL}>
            {t.viewProjects}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update the preload in `index.html`**

Change the portrait `<link rel="preload" …>`'s `imagesizes` to `"224px"` (the rest of the tag is unchanged). Change the two `theme-color` metas: light `#eef1f7`, dark `#0c1022`.

- [ ] **Step 4: Run**

Run: `npx vitest run src/sections src/data/site.test.ts`
Expected: PASS, including `hero-avatar.test.ts` (240×320 is unchanged). If `site.test.ts` pins the old theme colours, update its expected values to the two new ones.

- [ ] **Step 5: Checkpoint**

Stage only: `src/sections/Hero.tsx src/sections/sections.test.tsx index.html src/data/site.test.ts`
Message: `feat(design): hero as the data page of a passport`

---

### Task 10: Wire it into the app

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Add the failing app tests**

In `src/App.test.tsx` append inside the `describe`:

```tsx
  it('mounts the decorative sky and the passport chip', () => {
    localStorage.clear();
    const { container } = render(<App />);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: /passport 0\/10/i })).toBeInTheDocument();
  });

  it('gives every section a stamp slot', () => {
    const { container } = render(<App />);
    for (const meta of SECTIONS) {
      expect(container.querySelector(`[data-stamp="${meta.id}"]`), meta.id).not.toBeNull();
    }
  });
```

Run: `npx vitest run src/App.test.tsx`
Expected: the two new tests FAIL.

- [ ] **Step 2: Edit `src/App.tsx`**

Add imports:

```tsx
import Passport from '@/passport/Passport';
import { PassportProvider } from '@/passport/PassportProvider';
import SkyCanvas from '@/sky/SkyCanvas';
```

Replace the doc comment above `AppContent` with:

```tsx
/**
 * A passport read top to bottom under a night sky: the data page, then each
 * section on the same twelve-column grid, a hairline above it, its title on the
 * left, its evidence on the right and a stamp slot at its end. The bar across
 * the top carries the way to every section, the language and the CV at every
 * scroll position; the chip in the corner opens the passport.
 */
```

Inside `<SkillHighlightProvider>`, put the sky first (it reads the highlight context) and the chip last:

```tsx
      <SkillHighlightProvider>
        <SkyCanvas />
        <main>
          …unchanged…
        </main>
      </SkillHighlightProvider>
```

Add `<Passport />` as the last child of the fragment (after `</footer>`). Change the footer inner `div` class `py-8` to `pt-8 pb-24` so the corner chip never covers the last link. Replace the export with:

```tsx
export default function App() {
  return (
    <LanguageProvider>
      <PassportProvider>
        <AppContent />
      </PassportProvider>
    </LanguageProvider>
  );
}
```

- [ ] **Step 3: Run the whole suite**

Run: `npm test`
Expected: everything passes except tests that encoded the plate look. Fix each by updating the assertion to the new design, not by loosening it. Likely candidates: `src/nav/Navbar.test.tsx` (if it pinned colours), `src/components/ui/ProjectTile.test.tsx`, `src/sections/sections-lower.test.tsx`. Record the new total.

- [ ] **Step 4: Type-check, lint, build**

Run: `npx tsc --noEmit; npm run lint; npm run build`
Expected: all clean. Note the printed gzip size of the JS chunks: total must stay under about 100 KB.

- [ ] **Step 5: Checkpoint**

Stage only: `src/App.tsx src/App.test.tsx` plus any test files edited in Step 3 (list them by name).
Message: `feat(design): night passport wired into the app`

---

### Task 11: Look at it in a browser, then fix what is wrong

**Files:** whatever the findings need.

- [ ] **Step 1: Start the preview**

Use `mcp__Claude_Browser__preview_start` (a `portfolio` entry in `.claude/launch.json` running `npm run dev`; create it if missing) or run `npm run build; npm run preview -- --port 4173`.

- [ ] **Step 2: Read the page and the console**

Open it, then `read_console_messages` (errors only) and `get_page_text`. Expected: no errors; all seven section titles; "Passport 0/10".

- [ ] **Step 3: Screenshots, four of them**

`resize_window` to desktop and to mobile (375×812), each with `colorScheme` dark and light, then `computer` screenshot of the hero and of one inner section. Check by eye, not by assumption:
- stars never sit under body text hard enough to hurt reading (if they do, lower the star alphas in `draw`: `0.55 - s.layer * 0.12` → a smaller base, and re-check);
- the dawn band is a flat tint, not a glow;
- the hero data page does not overflow at 320 and 375 px;
- the corner chip does not cover content that cannot scroll clear of it.

- [ ] **Step 4: Behaviours that tests cannot see**

With `javascript_tool` and `computer`:
- scroll slowly through the page and watch the chip count climb; scroll fast and confirm it does not;
- hover a skill in Skills and confirm a constellation draws and the matching projects light;
- switch language and confirm the "Two tongues" stamp lands;
- wait for a comet (about 15 s after load), click it, confirm "Comet" lands;
- open the sheet, tick Sound, earn a stamp, confirm a thump.

Frame time of the full tier (paste into `javascript_tool`):

```js
await new Promise((resolve) => {
  const ds = [];
  let last = performance.now();
  const f = (t) => { ds.push(t - last); last = t; ds.length < 180 ? requestAnimationFrame(f) : resolve(ds); };
  requestAnimationFrame(f);
}).then((ds) => { ds.sort((a, b) => a - b); return { median: ds[90], p95: ds[171] }; });
```

Expected: median ≤ 17 ms on desktop.

- [ ] **Step 5: Tier fallbacks**

Emulate reduced motion (DevTools rendering panel, or `resize_window`'s colour scheme is not enough) and reload: the sky must be one still frame with no comet and no rAF loop. Confirm the page reads identically.

- [ ] **Step 6: Overflow at six widths**

At 320, 375, 768, 1024, 1280 and 1440 px run `document.documentElement.scrollWidth <= window.innerWidth`. Expected: `true` for each.

- [ ] **Step 7: Lighthouse, median of three**

With the production preview on port 4173, run three times each:

```powershell
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-mobile.json --chrome-flags="--headless=new"
npx lighthouse http://localhost:4173 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-desktop.json --chrome-flags="--headless=new"
```

Read the scores from the JSON (`categories.performance.score` etc.), then delete the JSON files. Targets: mobile Performance median ≥ 90 (this machine varies by ±10 between runs), desktop ≥ 95, the other three 100. If mobile is below target, check in this order: the Fraunces file (is it preloaded or large?), the canvas cost in the performance trace, then the portrait.

- [ ] **Step 8: axe-core in four configs**

Run `npm view axe-core version`, load `https://cdn.jsdelivr.net/npm/axe-core@<that version>/axe.min.js` into the page with `javascript_tool`, and run `axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag22aa','best-practice'] })` in dark and light at desktop and phone size. Expected: no violations. Contrast over the canvas shows up as "incomplete"; judge those by the screenshots from Step 3.

- [ ] **Step 9: Fix, re-run, report**

For each defect, write a failing test where one is possible, fix, and re-run Steps 2–8 for the affected check. Do not call the work done on a green suite alone.

---

### Task 12: Documents and memory

**Files:**
- Modify: `DESIGN.md`, `.impeccable/design.json`, `CLAUDE.md`, `docs/superpowers/HANDOFF.md`, the spec, and the memory file

- [ ] **Step 1: Spec corrections**

In `docs/superpowers/specs/2026-11-20-night-passport-design.md`, replace the sentence "Loop pauses when the canvas is offscreen (IntersectionObserver) or the tab is hidden" with "Loop pauses while the tab is hidden (a fixed canvas never leaves the viewport, so no IntersectionObserver)". Add under Passport: "Earning a stamp also vibrates for 30 ms where `navigator.vibrate` exists." Add under Risks: "The comet only crosses in the full tier, so readers with reduced motion cannot earn the Comet stamp or the ten-stamp reward; the seven-stamp reward and every word of content remain available."

- [ ] **Step 2: `CLAUDE.md`**

Replace the two bullets "No animation libraries, and no vendored UI kits." and "Motion is CSS, and honours reduced motion in CSS." with:

```markdown
- **No animation libraries, and no vendored UI kits.** The 2026-11-11 redesign deleted `reactbits/`, `aceternity/` and `lightswind/` and uninstalled `gsap`, `motion`, `lenis`, `ogl` and `cobe`. Motion is CSS plus one hand-written canvas 2D sky (`src/sky/`); no WebGL. If a component is ever vendored again, copy the source in by hand and never run its CLI (`npx shadcn add` and friends assume a `components.json`, a `cn` helper and a JS Tailwind config this project does not have), and expect to edit it.
- **The sky looks after the device.** `src/sky/SkyCanvas.tsx` times its first sixty frames and steps down from full to lite to still, starts still under `prefers-reduced-motion`, pauses in a hidden tab and never steps back up. Keep it that way: any new effect must be droppable by the lite and still tiers, and CSS animation stays inside `@media (prefers-reduced-motion: no-preference)` or carries `motion-reduce:`.
- **Nothing is locked behind a stamp.** The passport (`src/passport/`) rewards reading; it never gates a word of content or the contact path. A section is stamped after five seconds near the middle of the screen and a scroll past it.
```

Update the colour bullet's wording "the paper"/"the ink"/"seal colour" to "the sky (or chart paper)", "the starlight (or ink)", "the single amber accent". Update the test count line to the number from Task 10 Step 3 and add `src/lib/contrast.test.ts` to the sentence about guards: "`src/lib/contrast.test.ts` reads `index.css` and fails if any text pair drops under 4.5:1."

- [ ] **Step 3: `DESIGN.md` and `.impeccable/design.json`**

Run the `impeccable:impeccable-documenter` agent against the shipped build with the instruction to derive the system from the code (tokens in `index.css`, the sky, the passport, the data-page hero) and to record these deliberate departures: the dawn band is a flat gradient tint at the bottom of the sky; the star field sits behind body text at low alpha; the `.plate` crosshairs are kept as star-chart registration marks.

- [ ] **Step 4: `HANDOFF.md` and memory**

Add a "Night Passport (round five)" section to `docs/superpowers/HANDOFF.md`: branch name, what was built, the metrics from Task 11, open items (not seen on a physical phone; closing-note copy in the dictionary is placeholder wording for the owner to edit; Comet stamp unreachable under reduced motion; BNSP thumbnails with baked black bars still untouched). Update the memory file `portfolio-redesign-rail-column.md` with a line for the fifth redesign and the index line in `MEMORY.md` ("current is night-passport").

- [ ] **Step 5: Final run and checkpoint**

Run: `npm test; npx tsc --noEmit; npm run lint; npm run build`
Expected: all clean.

Stage only: `DESIGN.md .impeccable/design.json CLAUDE.md docs/superpowers/HANDOFF.md docs/superpowers/specs/2026-11-20-night-passport-design.md docs/superpowers/plans/2026-11-20-night-passport.md`
Message: `docs: night passport design record, handoff and rules`

---

## Self-review against the spec

| Spec requirement | Task |
|---|---|
| Passport world, palette table, serif + Geist + mono | 1, 9 |
| Contrast checked, one accent, semantic tokens | 1 (guard test), house rules |
| Sky: parallax, pointer drift, trail, constellations from skill hover, dawn, comet | 2, 6 |
| Canvas aria-hidden; comet is a real button | 6 |
| Passport chip and sheet; ten stamps; hints for secrets | 7 |
| Seven section stamps by 5 s + scrolled past, accumulating, end-of-page rule | 5 |
| Secrets: comet, language, CV/email | 6, 8, 9 |
| Rewards: closing note at all seven, initials at ten | 7, 6 |
| Stamp effect: CSS press, vibrate, optional sound | 1, 3 |
| No gating; storage in try/catch; live region | 3, 5, 7 |
| Tiers, median of 60 frames, reduced motion, save-data, hidden tab, DPR cap | 2, 6 |
| JS under ~100 KB gzip, Lighthouse, axe, overflow | 10 (size), 11 |
| EN/ID copy in `src/data/i18n` | 4 |
| Docs: DESIGN.md, CLAUDE.md, HANDOFF, memory | 12 |

Placeholder scan: none. Names used across tasks are defined where first used: `Tier`, `Star`, `makeStars`, `pathFor`, `startTier`, `nextTier`, `medianOf`, `cometPosition`, `nextCometDelay`, `withAlpha`, `LAYER_SPEED` (engine); `StampId`, `SECTION_STAMPS`, `ALL_STAMPS`, `TOTAL`, `DWELL_MS`, `STORAGE_KEY`, `SOUND_KEY`, `isStampId`, `isSecret`, `sectionsComplete` (stamps); `usePassport` with `stamps`, `earn`, `has`, `justEarned`, `soundOn`, `setSoundOn` (provider); `useStampOnRead`, `hasPassed`; `StampMark`; `stampName`, `stampHint`.
