# Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the page a working navigation bar — accurate active-section tracking, offset anchor scrolling, a mobile menu, and smooth scroll — built behind a swappable contract so the node-rail navigation in plan 4 replaces it with a one-line change.

**Architecture:** All scroll-derived state lives in pure functions that take numbers, because jsdom computes no layout and every `getBoundingClientRect()` returns zero — logic reachable only through the DOM would be untestable. Thin hooks wire those functions to `IntersectionObserver` and scroll events. Navigation components are dumb renderers fed by `SectionNavProps`, so swapping `PillNavAdapter` for `NodeRailNav` later touches one import.

**Tech Stack:** Lenis 1.3.26, on the existing Vite 8 / React 19 / TypeScript 6.0.3 / Tailwind 4 / Vitest 4 foundation. No React Bits component is used here — see the deviation note below.

**Covers:** Spec phase 2. The contact form, motion primitives, WebGL backdrop, and node-rail navigation are out of scope.

**Reference:** `docs/superpowers/specs/2026-08-17-portfolio-onepage-design.md`, and `docs/superpowers/plans/2026-08-17-foundation-and-content-layer.md` for what already exists.

---

## What Already Exists

- Seven sections rendering from `src/data/`, assembled in `src/App.tsx`. 52 tests pass.
- `src/data/sections.ts` exports `SECTIONS: SectionMeta[]` and `shellProps(id)`.
- `src/types/index.ts` already declares `SectionNavProps` — the navigation contract. It has never been used; this plan is where it starts earning its place.
- `SectionShell` puts `scroll-mt-20` (80px) on every section, so native anchor jumps already clear a 64–72px navbar.
- ESLint forbids `src/sections/**` from importing `src/components/reactbits/**`, proven to fire on relative, alias, and barrel forms.

## Environment Facts That Shape This Plan

Measured against the installed jsdom 29.0.0 before writing this:

| API | Present in jsdom? |
|---|---|
| `IntersectionObserver` | **no** |
| `ResizeObserver` | **no** |
| `matchMedia` | **no** |
| `Element.scrollIntoView` | **no** |
| `getBoundingClientRect()` | present, returns all zeroes |
| `window.scrollTo`, `requestAnimationFrame`, `history.replaceState` | yes |

Two consequences drive the whole design:

1. **Task 1 is not optional.** The moment `App` renders a navbar that observes sections, every existing test that renders `<App />` throws `IntersectionObserver is not defined`. The stubs must land first.
2. **Layout-derived logic cannot be tested through the DOM.** Every rect is zero, so "which section is active" can never be exercised by rendering. That logic therefore lives in pure functions over plain numbers, and the hooks stay thin enough that the untested part is only the wiring.

## Spec Deviation: the React Bits navigation components are not used

Spec decision D6 chose `PillNav` on the stated grounds that it was a "drop-in React Bits component — roughly a day less work". Fetching the source before writing this plan showed that premise does not hold:

- **`PillNav`** — 15,443 characters, declaring `react-router-dom@^6.30.1` and `gsap@^3.13.0`. It imports `Link` from `react-router-dom` at module scope. Its own `isExternalLink` treats any `#…` href as external, so with our anchors it renders plain `<a>` elements and `Link` never runs — the dependency would be installed and bundled purely to satisfy a dead import.
- **`StaggeredMenu`** — 24,763 characters, declaring `gsap@^3.13.0`.

That is roughly 40KB of source to own and maintain, carrying a router this site has no use for, its own colour prop system that would have to be reconciled with the design tokens, and its own GSAP timelines — for a seven-anchor menu. Task 8 writes the equivalent in well under a tenth of that, with correct `aria-current`, `aria-expanded`, and Escape handling, styled directly from the tokens.

**So this plan does not vendor either component**, and `react-router-dom` is never installed. GSAP is still installed here because plan 3 needs it.

