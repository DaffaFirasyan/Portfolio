# Motion Primitives and Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the motion layer the rest of the site animates through — four primitives that own every contact with React Bits and every reduced-motion decision — then use them to bring the hero to life, backed by a WebGL starfield that unmounts when it leaves the screen.

**Architecture:** Sections never import React Bits. They import `<Reveal>`, `<Heading>`, `<Surface>`, and `<Backdrop>` from `src/motion/`, each of which reads `useMotionAllowed()` once and renders plain markup when motion is refused. An ESLint rule already makes the boundary a CI failure. `<Backdrop>` is the only holder of a WebGL context on the page: it lazy-imports `ogl`, mounts only when the capability check passes, and disconnects when scrolled away.

**Tech Stack:** GSAP 3.15.0 + @gsap/react 2.1.2, Motion 12.43.0, ogl 1.0.11, and twelve vendored React Bits components, on the existing Vite 8 / React 19 / TypeScript 6.0.3 / Tailwind 4 / Vitest 4 foundation.

**Covers:** Spec phases 3 and 4. Animating About, Skills, Experience, Projects and Education comes next; the contact form, project modal, certificate lightbox, node-rail navigation and deployment come after that.

**Reference:** `docs/superpowers/specs/2026-08-17-portfolio-onepage-design.md`, plus the two completed plans in the same directory.

---

## What Already Exists

- Seven sections rendering from `src/data/`, a working navbar, smooth scrolling. **91 tests pass** across 12 files.
- `src/hooks/useMotionAllowed.ts` already returns `{ animate, hover, webgl }` and is subscribed to media-query changes. It was written in plan 2 for Lenis; this plan is what it was really for.
- `src/components/layout/SectionShell.tsx` renders every section's eyebrow and `<h2>`.
- ESLint forbids `src/sections/**` from importing `src/components/reactbits/**` — verified to fire on relative, alias and barrel forms.
- `src/components/reactbits/` does not exist yet. This plan creates it.

## Registry Findings

Checked against the live React Bits registry before writing this plan. Unlike `PillNav` in plan 2, these are small and carry no surprises:

| Component | Size | npm dependency |
|---|---|---|
| `SpotlightCard` | 1.9 KB | **none** — React only |
| `Noise` | 2.0 KB | none |
| `ScrollFloat` | 2.3 KB | gsap |
| `CountUp` | 2.9 KB | motion |
| `AnimatedContent` | 3.1 KB | gsap |
| `BlurText` | 3.6 KB | motion |
| `ShinyText` | 3.9 KB | motion |
| `TiltedCard` | 4.2 KB | motion |
| `SplitText` | 5.2 KB | gsap, @gsap/react |
| `RotatingText` | 7.6 KB | motion |
| `Galaxy` | 10.3 KB | ogl |
| `LogoLoop` | 16.1 KB | none |

Three findings worth knowing before starting:

**`gsap/SplitText` resolves from the public package.** It was a paid GSAP Club plugin historically. `gsap@3.15.0` ships `dist/SplitText.js`, and gsap's `exports` map carries a `"./*"` wildcard, so `import { SplitText } from 'gsap/SplitText'` resolves — verified against an actual install.

**Motion is pinned to 12.43.0, not the 13.1.0 that `npm view` calls latest.** Every component above declares `motion@^12.23.12`. Motion 13 still exposes `./react`, but a major bump in an animation library is not something to take on faith across six components at once. Revisit deliberately, not by default.

**`three` is never installed.** Spec decision D5 dropped `Lanyard`; `Galaxy` uses `ogl`, which is a tenth the size. Nothing in this plan or any later one should pull in `three`.

### Component APIs, read from the registry source

These are the props the code below actually depends on. Several of these components take a `text` or `to` prop rather than children, which is the sort of thing that turns into a confusing runtime failure if assumed.