This does not weaken the architecture. `src/components/reactbits/` and the ESLint boundary guarding `src/sections/**` stay exactly as they are — plan 3 genuinely uses React Bits (`SplitText`, `AnimatedContent`, `SpotlightCard`, `Galaxy`), and that is where the boundary earns its keep. What changes is only that navigation, which turned out to need precise control over active state and accessibility semantics, is written rather than adopted.

D6's substance is untouched: a simple pill navigation ships now, and the node-rail navigation replaces it in plan 4 through the same `SectionNavProps` contract.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/test/setup.ts` | Extend with jsdom stubs for the four missing APIs |
| `src/lib/scroll.ts` | Pure functions: `pickActiveSection`, `scrollProgress` |
| `src/lib/scroll.test.ts` | Their tests — the substance of this plan's coverage |
| `src/hooks/useActiveSection.ts` | Wires `IntersectionObserver` + scroll to the pure functions |
| `src/hooks/useScrolledPast.ts` | Whether the page has scrolled past a pixel threshold |
| `src/hooks/useMotionAllowed.ts` | Reduced-motion / hover / low-end capability flags |
| `src/hooks/useLenis.ts` | Smooth scroll, disabled under reduced motion, exposes `scrollTo` |
| `src/nav/PillNavAdapter.tsx` | Implements `SectionNavProps` — the desktop pills and progress indicator |
| `src/nav/Navbar.tsx` | Owns the hooks, renders the adapter plus the CV call to action |
| `src/App.tsx` | Renders `Navbar` above `main` |

`src/nav/` is deliberately separate from `src/sections/`. The section import ban does not apply there, which keeps the door open for plan 4's node-rail navigation to reach for React Bits if it needs to.

---

## Task 1: jsdom stubs for the missing browser APIs

Nothing in this plan can render until these exist. The stubs are deliberately observable — a test can drive the fake `IntersectionObserver` — rather than silent no-ops.

**Files:**
- Modify: `src/test/setup.ts`
- Create: `src/test/setup.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/setup.test.ts`:

```ts
import { observers } from './setup';

describe('jsdom stubs', () => {
  it('defines the APIs jsdom is missing', () => {
    expect(typeof globalThis.IntersectionObserver).toBe('function');
    expect(typeof globalThis.ResizeObserver).toBe('function');
    expect(typeof window.matchMedia).toBe('function');
    expect(typeof document.createElement('div').scrollIntoView).toBe('function');
  });

  it('registers each IntersectionObserver so tests can drive it', () => {
    const seen: string[] = [];
    const target = document.createElement('div');
    target.id = 'probe';

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) seen.push((entry.target as HTMLElement).id);
    });
    io.observe(target);

    const registered = observers.at(-1);
    expect(registered).toBeDefined();
    registered!.emit([{ target, intersectionRatio: 0.7, isIntersecting: true }]);

    expect(seen).toEqual(['probe']);
    io.disconnect();
  });

  it('reports matchMedia queries as not matching by default', () => {
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- src/test/setup.test.ts`
Expected: FAIL — `setup.ts` exports no `observers`.

- [ ] **Step 3: Rewrite `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';

/**
 * jsdom 29 implements none of IntersectionObserver, ResizeObserver, matchMedia
 * or scrollIntoView, and every getBoundingClientRect() returns zeroes. These
 * stubs exist so components that observe scrolling can render at all.
 *
 * They are observable rather than silent: `observers` lets a test emit
 * intersection entries by hand, which is the only way to exercise observer
 * wiring in an environment that computes no layout.
 */
export interface FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
  emit: (entries: Array<Partial<IntersectionObserverEntry> & { target: Element }>) => void;
}

export const observers: FakeIntersectionObserver[] = [];

class StubIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  private record: FakeIntersectionObserver;

  constructor(callback: IntersectionObserverCallback) {
    this.record = {
      callback,
      targets: new Set(),
      emit: (entries) => {
        callback(entries as IntersectionObserverEntry[], this);
      },
    };
    observers.push(this.record);
  }

  observe(target: Element) {
    this.record.targets.add(target);
  }

  unobserve(target: Element) {
    this.record.targets.delete(target);
  }

  disconnect() {
    this.record.targets.clear();
    const at = observers.indexOf(this.record);
    if (at >= 0) observers.splice(at, 1);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class StubResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver =
  StubIntersectionObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

Element.prototype.scrollIntoView = function scrollIntoView() {};
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass — 52 existing plus 3 new.

- [ ] **Step 5: Verify lint and types**

```bash
npm run lint && npx tsc --noEmit && echo "clean"
```

Expected: prints `clean`.

- [ ] **Step 6: Commit**

```bash
git add src/test/ && git commit -m "test: stub the browser APIs jsdom does not implement"
```

---

## Task 2: Install Lenis

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm i lenis@1.3.26
```