| Component | Shape |
|---|---|
| `AnimatedContent` | `children`, `distance=100`, `direction='vertical'`, `duration=0.8`, `delay=0`, `ease`, `threshold=0.1`, `scale`, `className` |
| `SpotlightCard` | `children`, `className`, `spotlightColor` |
| `SplitText` | **`text`**, **`tag`** (`'h1'…'h6' \| 'p' \| 'span'`), `splitType`, `duration`, `delay`, `className`, `textAlign` — renders the tag itself, and takes no `id` |
| `BlurText` | **`text`** (not children), `animateBy='words'`, `direction='top'`, `delay=200`, `stepDuration=0.35`, `className` |
| `ShinyText` | **`text`**, `speed`, `disabled`, `className`, `shineColor`, `spread` |
| `CountUp` | **`to`**, `from`, `duration`, `delay`, `separator`, `startWhen`, `className` |
| `TiltedCard` | **`imageSrc`**, `altText`, `containerHeight/Width`, `imageHeight/Width`, `rotateAmplitude`, `scaleOnHover`, `showMobileWarning`, `showTooltip`, `overlayContent` |
| `Noise` | `patternSize`, `patternScaleX/Y`, `patternRefreshInterval`, `patternAlpha` |
| `Galaxy` | `density`, `starSpeed`, `glowIntensity`, `saturation`, `hueShift`, `twinkleIntensity`, `mouseInteraction`, `mouseRepulsion`, `transparent`, `disableAnimation` |

`RotatingText`'s signature could not be parsed from the registry JSON — read it from the vendored file in Task 2 and report its actual props before using it in Task 6.