A runtime dependency, not dev.

GSAP is **not** installed here. Plan 3 needs it for the React Bits animation components, but nothing in this plan imports it, and adding a dependency one plan before its first use is the habit this project keeps refusing elsewhere.

`react-router-dom` is not installed either, and nothing in this plan needs it.

- [ ] **Step 2: Verify the build still passes**

```bash
npm run lint && npx tsc --noEmit && npm run build && npm test && echo "clean"
```

Expected: prints `clean`, 55 tests pass.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json && git commit -m "chore: add gsap and lenis"
```

---

## Task 3: Pure scroll logic

The substance of this plan's test coverage. Everything here takes numbers and returns numbers, so it is fully testable in an environment that computes no layout.

**Files:**
- Create: `src/lib/scroll.ts`, `src/lib/scroll.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/scroll.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./scroll"`.

- [ ] **Step 3: Write `src/lib/scroll.ts`**

```ts
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
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass — 55 existing plus 9 new.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ && git commit -m "feat: add pure scroll position logic"
```

---

## Task 4: `useActiveSection`

**Files:**
- Create: `src/hooks/useActiveSection.ts`, `src/hooks/useActiveSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useActiveSection.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react';
import { observers } from '@/test/setup';
import { useActiveSection } from './useActiveSection';

const SECTIONS = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1 },
];

function mountSections() {
  document.body.innerHTML = SECTIONS.map((s) => `<section id="${s.id}"></section>`).join('');
}

describe('useActiveSection', () => {
  beforeEach(() => {
    mountSections();
    observers.length = 0;
    history.replaceState(null, '', '/');
  });

  it('starts on the first section', () => {
    const { result } = renderHook(() => useActiveSection(SECTIONS));
    expect(result.current.activeId).toBe('home');
    expect(result.current.progress).toBe(0);
  });

  it('observes every section that exists in the document', () => {
    renderHook(() => useActiveSection(SECTIONS));
    expect(observers.at(-1)!.targets.size).toBe(2);
  });

  it('follows the most visible section', () => {
    const { result } = renderHook(() => useActiveSection(SECTIONS));

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('home')!, intersectionRatio: 0.1 },
        { target: document.getElementById('about')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(result.current.activeId).toBe('about');
  });

  it('writes the active section to the url without adding history entries', () => {
    const before = history.length;
    const { result } = renderHook(() => useActiveSection(SECTIONS));

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('about')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(result.current.activeId).toBe('about');
    expect(window.location.hash).toBe('#about');
    expect(history.length).toBe(before);
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(SECTIONS));
    expect(observers.length).toBe(1);
    unmount();
    expect(observers.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./useActiveSection"`.

- [ ] **Step 3: Write `src/hooks/useActiveSection.ts`**