`TiltedCard` defaults `showMobileWarning` to true, which renders a visible "this effect is not optimised for mobile" notice. Pass `showMobileWarning={false}`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/reactbits/**` | Twelve vendored components, kept as fetched |
| `src/motion/Reveal.tsx` | Entrance animation wrapper |
| `src/motion/Heading.tsx` | Animated section and page headings |
| `src/motion/Surface.tsx` | Card surface with cursor spotlight |
| `src/motion/Backdrop.tsx` | The page's single WebGL context, lazily loaded |
| `src/motion/motion.test.tsx` | Behaviour of all four under both motion settings |
| `src/components/layout/SectionShell.tsx` | Modified to render its title through `<Heading>` |
| `src/sections/Hero.tsx` | Modified to animate |

`src/motion/` is the only directory besides `src/nav/` allowed to import React Bits. That is the whole point of it.

---

## Task 1: Install the animation dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm i gsap@3.15.0 @gsap/react@2.1.2 motion@12.43.0 ogl@1.0.11
```

All four are runtime dependencies. Pin `motion` to 12.43.0 exactly as written — see the registry findings above.

- [ ] **Step 2: Confirm `gsap/SplitText` resolves**

```bash
node -e "console.log(require.resolve('gsap/SplitText'))"
```

Expected: a path ending in `dist/SplitText.js`. If this fails, stop and report — every heading animation in this plan depends on it.

- [ ] **Step 3: Verify nothing regressed**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Expected: 91 tests pass, prints `clean`.

- [ ] **Step 4: Confirm the bundle did not grow**

```bash
ls -la dist/assets/*.js
```

Nothing imports the new packages yet, so the bundle should be unchanged from before the install — roughly 242 KB raw / 75 KB gzip. If it grew, something is importing them already and that is worth understanding before continuing.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json && git commit -m "chore: add gsap, motion and ogl"
```

---

## Task 2: Vendor the React Bits components

**Files:**
- Create: twelve files under `src/components/reactbits/`

- [ ] **Step 1: Fetch all twelve**

```bash
npx jsrepo@3.8.1 add https://reactbits.dev/r/AnimatedContent-TS-TW https://reactbits.dev/r/SplitText-TS-TW https://reactbits.dev/r/ScrollFloat-TS-TW https://reactbits.dev/r/SpotlightCard-TS-TW https://reactbits.dev/r/Galaxy-TS-TW https://reactbits.dev/r/RotatingText-TS-TW https://reactbits.dev/r/BlurText-TS-TW https://reactbits.dev/r/ShinyText-TS-TW https://reactbits.dev/r/CountUp-TS-TW https://reactbits.dev/r/LogoLoop-TS-TW https://reactbits.dev/r/TiltedCard-TS-TW https://reactbits.dev/r/Noise-TS-TW
```

If `jsrepo` prompts interactively, writes outside `src/components/reactbits/`, or tries to install dependencies itself, abandon it. Fetch the registry JSON directly instead — each response has a `files` array whose entries carry `path` and `content`:

```bash
curl -sS https://reactbits.dev/r/SpotlightCard-TS-TW
```

Write each `content` to `src/components/reactbits/<path>`. Do not let any tool add dependencies; Task 1 pinned them deliberately.

- [ ] **Step 2: Confirm no unexpected dependency crept in**

```bash
node -e "const d=require('./package.json').dependencies; for (const k of ['three','react-router-dom','framer-motion']) console.log(k, d[k] ?? 'not installed')"
```

Expected: all three report `not installed`.

- [ ] **Step 3: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Vendored third-party source routinely trips stricter rules than a project's own code — this project runs 16 `react-hooks` rules at error level, including the React Compiler set. If a vendored file fails, fix the file rather than weakening a rule, and report exactly what you changed. These are files the project now owns.

- [ ] **Step 4: Commit**

```bash
git add src/components/reactbits/ && git commit -m "feat: vendor the React Bits animation components"
```

---

## Task 3: `Reveal`, `Heading` and `Surface`

The three primitives every section will use. Each reads the capability once and renders plain markup when motion is refused — that is what makes reduced-motion support structural instead of a thing seven sections each have to remember.

`Surface` has no caller until About and Skills are animated in the next plan. It is built here anyway, and deliberately: the three primitives are one architectural decision and are easier to review together than split across two plans, an unused component costs nothing at runtime, and its reduced-motion and touch-device branches are covered by the tests below. That reasoning does not extend to dependencies — an unused package is a real cost, which is why GSAP was not installed a plan early.

**Files:**
- Create: `src/motion/Reveal.tsx`, `src/motion/Heading.tsx`, `src/motion/Surface.tsx`, `src/motion/motion.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/motion/motion.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Heading from './Heading';
import Reveal from './Reveal';
import Surface from './Surface';

function setMotion(allowed: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !allowed : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe.each([
  ['motion allowed', true],
  ['motion refused', false],
])('%s', (_label, allowed) => {
  beforeEach(() => setMotion(allowed));

  it('Reveal renders its children either way', () => {
    render(
      <Reveal>
        <p>body copy</p>
      </Reveal>,
    );
    expect(screen.getByText('body copy')).toBeInTheDocument();
  });

  it('Heading renders real heading text at the requested level', () => {
    render(<Heading level={2}>Who I am</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Who I am' })).toBeInTheDocument();
  });

  it('Surface renders its children either way', () => {
    render(
      <Surface>
        <p>card body</p>
      </Surface>,
    );
    expect(screen.getByText('card body')).toBeInTheDocument();
  });
});

describe('with motion refused', () => {
  beforeEach(() => setMotion(false));

  it('Heading emits one text node, not one element per character', () => {
    render(<Heading level={2}>Who I am</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.childElementCount).toBe(0);
    expect(heading.textContent).toBe('Who I am');
  });

  it('Surface adds no cursor tracking', () => {
    const { container } = render(
      <Surface>
        <p>card body</p>
      </Surface>,
    );
    expect(container.querySelector('[data-spotlight]')).toBeNull();
  });
});
```

The two assertions in the last block are the ones that matter. Reduced motion is not satisfied by an animation that runs instantly — `SplitText` splits a heading into one span per character, which changes what a screen reader announces and how text wraps. Under reduced motion the heading has to be ordinary text.

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved imports.

Report the exact message.

- [ ] **Step 3: Write `src/motion/Reveal.tsx`**

```tsx
import type { ReactNode } from 'react';

import AnimatedContent from '@/components/reactbits/AnimatedContent/AnimatedContent';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before starting, for staggering siblings. */
  delay?: number;
  className?: string;
}