```ts
import { useEffect, useMemo, useRef, useState } from 'react';

import { pickActiveSection, scrollProgress, type SectionVisibility } from '@/lib/scroll';
import type { SectionMeta } from '@/types';

export interface ActiveSection {
  activeId: string;
  progress: number;
}

/**
 * Tracks which section is on screen and how far down the page the reader is.
 *
 * Ratios are accumulated in a ref rather than state: the observer reports only
 * the sections that changed, so state would have to be merged on every callback
 * and would re-render for sections the reader cannot see.
 */
export function useActiveSection(sections: SectionMeta[]): ActiveSection {
  const order = useMemo(() => sections.map((section) => section.id), [sections]);
  const [activeId, setActiveId] = useState(order[0] ?? '');
  const [progress, setProgress] = useState(0);
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.intersectionRatio);
        }

        const visibility: SectionVisibility[] = [...ratios.current].map(([id, ratio]) => ({
          id,
          ratio,
        }));

        setActiveId((current) => pickActiveSection(visibility, order, current));
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] },
    );

    for (const id of order) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [order]);

  useEffect(() => {
    const onScroll = () => {
      setProgress(
        scrollProgress(window.scrollY, document.body.scrollHeight, window.innerHeight),
      );
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    history.replaceState(null, '', `#${activeId}`);
  }, [activeId]);

  return { activeId, progress };
}
```

The threshold list is several values rather than the single 0.4 the spec mentions. A lone threshold only fires when a section crosses exactly that ratio, so a tall section that never leaves the viewport stops reporting and the indicator sticks. Multiple thresholds keep ratios fresh.

`history.replaceState` rather than `pushState` is deliberate: one scroll down the page would otherwise bury the visitor's previous site under seven history entries, and the back button would stop working the way they expect.

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass — 64 existing plus 5 new.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useActiveSection.ts src/hooks/useActiveSection.test.tsx && git commit -m "feat: track the active section from scroll position"
```

---

## Task 5: `useScrolledPast` and `useMotionAllowed`

Two small hooks. `useScrolledPast` drives the navbar's change of appearance; `useMotionAllowed` is the capability gate the spec puts at the centre of motion handling, introduced here because Lenis is the first thing that must respect it.

**Files:**
- Create: `src/hooks/useScrolledPast.ts`, `src/hooks/useMotionAllowed.ts`, `src/hooks/hooks.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/hooks.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react';
import { useMotionAllowed } from './useMotionAllowed';
import { useScrolledPast } from './useScrolledPast';

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
  window.dispatchEvent(new Event('scroll'));
}

function mockMedia(matcher: (query: string) => boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matcher(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('useScrolledPast', () => {
  afterEach(() => setScroll(0));

  it('is false at the top and true past the threshold', () => {
    const { result } = renderHook(() => useScrolledPast(80));
    expect(result.current).toBe(false);

    act(() => setScroll(120));
    expect(result.current).toBe(true);

    act(() => setScroll(10));
    expect(result.current).toBe(false);
  });
});

describe('useMotionAllowed', () => {
  afterEach(() => mockMedia(() => false));

  it('allows motion when nothing objects', () => {
    mockMedia(() => false);
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.animate).toBe(true);
  });

  it('refuses motion when the reader asked for less of it', () => {
    mockMedia((query) => query.includes('prefers-reduced-motion'));
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.animate).toBe(false);
    expect(result.current.webgl).toBe(false);
  });

  it('reports hover separately from motion', () => {
    mockMedia((query) => query.includes('hover'));
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current.hover).toBe(true);
    expect(result.current.animate).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/hooks/useScrolledPast.ts`**

```ts
import { useEffect, useState } from 'react';

/** Whether the page has scrolled further than `threshold` pixels. */
export function useScrolledPast(threshold: number): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return past;
}
```

- [ ] **Step 4: Write `src/hooks/useMotionAllowed.ts`**

```ts
import { useEffect, useState } from 'react';

export interface MotionCapability {
  /** The reader has not asked for reduced motion. */
  animate: boolean;
  /** A real pointer that can hover, so hover-only affordances are reachable. */
  hover: boolean;
  /** Worth spending a GPU context on. */
  webgl: boolean;
}

interface NavigatorCapabilities {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: { saveData?: boolean };
}

function read(): MotionCapability {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { animate: false, hover: false, webgl: false };
  }

  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const nav = navigator as Navigator & NavigatorCapabilities;
  const weak =
    nav.connection?.saveData === true ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) ||
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4);

  return { animate, hover, webgl: animate && !weak };
}

/**
 * The single place that decides whether motion runs.
 *
 * Reduced motion has to be honoured everywhere, and gating scattered across
 * components is gating that gets forgotten in one of them. Every motion
 * primitive reads this instead of testing media queries itself.
 */
export function useMotionAllowed(): MotionCapability {
  const [capability, setCapability] = useState<MotionCapability>(() => read());

  useEffect(() => {
    const update = () => setCapability(read());
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(hover: hover) and (pointer: fine)'),
    ];

    update();
    for (const query of queries) query.addEventListener('change', update);
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
  }, []);

  return capability;
}
```

- [ ] **Step 5: Run the test**

Run: `npm test`
Expected: all pass — 69 existing plus 4 new.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ && git commit -m "feat: add scroll threshold and motion capability hooks"
```

---

## Task 6: `useLenis`

**Files:**
- Create: `src/hooks/useLenis.ts`, `src/hooks/useLenis.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useLenis.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react';
import { useLenis } from './useLenis';

describe('useLenis', () => {
  it('returns a scrollTo function that targets a section by id', () => {
    document.body.innerHTML = '<section id="about"></section>';
    const target = document.getElementById('about')!;
    const spy = vi.spyOn(target, 'scrollIntoView');

    const { result } = renderHook(() => useLenis());
    result.current.scrollTo('about');

    expect(spy).toHaveBeenCalled();
  });

  it('does nothing for an id that is not on the page', () => {
    document.body.innerHTML = '';
    const { result } = renderHook(() => useLenis());
    expect(() => result.current.scrollTo('nowhere')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/hooks/useLenis.ts`**

```ts
import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';

import { useMotionAllowed } from './useMotionAllowed';

/** Height of the fixed navbar, so an anchor does not land underneath it. */
export const NAV_OFFSET = 80;

export interface SmoothScroll {
  scrollTo: (id: string) => void;
}

/**
 * Smooth scrolling, with a native fallback.
 *
 * Lenis is skipped entirely under reduced motion — hijacking the scroll wheel
 * is exactly what a reader asking for less motion is asking to avoid. The
 * returned scrollTo works either way, so callers never branch on it.
 */
export function useLenis(): SmoothScroll {
  const { animate } = useMotionAllowed();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!animate) return;

    const instance = new Lenis({ duration: 0.9 });
    lenis.current = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
    };
  }, [animate]);

  const scrollTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis.current) {
      lenis.current.scrollTo(target, { offset: -NAV_OFFSET });
      return;
    }

    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  return { scrollTo };
}
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass — 73 existing plus 3 new (see the note below on the third test).

**Be careful about which path these tests actually exercise.** The stubbed `matchMedia` reports `matches: false` for every query, including `prefers-reduced-motion`, so `animate` is **true** and Lenis really is constructed during the test. That means the test above covers the Lenis branch of `scrollTo`, not the fallback.

Lenis in jsdom is an unknown: it attaches scroll listeners and drives a `requestAnimationFrame` loop against a document with no layout. If it throws on construction, report that rather than working around it — it would mean the hook needs a capability guard beyond the reduced-motion one.

To cover the fallback branch deliberately, add a test that forces reduced motion before rendering:

```tsx
it('falls back to native scrolling when the reader asked for reduced motion', () => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  document.body.innerHTML = '<section id="about"></section>';
  const spy = vi.spyOn(document.getElementById('about')!, 'scrollIntoView');

  const { result } = renderHook(() => useLenis());
  result.current.scrollTo('about');

  expect(spy).toHaveBeenCalled();
});
```

That makes it three tests in this task rather than two, so the suite total after this task is 76.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLenis.ts src/hooks/useLenis.test.tsx && git commit -m "feat: add smooth scrolling with a native fallback"
```

---

## Task 7: `PillNavAdapter`

**Files:**
- Create: `src/nav/PillNavAdapter.tsx`, `src/nav/PillNavAdapter.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/nav/PillNavAdapter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PillNavAdapter from './PillNavAdapter';
import { SECTIONS } from '@/data/sections';