/**
 * Entrance animation for a block of content.
 *
 * Sections import this instead of React Bits directly, so the reduced-motion
 * decision is made in one place rather than seven.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <div className={className}>{children}</div>;

  return (
    <AnimatedContent distance={40} direction="vertical" duration={0.6} delay={delay}>
      <div className={className}>{children}</div>
    </AnimatedContent>
  );
}
```

Check the vendored `AnimatedContent` props before writing this — the names above are from its documented API, and if the fetched source differs, match the source and report the difference.

- [ ] **Step 4: Write `src/motion/Heading.tsx`**

```tsx
import type { ReactNode } from 'react';

import SplitText from '@/components/reactbits/SplitText/SplitText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface HeadingProps {
  level: 1 | 2 | 3;
  children: string;
  className?: string;
  id?: string;
}

/**
 * A heading that animates in per character when motion is welcome, and is
 * ordinary text when it is not.
 *
 * The distinction is not decorative. SplitText wraps every character in its own
 * element, which changes how assistive technology reads the text and how it
 * wraps at narrow widths — so under reduced motion the heading must be a plain
 * text node, not a fast animation.
 *
 * `children` is typed as string rather than ReactNode because splitting only
 * works on text, and accepting elements would fail at runtime instead of here.
 */
export default function Heading({ level, children, className, id }: HeadingProps) {
  const { animate } = useMotionAllowed();
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';

  if (!animate) {
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  // SplitText renders the heading element itself via `tag`. Wrapping it in
  // another <Tag> would nest a heading inside a heading, which is invalid and
  // makes the accessible name ambiguous.
  return (
    <SplitText
      text={children}
      tag={Tag}
      className={className}
      splitType="chars"
      duration={0.6}
      delay={20}
    />
  );
}
```

Note `SplitText` takes no `id`, so if a caller passes one the animated branch silently drops it. No caller does today. Either thread it through the vendored component or drop `id` from `HeadingProps` — decide, and say which.

- [ ] **Step 5: Write `src/motion/Surface.tsx`**

```tsx
import type { ReactNode } from 'react';

import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

const BASE = 'rounded-xl border border-edge bg-surface';

/**
 * The card surface used across the site.
 *
 * One component owning the whole hover language is what keeps the page from
 * accumulating three different card treatments. The cursor spotlight needs a
 * pointer that can hover as well as motion, so a touch device gets the plain
 * card even when animation is allowed.
 */
export default function Surface({ children, className }: SurfaceProps) {
  const { animate, hover } = useMotionAllowed();
  const classes = className ? `${BASE} ${className}` : BASE;

  if (!animate || !hover) return <div className={classes}>{children}</div>;

  return (
    <SpotlightCard className={classes} spotlightColor="rgba(240, 163, 46, 0.12)">
      {children}
    </SpotlightCard>
  );
}
```

The test looks for a `[data-spotlight]` attribute to tell the two paths apart. If the vendored `SpotlightCard` does not set one, add it to the vendored file — it is a file this project now owns, and a test that cannot distinguish the paths is not testing anything.

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: all pass — 91 existing plus 8 new, so 99 total.

- [ ] **Step 7: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

- [ ] **Step 8: Commit**

```bash
git add src/motion/ src/components/reactbits/ && git commit -m "feat: add the Reveal, Heading and Surface motion primitives"
```

---

## Task 4: `Backdrop`

The page's only WebGL context, and the one component with a real lifecycle to get wrong.

**Files:**
- Create: `src/motion/Backdrop.tsx`, `src/motion/Backdrop.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/motion/Backdrop.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { observers } from '@/test/stubs';
import Backdrop from './Backdrop';

function setCapability({ reduced, memory }: { reduced: boolean; memory?: number }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  Object.defineProperty(navigator, 'deviceMemory', {
    value: memory,
    configurable: true,
  });
}

describe('Backdrop', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('renders a static gradient and no canvas under reduced motion', async () => {
    setCapability({ reduced: true, memory: 16 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('canvas')).toBeNull());
  });

  it('renders a static gradient on a device too weak for it', async () => {
    setCapability({ reduced: false, memory: 2 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('canvas')).toBeNull());
  });

  it('is hidden from assistive technology either way', () => {
    setCapability({ reduced: true, memory: 16 });
    const { container } = render(<Backdrop />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('watches its own visibility so it can unmount when scrolled away', () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    expect(observers.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/motion/Backdrop.tsx`**

```tsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';

const Galaxy = lazy(() => import('@/components/reactbits/Galaxy/Galaxy'));

/**
 * The single WebGL surface on the page.
 *
 * Three things have to be true at once for it to run: the reader accepts
 * motion, the device looks capable, and the backdrop is actually on screen.
 * The last one matters more than it sounds — a hidden canvas keeps rendering,
 * so hiding it with CSS would leave a GPU loop running for a section nobody is
 * looking at. It is unmounted instead.
 *
 * ogl is behind a lazy import so the WebGL code never reaches a visitor whose
 * settings or device rule it out.
 */
export default function Backdrop() {
  const { webgl } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setOnScreen(entry.isIntersecting);
      },
      { rootMargin: '100px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {webgl && onScreen ? (
        <Suspense fallback={<div data-testid="backdrop-fallback" className="h-full w-full" />}>
          <Galaxy />
        </Suspense>
      ) : (
        <div
          data-testid="backdrop-fallback"
          className="h-full w-full bg-gradient-to-b from-elevated to-void"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: all pass — 99 existing plus 4 new, so 103 total.

jsdom provides no WebGL context, so if any test reaches the real `Galaxy` it will fail in a confusing way. That is why every test above pins the capability explicitly rather than relying on defaults. The fourth test deliberately allows WebGL but never emits an intersection, so `onScreen` stays false and `Galaxy` is never rendered.

- [ ] **Step 5: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

- [ ] **Step 6: Confirm ogl is in its own chunk**

```bash
ls -la dist/assets/*.js
```

Expected: more than one JS file, with `ogl` in a chunk separate from the entry — that is what the lazy import buys. If it landed in the main bundle, the lazy import is not doing its job and the plan's performance claim is false. Report the sizes.

- [ ] **Step 7: Commit**

```bash
git add src/motion/ && git commit -m "feat: add the lazily loaded WebGL backdrop"
```

---

## Task 5: Animate the section headings

One change, seven sections.

**Files:**
- Modify: `src/components/layout/SectionShell.tsx`

- [ ] **Step 1: Replace the raw `<h2>` with `<Heading>`**

In `SectionShell.tsx`, swap the heading element:

```tsx
import Heading from '@/motion/Heading';
```

```tsx
        <Heading
          level={2}
          className="mt-3 font-display text-h2 font-bold tracking-[-0.02em] text-primary"
        >
          {title}
        </Heading>
```

- [ ] **Step 2: Run the tests**

Run: `npm test`
Expected: all 103 still pass.

`SectionShell.test.tsx` and `App.test.tsx` both assert on heading roles and accessible names. They must pass **unchanged** — if they do not, `<Heading>` is altering the accessible name, and that is a defect in the primitive rather than a reason to edit the tests. Report it instead of adjusting the assertions.

- [ ] **Step 3: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/SectionShell.tsx && git commit -m "feat: animate section headings through the Heading primitive"
```

---

## Task 6: Animate the hero

**Files:**
- Modify: `src/sections/Hero.tsx`
- Modify: `src/sections/sections.test.tsx`

- [ ] **Step 1: Extend the existing Hero test**

Add to the `Hero` describe block in `src/sections/sections.test.tsx`:

```tsx
  it('still exposes the name as the page h1 when animated', () => {
    render(<Hero />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveAccessibleName(profile.name);
  });

  it('announces one role at a time rather than all of them', () => {
    render(<Hero />);
    for (const role of profile.roles.slice(1)) {
      expect(screen.queryByText(role)).not.toBeInTheDocument();
    }
    expect(screen.getByText(profile.roles[0])).toBeInTheDocument();
  });

  it('keeps the stat values readable', () => {
    render(<Hero />);
    for (const stat of profile.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });
```

The second one guards a real failure mode: a rotating-text component that renders every phrase and hides the inactive ones visually still exposes all of them to a screen reader, which then reads four job titles in a row.

- [ ] **Step 2: Run it to confirm the new assertions fail**

Run: `npm test`
Expected: the first assertion may already pass; report which of the three fail and with what message.

- [ ] **Step 3: Rewrite `src/sections/Hero.tsx`**

Keep the existing layout, data bindings, `min-h-[100svh]`, image dimensions, and the `break-words` on the name. Change only what animates:

- Wrap the section content in `<Reveal>` from `@/motion/Reveal`, staggering the eyebrow, name, role, tagline, calls to action, and stats by 80ms each — spec §9.1 caps entrance animations at 700ms and staggers at 50–90ms.
- Render the name through `<Heading level={1}>`.
- Render `profile.roles` through the vendored `RotatingText`, and confirm only the visible role is in the accessibility tree.
- Render `profile.tagline` through `BlurText`.
- Render the "Open to work" eyebrow through `ShinyText` when `profile.openToWork` is true.
- Render each stat value through `CountUp`.
- Render the avatar inside `TiltedCard`.
- Place `<Backdrop />` as the first child of the section.
- Add `Noise` over the backdrop.

**Sections may not import React Bits directly** — ESLint enforces this and will fail the build. `RotatingText`, `BlurText`, `ShinyText`, `CountUp`, `TiltedCard` and `Noise` are used only by the hero, so add small wrappers in `src/motion/` for each, following the same shape as `Reveal`: read `useMotionAllowed()`, and render plain markup when motion is refused. Report the wrappers you added.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: all pass, including the three new assertions and every pre-existing Hero test unchanged.

- [ ] **Step 5: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

The ESLint boundary must pass without exception. If it fires, the fix is a wrapper in `src/motion/`, never an exception in the config.

- [ ] **Step 6: Commit**

```bash
git add src/sections/ src/motion/ && git commit -m "feat: animate the hero"
```

---

## Task 7: Verify in a browser

Unit tests cannot see a frame rate, a GPU context, or a stagger that runs too long.

**Files:** none — verification only.

- [ ] **Step 1: Build and serve**

```bash
npm run build && npx vite preview --port 4181 --strictPort
```

- [ ] **Step 2: Verify and report measurements**

1. **The entrance sequence reads as a sequence**, not everything at once, and is finished within about 1.2 seconds. Report the measured time from first paint to the last element settling.
2. **The WebGL context exists exactly once.** Count `canvas` elements and confirm `canvas.getContext('webgl2') || getContext('webgl')` is non-null on it.
3. **The canvas unmounts when the hero leaves the screen.** Scroll to the projects section, confirm no `canvas` remains in the DOM, scroll back, confirm it returns.
4. **Frame rate while scrolling** stays above 50fps on this machine. Report the measurement method and the number.
5. **`prefers-reduced-motion: reduce`** removes the canvas entirely, shows the gradient, and leaves every heading as a single text node rather than per-character spans.
6. **No horizontal overflow** at 320, 375, 768 and 1280.
7. **The hero's largest contentful paint is the name**, not the canvas.

The browser pane in this environment does not composite unless it is displayed, which freezes CSS transitions at their starting value and suppresses scroll events. That bit the plan-2 verification and produced two false bug reports. If measurements look impossible, check whether the page is compositing before concluding the code is wrong.

- [ ] **Step 3: Report findings before changing anything, then commit any fixes**

---

## Done When

- `npm test` passes, with each primitive covered under both motion settings.
- `npm run lint` passes, including the section import boundary, with no new exceptions.
- `npm run build` succeeds and `ogl` sits in a lazily loaded chunk, not the entry bundle.
- The hero animates in a staggered sequence within about 1.2 seconds.
- Exactly one WebGL context exists, and it is gone from the DOM once the hero is scrolled past.
- With reduced motion requested: no canvas, no per-character heading spans, and every piece of content still readable.
- No file under `src/sections/` imports from `src/components/reactbits/`.

## Not In This Plan

Animating About, Skills, Experience, Projects and Education. The project filter and modal, the certificate lightbox, the contact form, the node-rail navigation, and deployment.