const props = {
  sections: SECTIONS,
  activeId: 'about',
  progress: 0.25,
  onNavigate: () => {},
};

describe('PillNavAdapter', () => {
  it('renders one link per section, pointing at its anchor', () => {
    render(<PillNavAdapter {...props} />);
    for (const section of SECTIONS) {
      expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }
  });

  it('marks the active section for assistive technology', () => {
    render(<PillNavAdapter {...props} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate instead of letting the browser jump', async () => {
    const onNavigate = vi.fn();
    render(<PillNavAdapter {...props} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', { name: 'Skills' }));

    expect(onNavigate).toHaveBeenCalledWith('skills');
  });

  it('exposes scroll progress to assistive technology', () => {
    render(<PillNavAdapter {...props} />);
    const bar = screen.getByRole('progressbar', { name: /reading progress/i });
    expect(bar).toHaveAttribute('aria-valuenow', '25');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/nav/PillNavAdapter.tsx`**

```tsx
import type { SectionNavProps } from '@/types';

/**
 * The desktop navigation, and the first implementation of SectionNavProps.
 *
 * It owns no scroll state — activeId and progress arrive as props — so the
 * node-rail navigation planned to replace it can be swapped in by changing one
 * import, without touching the hooks or any section.
 *
 * Links keep real href anchors so the navigation still works with JavaScript
 * disabled and so middle-click and copy-link behave normally; onNavigate takes
 * over only for ordinary left clicks, where smooth scrolling is wanted.
 */
export default function PillNavAdapter({
  sections,
  activeId,
  progress,
  onNavigate,
}: SectionNavProps) {
  return (
    <div className="flex items-center gap-4">
      <ul className="relative flex items-center gap-1 rounded-full border border-edge bg-surface p-1">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  onNavigate(section.id);
                }}
                className={`block rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive ? 'bg-accent font-semibold text-void' : 'text-muted hover:text-primary'
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 w-16 overflow-hidden rounded-full bg-edge"
      >
        <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
```

Links keep real `href` anchors rather than becoming buttons. That way the navigation still works if the JavaScript fails to load, and middle-click, copy-link, and open-in-new-tab all behave the way a reader expects. `onNavigate` intercepts only plain left clicks, which is where smooth scrolling is wanted.

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass — 76 existing plus 4 new.

- [ ] **Step 5: Commit**

```bash
git add src/nav/ && git commit -m "feat: add the desktop navigation adapter"
```

---

## Task 8: `Navbar` and the mobile menu

**Files:**
- Create: `src/nav/Navbar.tsx`, `src/nav/Navbar.test.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/nav/Navbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = SECTIONS.map((s) => `<section id="${s.id}"></section>`).join('');
  });

  it('is a landmark containing the site navigation', () => {
    render(<Navbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /sections/i })).toBeInTheDocument();
  });

  it('offers the cv without hiding it behind the mobile menu', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: /cv/i })).toHaveAttribute('href', profile.cvUrl);
  });

  it('opens and closes the mobile menu, and closes it with Escape', async () => {
    render(<Navbar />);
    const toggle = screen.getByRole('button', { name: /menu/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/nav/Navbar.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react';

import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useLenis } from '@/hooks/useLenis';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import PillNavAdapter from './PillNavAdapter';

export default function Navbar() {
  const { activeId, progress } = useActiveSection(SECTIONS);
  const { scrollTo } = useLenis();
  const scrolled = useScrolledPast(80);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useCallback(
    (id: string) => {
      setMenuOpen(false);
      scrollTo(id);
    },
    [scrollTo],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors md:h-18 ${
        scrolled ? 'border-b border-edge bg-void/80 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate('home');
          }}
          className="font-display text-lg font-extrabold text-primary"
        >
          {profile.shortName}
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <PillNavAdapter
            sections={SECTIONS}
            activeId={activeId}
            progress={progress}
            onNavigate={navigate}
          />
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={profile.cvUrl}
            download
            className="rounded-full border border-accent px-4 py-1.5 text-sm font-semibold text-accent"
          >
            CV
          </a>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-edge px-3 py-1.5 text-sm text-muted md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Sections, mobile"
          className="border-b border-edge bg-void px-6 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={section.id === activeId ? 'page' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(section.id);
                  }}
                  className="block rounded-lg px-3 py-2 text-primary"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
```

The mobile menu is a plain disclosure rather than an overlay: a button with `aria-expanded`, a panel that closes on selection and on Escape. It is not a modal, so it needs no focus trap and no inert background — a menu that lives in the document flow and pushes nothing aside is simpler to get right than one that has to manage focus, and does the same job for seven links.

The CV link sits outside the disclosure so it stays reachable at every width without opening the menu first.

- [ ] **Step 4: Render the navbar in `src/App.tsx`**

Add the import and place `<Navbar />` immediately after the skip link and before `<main>`:

```tsx
import Navbar from '@/nav/Navbar';
```

```tsx
      <Navbar />

      <main>
```

The skip link must stay the first element in the document, ahead of the navbar, so a keyboard user reaches it before the navigation.

- [ ] **Step 5: Add the App-level test**

Append to `src/App.test.tsx`:

```tsx
  it('keeps the skip link ahead of the navigation', () => {
    const { container } = render(<App />);
    const focusable = container.querySelectorAll('a[href], button');
    expect(focusable[0]).toHaveTextContent(/skip to content/i);
  });
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: all pass — 80 existing plus 4 new.

Existing App tests must still pass unchanged. If "has exactly one h1" now fails, the navbar logo was rendered as a heading; make it a link instead.

- [ ] **Step 7: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Expected: prints `clean`.

- [ ] **Step 8: Commit**

```bash
git add src/nav/ src/App.tsx src/App.test.tsx && git commit -m "feat: add the navbar and wire it into the page"
```

---

## Task 9: Verify the real page

Unit tests cannot see layout here, so this is the step that decides whether the navigation actually works.

**Files:** none — verification only.

- [ ] **Step 1: Build and serve**

```bash
npm run build && npx vite preview --port 4180
```

- [ ] **Step 2: Verify in a browser and report measurements**

1. **Anchor offset** — clicking each nav item leaves the section heading visible below the navbar, not hidden underneath it. Report the top offset of each section after navigating to it.
2. **Active state** — scrolling top to bottom lights each item in turn, and scrolling fast does not leave it stuck on a stale section.
3. **URL** — the hash updates while scrolling, and the browser back button still leaves the site rather than stepping through seven sections.
4. **Navbar chrome** — transparent over the hero, gaining a background and bottom border past 80px.
5. **Keyboard** — Tab reaches the skip link first, then the logo, then every nav item, then the CV link. The mobile menu opens from the keyboard and closes with Escape.
6. **375px** — the desktop pills are hidden, the Menu button appears, the CV link stays visible, and there is no horizontal overflow at 320px, 375px, 768px, and 1280px.
7. **Reduced motion** — with `prefers-reduced-motion: reduce` emulated, scrolling is native rather than smoothed, and every anchor still lands correctly.

- [ ] **Step 3: Commit any fixes the verification turns up**

Report what you found before changing anything.

---

## Done When

- `npm test` passes, with the pure scroll logic covered directly and the hooks covered through a drivable observer stub.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.
- Clicking any nav item scrolls to that section, clear of the navbar.
- The active item follows the reader, including during fast scrolling.
- The mobile menu opens, closes on selection, and closes with Escape.
- `prefers-reduced-motion` disables smooth scrolling without breaking navigation.
- No `react-router-dom` anywhere in the dependency tree.
- Swapping `PillNavAdapter` for another `SectionNavProps` implementation touches only `Navbar.tsx`.

## Not In This Plan

Motion primitives and the WebGL backdrop (plan 3). Contact form, project modal, certificate lightbox, node-rail navigation, and deployment (plan 4).
