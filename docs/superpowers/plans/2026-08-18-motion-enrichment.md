# Motion Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between the eight effects spec §6 assigned and the six that were actually built, so the page stops spending its whole motion budget on the hero.

**Architecture:** Every effect arrives as a wrapper in `src/motion/`, never imported into a section directly — ESLint enforces that. Each wrapper makes exactly one decision the vendored component does not: whether motion is welcome, and whether anyone is looking. Three of these components run a permanent `requestAnimationFrame` loop, so "whether anyone is looking" is not a nicety here.

**Tech Stack:** Existing. `gsap` and `motion` are the only dependencies the seven new components need, and both are already installed. **No new npm packages.**

**Covers:** The seven effects spec §6 named but never built, plus `ScrollFloat`, which is vendored with zero importers.

**Reference:** `docs/superpowers/HANDOFF.md`, the design spec §6 and §8.3, and the contact-and-launch plan.

---

## The measurement that governs every task

**Lighthouse Performance is 85. The spec's threshold is 85.** There is no headroom, and the report already blames animation:

```
Avoid non-composited animations   18 animated elements found
Minimize main-thread work         7.6 s
Reduce JavaScript execution time  4.2 s
```

So every task here ends with a Lighthouse run on the production build, and a task that costs more than 2 points gets reconsidered rather than waved through. Bundle size is not the constraint — 179 KB of a 250 KB gzip budget is used, and all seven components together are under 34 KB of source.

Run it correctly or the number is meaningless: **`npm run preview`, port 4173, incognito, mobile**. A run against the dev server scored 27 and 34 on an artefact ten times heavier than production.

## What reading the source changed

All seven were read before this plan was written. Four findings changed what the tasks say.

**`ClickSpark` never stops its render loop.** The last line of `draw()` is an unconditional `requestAnimationFrame(draw)` — it clears the canvas and re-schedules itself sixty times a second forever, whether or not a spark exists. For an effect that fires on click, on a page with no performance headroom, that is the wrong trade. Task 5 edits it to idle when the spark list is empty and restart on click.

**`StarBorder` depends on utilities that do not exist here.** It renders `animate-star-movement-bottom` and `animate-star-movement-top`, and ships its Tailwind config commented out at the bottom of the file — in v3 syntax. This project is Tailwind v4, CSS-first. Without the keyframes the component renders two invisible blobs and nothing moves. Task 1 defines them.

**`GlassIcons` is a finished widget, not a piece.** It hardcodes a six-colour gradient map at 90% saturation — blue, purple, red, indigo, orange, green — against a palette that is amber and cyan on near-black. It also imposes its own layout, `grid gap-[5em] grid-cols-2 md:grid-cols-3 py-[3em]`, and requires `icon: React.ReactElement` while `Skill.icon` is a `string`. Adopting it on Skills would mean building an icon-component layer, overriding the palette, fighting the grid, **and losing the working skill-to-project cross-highlight**. This is the same objection that rejected `MagicBento` and `GlareHover`. Task 8 is written, because the effect was approved, but read its opening note before starting it.

**`CircularText` imposes its own size and colour**: `w-[200px] h-[200px] font-black text-white cursor-pointer` in the class list, before any className we pass. Like `SpotlightCard` and `SplitText` before it, it needs an edit rather than a prop.

Two more facts worth having: `ElectricBorder` is the heaviest of the seven at 339 lines and also runs a continuous rAF loop, and `TextType` uses `setInterval` rather than rAF, which is the cheapest scheduling of the group.

## Ordering

Tasks run cheapest-and-safest first, so that if the Lighthouse budget runs out the effects already landed are the ones worth keeping.

| # | Effect | Where | Loop | Risk |
|---|---|---|---|---|
| 1 | `StarBorder` | CV link, Send button | CSS only | low |
| 2 | `TextType` | Contact opening line | setInterval | low |
| 3 | `ScrollFloat` | section headings, or deleted | GSAP ScrollTrigger | low |
| 4 | `CurvedLoop` | footer | rAF, gated | medium |
| 5 | `ClickSpark` | Contact | rAF, **edited to idle** | medium |
| 6 | `CircularText` | Contact | Framer Motion | medium |
| 7 | `ElectricBorder` | current Experience role | rAF, heaviest | high |
| 8 | `GlassIcons` | Skills | none | **read the note** |
| 9 | Re-measure | — | — | — |

---

## File Structure

| File | Responsibility |
|---|---|
| `src/index.css` | The `star-movement` keyframes and their `--animate-*` theme keys |
| `src/components/reactbits/**` | Seven newly vendored components, owned and edited by this project |
| `src/motion/StarButton.tsx` | `StarBorder` wrapper — reduced-motion aware, keeps the button's own shape |
| `src/motion/Typed.tsx` | `TextType` wrapper — plain text when motion is refused |
| `src/motion/Heading.tsx` | Gains the scroll variant, or `ScrollFloat` is deleted |
| `src/motion/Marquee.tsx` | `CurvedLoop` wrapper — unmounts off screen |
| `src/motion/Sparks.tsx` | `ClickSpark` wrapper |
| `src/motion/CircularBadge.tsx` | `CircularText` wrapper |
| `src/motion/LiveBorder.tsx` | `ElectricBorder` wrapper — unmounts off screen |
| `src/motion/IconGrid.tsx` | `GlassIcons` wrapper, if Task 8 proceeds |

Every wrapper follows the shape `Reveal` and `Backdrop` already established: read `useMotionAllowed()`, return the plain thing when motion is refused, and never let a section import React Bits.

---

## Task 1: Star border on the two primary calls to action

Spec §6 assigns `StarBorder` to the CV button and to Contact. It is the cheapest of the seven — one CSS animation, no JavaScript loop — and it marks the two controls that matter most.

**Files:**
- Create: `src/components/reactbits/StarBorder/StarBorder.tsx`
- Modify: `src/index.css`
- Create: `src/motion/StarButton.tsx`
- Create: `src/motion/StarButton.test.tsx`
- Modify: `src/nav/Navbar.tsx`
- Modify: `src/components/ui/ContactForm.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/StarBorder/StarBorder.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Animations/StarBorder/StarBorder.tsx
```

Then delete the commented-out `tailwind.config.js` block at the bottom of the file — it is v3 syntax and this project is v4, so leaving it is an instruction that would mislead the next reader. Replace it with:

```tsx
// The animate-star-movement-* utilities this renders are defined in
// src/index.css, as @keyframes plus --animate-* theme keys. Tailwind v4 is
// CSS-first; the config block that shipped with this file was v3 and is gone.
```

- [ ] **Step 2: Define the keyframes**

Tailwind v4 turns a `--animate-<name>` theme key into an `animate-<name>` utility. Add to `src/index.css` inside the existing `@theme` block, after the `--text-*` keys:

```css
  --animate-star-movement-bottom: star-movement-bottom linear infinite alternate;
  --animate-star-movement-top: star-movement-top linear infinite alternate;
```

and after the `@theme` block, at the top level:

```css
/* StarBorder renders these two utilities and shipped its config as Tailwind v3
   JavaScript. Without them it renders two motionless invisible blobs. */
@keyframes star-movement-bottom {
  0% {
    transform: translate(0%, 0%);
    opacity: 1;
  }
  100% {
    transform: translate(-100%, 0%);
    opacity: 0;
  }
}

@keyframes star-movement-top {
  0% {
    transform: translate(0%, 0%);
    opacity: 1;
  }
  100% {
    transform: translate(100%, 0%);
    opacity: 0;
  }
}
```

The duration is not set here on purpose — `StarBorder` writes `animationDuration` as an inline style from its `speed` prop.

- [ ] **Step 3: Write the failing test**

Create `src/motion/StarButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import StarButton from './StarButton';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('StarButton', () => {
  it('renders an anchor that still works as a link', () => {
    setMotion(true);
    render(
      <StarButton as="a" href="/cv.pdf">
        CV
      </StarButton>,
    );

    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv.pdf');
  });

  it('renders a button that still submits', () => {
    setMotion(true);
    render(
      <StarButton as="button" type="submit">
        Send message
      </StarButton>,
    );

    expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('type', 'submit');
  });

  it('drops the moving parts entirely under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <StarButton as="button" type="button">
        Send message
      </StarButton>,
    );

    // The two travelling gradients are decoration with no still equivalent —
    // a stopped one is just a stray blob behind the label.
    expect(container.querySelector('.animate-star-movement-top')).toBeNull();
    expect(container.querySelector('.animate-star-movement-bottom')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('keeps the caller in charge of the shape', () => {
    setMotion(true);
    render(
      <StarButton as="button" type="button" className="rounded-full px-6">
        Send message
      </StarButton>,
    );

    expect(screen.getByRole('button')).toHaveClass('rounded-full');
  });
});
```

- [ ] **Step 4: Run it and watch it fail**

```bash
npx vitest run src/motion/StarButton.test.tsx
```

Expected: FAIL — `Failed to resolve import "./StarButton"`.

- [ ] **Step 5: Write the wrapper**

Create `src/motion/StarButton.tsx`. Note the shape: under reduced motion the control renders bare, because a star border that does not travel is not a quieter version of the effect — it is two stray gradients sitting behind the label.

```tsx
import type { ReactNode } from 'react';

import StarBorder from '@/components/reactbits/StarBorder/StarBorder';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface StarButtonProps {
  as: 'a' | 'button';
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  download?: boolean;
  onClick?: () => void;
}

/**
 * A travelling highlight around the page's two primary calls to action.
 *
 * StarBorder hardcodes `rounded-[20px]` on its own wrapper, so the control it
 * wraps keeps its own radius through `className` and the two never have to
 * agree — the wrapper is the track, the child is the button.
 */
export default function StarButton({
  as,
  children,
  className,
  href,
  type,
  download,
  onClick,
}: StarButtonProps) {
  const { animate } = useMotionAllowed();

  const control =
    as === 'a' ? (
      <a href={href} download={download} onClick={onClick} className={className}>
        {children}
      </a>
    ) : (
      <button type={type ?? 'button'} onClick={onClick} className={className}>
        {children}
      </button>
    );

  if (!animate) return control;

  return (
    <StarBorder as="span" color="var(--color-accent)" speed="4s" thickness={1}>
      {control}
    </StarBorder>
  );
}
```

- [ ] **Step 6: Run it and watch it pass**

```bash
npx vitest run src/motion/StarButton.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 7: Use it on the two controls**

In `src/nav/Navbar.tsx`, replace the CV anchor with:

```tsx
            <StarButton
              as="a"
              href={profile.cvUrl}
              download
              className="inline-flex min-h-11 items-center rounded-full border border-accent px-4 text-sm font-semibold text-accent"
            >
              CV
            </StarButton>
```

and add `import StarButton from '@/motion/StarButton';` to its imports.

In `src/components/ui/ContactForm.tsx`, the submit button is disabled while sending, which `StarButton` does not forward — so keep the plain button when `status === 'sending'` and wrap it otherwise:

```tsx
          {status === 'sending' ? (
            <button
              type="submit"
              disabled
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-void opacity-60"
            >
              Sending…
            </button>
          ) : (
            <StarButton
              as="button"
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-void"
            >
              Send message
            </StarButton>
          )}
```

and add `import StarButton from '@/motion/StarButton';`.

- [ ] **Step 8: Run the whole suite**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

Expected: all four exit 0. The existing `ContactForm` tests query the submit button by role and name, so they should be unaffected; if one breaks it is because the button moved inside a wrapper, which is a test that was asserting on structure rather than behaviour.

- [ ] **Step 9: Look at it, and prove the keyframes exist**

```bash
npm run dev
```

In the console:

```js
const probe = document.createElement('div');
probe.className = 'animate-star-movement-top';
document.body.appendChild(probe);
console.log(getComputedStyle(probe).animationName);
probe.remove();
```

Expected: `star-movement-top`, not `none`. `none` means Tailwind did not generate the utility and the effect is invisible — which is exactly how this would ship broken with a green suite.

Then look at the CV button and the Send button: a highlight should travel around each. Check the button's own radius is intact and that the wrapper has not stretched it to full width.

- [ ] **Step 10: Measure**

Build, preview, Lighthouse mobile in incognito against `http://localhost:4173`. Record Performance. It should not move — this task adds no JavaScript loop.

```bash
npm run build && npm run preview -- --port 4173
```

- [ ] **Step 11: Commit**

```bash
git add src/components/reactbits/StarBorder src/motion/StarButton.tsx src/motion/StarButton.test.tsx src/index.css src/nav/Navbar.tsx src/components/ui/ContactForm.tsx
git commit -m "feat: add a travelling star border to the primary calls to action"
```

---

## Task 2: A typed opening line in Contact

Spec §6 assigns `TextType` to Contact. It is the section a recruiter reads last and the quietest one on the page. `TextType` schedules with `setInterval`, which is the cheapest of the seven.

**Files:**
- Create: `src/components/reactbits/TextType/TextType.tsx`
- Create: `src/motion/Typed.tsx`
- Create: `src/motion/Typed.test.tsx`
- Modify: `src/sections/Contact.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/TextType/TextType.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/TextAnimations/TextType/TextType.tsx
```

- [ ] **Step 2: Write the failing test**

Create `src/motion/Typed.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Typed from './Typed';

const LINE = 'The fastest way to reach me is email.';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Typed', () => {
  it('renders the whole sentence immediately under reduced motion', () => {
    setMotion(false);
    render(<Typed text={LINE} />);
    expect(screen.getByText(LINE)).toBeInTheDocument();
  });

  it('shows no blinking cursor under reduced motion', () => {
    setMotion(false);
    const { container } = render(<Typed text={LINE} />);
    expect(container.textContent).toBe(LINE);
  });

  it('renders as a paragraph so it can carry body copy', () => {
    setMotion(false);
    const { container } = render(<Typed text={LINE} className="text-muted" />);
    expect(container.querySelector('p')).toHaveClass('text-muted');
  });
});
```

The reduced-motion case is the one worth testing hard: a sentence that types itself is unreadable to someone who asked for stillness, and it must arrive whole, not fast.

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/motion/Typed.test.tsx
```

Expected: FAIL — `Failed to resolve import "./Typed"`.

- [ ] **Step 4: Write the wrapper**

Create `src/motion/Typed.tsx`:

```tsx
import TextType from '@/components/reactbits/TextType/TextType';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface TypedProps {
  text: string;
  className?: string;
}

/**
 * A line that types itself once, when it comes into view.
 *
 * Under reduced motion it is an ordinary paragraph. Typing is not decoration
 * that can be sped up — until it finishes, the sentence is not there to read.
 *
 * `loop` is off deliberately: a sentence that erases and retypes itself while
 * someone is trying to read it is worse than no effect at all.
 */
export default function Typed({ text, className }: TypedProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <p className={className}>{text}</p>;

  return (
    <TextType
      as="p"
      text={text}
      className={className}
      typingSpeed={18}
      initialDelay={200}
      loop={false}
      showCursor
      cursorCharacter="_"
      startOnVisible
    />
  );
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run src/motion/Typed.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Use it in Contact**

In `src/sections/Contact.tsx`, replace the opening paragraph with:

```tsx
            <Typed
              text="The fastest way to reach me is email. I read everything and reply to anything specific."
              className="max-w-[48ch] text-muted"
            />
```

Add `import Typed from '@/motion/Typed';`. Keep the second sentence about the address as a plain `<p>` beneath it — one typed line is an effect, two is a gimmick.

- [ ] **Step 7: Run everything**

```bash
npm test && npm run lint && npx tsc --noEmit
```

Expected: all three exit 0. `src/sections/contact.test.tsx` asserts on the form and the links, not this paragraph, so it should be unaffected.

- [ ] **Step 8: Look at it**

Scroll to Contact in `npm run dev`. The line should begin typing when the section arrives, not on page load — that is what `startOnVisible` buys, and it matters because the section is six screens down. Confirm it types once and stops.

- [ ] **Step 9: Measure and commit**

Lighthouse as in Task 1. Then:

```bash
git add src/components/reactbits/TextType src/motion/Typed.tsx src/motion/Typed.test.tsx src/sections/Contact.tsx
git commit -m "feat: type the contact section's opening line"
```

---

## Task 3: Decide what `ScrollFloat` is for, or delete it

`ScrollFloat` is vendored with **zero importers**. It is dead code that lints, ships in no bundle, and misleads anyone reading `src/components/reactbits/`.

**Read this before choosing.** Spec §3.2 planned `Heading` as "SplitText (mount) / ScrollFloat (scroll)". That plan was written before the components were read. They have since been read, and they overlap:

- `SplitText` already registers a `ScrollTrigger` with `once: true`. Section headings **already animate when scrolled into view** — the job §3.2 gave `ScrollFloat`.
- `ScrollFloat` differs in kind, not in timing: it takes `scrollStart` and `scrollEnd` and ties the animation to scroll position rather than firing once.

So this is not "wire up the missing half". It is a choice between two heading languages, and spec §8.3 forbids running both.

**Recommendation: delete it.** The effect §3.2 wanted is already on the page, and a second `ScrollTrigger` per heading doubles the count for a difference most readers will not name.

**Files:**
- Delete: `src/components/reactbits/ScrollFloat/`

- [ ] **Step 1: Confirm it is genuinely unused**

```bash
grep -rn "ScrollFloat" src --include=*.ts --include=*.tsx | grep -v "components/reactbits/ScrollFloat"
```

Expected: no output. Any output means it is used and this task is wrong — stop and re-read.

- [ ] **Step 2: See the heading animation that already exists**

```bash
npm run dev
```

Scroll slowly to About, Skills and Projects. Each heading should animate in per character as it arrives. That is `SplitText`'s ScrollTrigger, and it is what `ScrollFloat` was going to be added to provide.

**If that animation is missing or fires on page load rather than on arrival**, this recommendation is wrong — `ScrollFloat` has a real job and should be wired into `Heading` for levels 2 and 3 instead. Say so and stop rather than deleting it.

- [ ] **Step 3: Delete it**

```bash
rm -rf src/components/reactbits/ScrollFloat
```

- [ ] **Step 4: Confirm nothing moved**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

Expected: all four exit 0, and the same test count as before — nothing referenced it.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/reactbits
git commit -m "chore: remove ScrollFloat, which SplitText already covers

SplitText registers a ScrollTrigger with once:true, so section headings
already animate on arrival — the job spec 3.2 assigned to ScrollFloat
before either component had been read. Keeping both would put two
heading languages on one page, which 8.3 rules out."
```

---

## Task 4: A marquee in the footer

The footer is one line of muted text. It is the sparsest thing on the page and the easiest to improve, and being below the fold it cannot touch LCP.

`CurvedLoop` runs a continuous `requestAnimationFrame` loop, so the wrapper unmounts it when it is off screen — the same treatment `Backdrop` and `Grain` already get, for the same reason.

**Files:**
- Create: `src/components/reactbits/CurvedLoop/CurvedLoop.tsx`
- Create: `src/motion/Marquee.tsx`
- Create: `src/motion/Marquee.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/CurvedLoop/CurvedLoop.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/TextAnimations/CurvedLoop/CurvedLoop.tsx
```

- [ ] **Step 2: Write the failing test**

Create `src/motion/Marquee.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { observers } from '@/test/stubs';
import Marquee from './Marquee';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Marquee', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('renders nothing at all under reduced motion', () => {
    setMotion(false);
    const { container } = render(<Marquee text="Open to work" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('keeps the words readable to a screen reader either way', () => {
    setMotion(false);
    render(<Marquee text="Open to work" />);
    expect(screen.getByText(/open to work/i)).toBeInTheDocument();
  });

  it('stops running once it scrolls out of view', async () => {
    setMotion(true);
    render(<Marquee text="Open to work" />);

    const record = observers.at(-1);
    if (!record) throw new Error('Marquee registered no IntersectionObserver');
    const target = [...record.targets][0];

    record.emit([{ target, isIntersecting: false, intersectionRatio: 0 }]);

    // A hidden marquee keeps its rAF loop running, so this has to leave the
    // DOM rather than merely be hidden.
    expect(document.querySelector('svg')).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/motion/Marquee.test.tsx
```

Expected: FAIL — `Failed to resolve import "./Marquee"`.

- [ ] **Step 4: Write the wrapper**

Create `src/motion/Marquee.tsx`:

```tsx
import { useRef } from 'react';

import CurvedLoop from '@/components/reactbits/CurvedLoop/CurvedLoop';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

interface MarqueeProps {
  text: string;
}

/**
 * A line of text running along a curve, for the foot of the page.
 *
 * CurvedLoop drives itself from requestAnimationFrame and never idles, so this
 * unmounts it once it is off screen rather than hiding it — the same reason
 * Backdrop and Grain unmount. A marquee scrolling six screens above the reader
 * is work nobody asked for.
 *
 * The words are always present as ordinary text for assistive technology,
 * because an SVG path of glyphs is decoration, not content.
 */
export default function Marquee({ text }: MarqueeProps) {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  return (
    <div ref={host}>
      <span className="sr-only">{text}</span>

      {animate && onScreen && (
        <div aria-hidden="true">
          <CurvedLoop
            marqueeText={`${text} ✦ `}
            speed={1}
            curveAmount={120}
            direction="left"
            interactive={false}
            className="fill-edge font-display text-[6rem] font-extrabold"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run src/motion/Marquee.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Use it in the footer**

In `src/App.tsx`, put it above the existing copyright line, inside the `<footer>`:

```tsx
      <footer className="overflow-hidden border-t border-edge py-10">
        <Marquee text={`${profile.name} — ${profile.roles[0]}`} />

        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
```

`overflow-hidden` on the footer is load-bearing: the marquee is wider than the viewport by design, and without it the whole document scrolls sideways. This project has already shipped that bug once, with the grain canvas.

Add `import Marquee from '@/motion/Marquee';`.

- [ ] **Step 7: Run everything**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

- [ ] **Step 8: Check for the overflow it is most likely to cause**

```bash
npm run dev
```

At 320, 375, 768 and 1440, in the console:

```js
console.log(document.documentElement.scrollWidth - document.documentElement.clientWidth);
```

Expected: `0` at every width. Anything above zero means the `overflow-hidden` is missing or on the wrong element.

Then scroll to the bottom and watch the text travel along the curve. Scroll back up and confirm — in the Elements panel — that the `<svg>` leaves the DOM.

- [ ] **Step 9: Measure and commit**

Lighthouse as in Task 1. This is the first task that adds a render loop, so compare Performance against the number Task 2 recorded.

```bash
git add src/components/reactbits/CurvedLoop src/motion/Marquee.tsx src/motion/Marquee.test.tsx src/App.tsx
git commit -m "feat: run a curved marquee across the footer"
```

---

## Task 5: Click sparks in Contact, with the render loop fixed

Spec §6 assigns `ClickSpark` to Contact. It rewards the click on the one control the whole page is pointing at.

**It ships with a permanent render loop and must be edited before use.** The last statement of `draw()` is an unconditional `requestAnimationFrame(draw)`: the canvas is cleared and redrawn sixty times a second forever, with or without a spark on screen. That is a constant main-thread cost for an effect that only exists during the half-second after a click.

**Files:**
- Create: `src/components/reactbits/ClickSpark/ClickSpark.tsx`
- Create: `src/motion/Sparks.tsx`
- Create: `src/motion/Sparks.test.tsx`
- Modify: `src/sections/Contact.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/ClickSpark/ClickSpark.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Animations/ClickSpark/ClickSpark.tsx
```

- [ ] **Step 2: Make the loop idle**

In `ClickSpark.tsx`, the effect ends with `draw` re-scheduling itself unconditionally. Replace the tail of `draw` and the initial schedule so the loop stops when there is nothing to draw. Find:

```tsx
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
```

and replace with:

```tsx
      // Idle instead of spinning. Upstream re-schedules unconditionally, which
      // costs a cleared canvas and a frame sixty times a second for an effect
      // that only exists for `duration` after a click. startLoop() is called
      // again from the click handler.
      if (sparksRef.current.length > 0) {
        animationId = requestAnimationFrame(draw);
      } else {
        animationId = 0;
      }
    };

    startLoopRef.current = () => {
      if (animationId === 0) animationId = requestAnimationFrame(draw);
    };
```

Add the ref near the other refs at the top of the component:

```tsx
  const startLoopRef = useRef<() => void>(() => {});
```

and call it at the end of `handleClick`, after the new sparks are pushed:

```tsx
    startLoopRef.current();
```

Finally, make the cleanup tolerate an id of `0`:

```tsx
    return () => {
      if (animationId !== 0) cancelAnimationFrame(animationId);
    };
```

- [ ] **Step 3: Write the failing test**

Create `src/motion/Sparks.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Sparks from './Sparks';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Sparks', () => {
  it('always renders whatever it wraps', () => {
    setMotion(false);
    render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('adds no canvas under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('adds a canvas when motion is welcome', () => {
    setMotion(true);
    const { container } = render(
      <Sparks>
        <button type="button">Send message</button>
      </Sparks>,
    );
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
```

- [ ] **Step 4: Run it and watch it fail**

```bash
npx vitest run src/motion/Sparks.test.tsx
```

Expected: FAIL — `Failed to resolve import "./Sparks"`.

- [ ] **Step 5: Write the wrapper**

Create `src/motion/Sparks.tsx`:

```tsx
import type { ReactNode } from 'react';

import ClickSpark from '@/components/reactbits/ClickSpark/ClickSpark';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface SparksProps {
  children: ReactNode;
}

/**
 * A burst at the point of a click, over whatever it wraps.
 *
 * The vendored component was edited to stop its render loop when no spark is
 * alive; upstream it re-schedules forever. Without that edit this would cost a
 * frame sixty times a second for an effect lasting 400ms.
 */
export default function Sparks({ children }: SparksProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <>{children}</>;

  return (
    <ClickSpark
      sparkColor="var(--color-accent)"
      sparkSize={8}
      sparkRadius={18}
      sparkCount={8}
      duration={400}
      easing="ease-out"
    >
      {children}
    </ClickSpark>
  );
}
```

- [ ] **Step 6: Run it and watch it pass**

```bash
npx vitest run src/motion/Sparks.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Use it in Contact**

Wrap the whole Contact grid in `src/sections/Contact.tsx`, so a click anywhere in the section sparks rather than only on the button:

```tsx
      <Sparks>
        <div className="grid gap-12 lg:grid-cols-2">
          …
        </div>
      </Sparks>
```

Add `import Sparks from '@/motion/Sparks';`.

- [ ] **Step 8: Prove the loop actually idles**

This is the point of the task, and no test can see it. In `npm run dev`, open Contact and run:

```js
let frames = 0;
const count = () => { frames++; requestAnimationFrame(count); };
requestAnimationFrame(count);
setTimeout(() => console.log('frames in 2s while idle:', frames), 2000);
```

That counts your own loop, so it will be roughly 120. Now use the Performance panel instead: record two seconds with the pointer still over Contact, and confirm there is **no repeating scripting task every 16ms**. Then click and record again — a short burst should appear and stop.

If the idle recording shows steady 60fps scripting, the Step 2 edit did not take, and this effect is not worth shipping without it.

- [ ] **Step 9: Run everything, measure, commit**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

Lighthouse as in Task 1.

```bash
git add src/components/reactbits/ClickSpark src/motion/Sparks.tsx src/motion/Sparks.test.tsx src/sections/Contact.tsx
git commit -m "feat: spark on click in the contact section

The vendored component re-scheduled its render loop unconditionally,
costing a frame sixty times a second for an effect that lasts 400ms. It
now idles when no spark is alive and restarts from the click handler."
```

---

## Task 6: A circular badge in Contact

Spec §6 assigns `CircularText` to Contact. It reads as a stamp beside the email address rather than as a decoration floating on its own.

**It hardcodes its own size and colour** — `w-[200px] h-[200px] font-black text-white cursor-pointer` sits in its class list ahead of anything passed in, the same problem `SpotlightCard` had with `bg-neutral-900`. Strip those rather than fight them with a prop.

**Files:**
- Create: `src/components/reactbits/CircularText/CircularText.tsx`
- Create: `src/motion/CircularBadge.tsx`
- Create: `src/motion/CircularBadge.test.tsx`
- Modify: `src/sections/Contact.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/CircularText/CircularText.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/TextAnimations/CircularText/CircularText.tsx
```

- [ ] **Step 2: Strip the appearance it imposes**

Find the root class list:

```tsx
      className={`m-0 mx-auto rounded-full w-[200px] h-[200px] relative font-black text-white text-center cursor-pointer origin-center ${className}`}
```

Replace it with the structural classes only, so size, weight and colour come from the caller:

```tsx
      // Size, weight and colour stripped: they were hardcoded ahead of
      // className and collided with the design tokens, exactly as
      // SpotlightCard's bg-neutral-900 did. What is left is structural.
      className={`relative m-0 mx-auto rounded-full text-center origin-center ${className}`}
```

Also remove `cursor-pointer` — it is not a control, and a pointer cursor over text that does nothing is a lie about affordance.

- [ ] **Step 3: Write the failing test**

Create `src/motion/CircularBadge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import CircularBadge from './CircularBadge';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('CircularBadge', () => {
  it('renders nothing under reduced motion', () => {
    setMotion(false);
    const { container } = render(<CircularBadge text="Open to work · " />);
    expect(container.firstChild).toBeNull();
  });

  it('is hidden from assistive technology, because it is decoration', () => {
    setMotion(true);
    const { container } = render(<CircularBadge text="Open to work · " />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('says nothing a reader needs, so nothing is announced', () => {
    setMotion(true);
    render(<CircularBadge text="Open to work · " />);
    expect(screen.queryByText(/open to work/i)).toBeNull();
  });
});
```

The third test looks odd and is deliberate. The text is split into one absolutely positioned `<span>` per character; a screen reader would read it letter by letter, which is worse than silence. `aria-hidden` is the correct answer and the test locks it in.

- [ ] **Step 4: Run it and watch it fail**

```bash
npx vitest run src/motion/CircularBadge.test.tsx
```

Expected: FAIL — `Failed to resolve import "./CircularBadge"`.

- [ ] **Step 5: Write the wrapper**

Create `src/motion/CircularBadge.tsx`:

```tsx
import CircularText from '@/components/reactbits/CircularText/CircularText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface CircularBadgeProps {
  text: string;
}

/**
 * A ring of rotating text, used as a stamp.
 *
 * It renders one absolutely positioned span per character, which a screen
 * reader would announce letter by letter — so it is aria-hidden, and anything
 * it appears to say must also be said in real text nearby.
 *
 * A still ring is just a circle of cramped letters, so under reduced motion it
 * renders nothing rather than a stopped version of itself.
 */
export default function CircularBadge({ text }: CircularBadgeProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <CircularText
        text={text}
        spinDuration={24}
        onHover="slowDown"
        className="h-32 w-32 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted"
      />
    </div>
  );
}
```

- [ ] **Step 6: Run it and watch it pass, then use it**

```bash
npx vitest run src/motion/CircularBadge.test.tsx
```

Expected: PASS, 3 tests.

In `src/sections/Contact.tsx`, place it beneath the social links in the left column, only from `lg` up — at narrow widths it competes with the form for vertical space:

```tsx
            <div className="mt-10 hidden lg:block">
              <CircularBadge text={`${profile.location} · Open to work · `} />
            </div>
```

Add `import CircularBadge from '@/motion/CircularBadge';`. The same facts already appear as real text in the hero status line, so hiding this from assistive technology loses nothing.

- [ ] **Step 7: Run everything, look, measure, commit**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

In the browser, check the ring is 128px, uses the muted token rather than white, shows no pointer cursor, and slows when hovered. Lighthouse as in Task 1.

```bash
git add src/components/reactbits/CircularText src/motion/CircularBadge.tsx src/motion/CircularBadge.test.tsx src/sections/Contact.tsx
git commit -m "feat: add a rotating badge to the contact section"
```

---

## Task 7: An electric border on the current role

Spec §6 assigns `ElectricBorder` to the most recent Experience item. It earns its place by pointing at the one entry a recruiter should read first.

**This is the heaviest of the seven** — 339 lines, and a `requestAnimationFrame` loop plus a `ResizeObserver`. Exactly one item on the page gets it, and the wrapper unmounts it off screen.

**Files:**
- Create: `src/components/reactbits/ElectricBorder/ElectricBorder.tsx`
- Create: `src/motion/LiveBorder.tsx`
- Create: `src/motion/LiveBorder.test.tsx`
- Modify: `src/sections/Experience.tsx`

- [ ] **Step 1: Vendor the component**

```bash
curl -s -o src/components/reactbits/ElectricBorder/ElectricBorder.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Animations/ElectricBorder/ElectricBorder.tsx
```

- [ ] **Step 2: Write the failing test**

Create `src/motion/LiveBorder.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { observers } from '@/test/stubs';
import LiveBorder from './LiveBorder';

function setMotion(animate: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('LiveBorder', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('always renders its content', () => {
    setMotion(false);
    render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );
    expect(screen.getByText('Research Engineer')).toBeInTheDocument();
  });

  it('adds no canvas under reduced motion', () => {
    setMotion(false);
    const { container } = render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('drops the border once it scrolls out of view but keeps the content', () => {
    setMotion(true);
    render(
      <LiveBorder>
        <p>Research Engineer</p>
      </LiveBorder>,
    );

    const record = observers.at(-1);
    if (!record) throw new Error('LiveBorder registered no IntersectionObserver');
    record.emit([
      { target: [...record.targets][0], isIntersecting: false, intersectionRatio: 0 },
    ]);

    expect(document.querySelector('canvas')).toBeNull();
    expect(screen.getByText('Research Engineer')).toBeInTheDocument();
  });
});
```

The third assertion is the one that matters: dropping the effect must never drop the entry.

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/motion/LiveBorder.test.tsx
```

Expected: FAIL — `Failed to resolve import "./LiveBorder"`.

- [ ] **Step 4: Write the wrapper**

Create `src/motion/LiveBorder.tsx`:

```tsx
import { useRef, type ReactNode } from 'react';

import ElectricBorder from '@/components/reactbits/ElectricBorder/ElectricBorder';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { useOnScreen } from '@/hooks/useOnScreen';

interface LiveBorderProps {
  children: ReactNode;
  className?: string;
}

/**
 * A moving border, for the single item that should be read first.
 *
 * The heaviest component on the page after the starfield: a render loop and a
 * ResizeObserver for one card. It unmounts off screen, and the content is
 * rendered outside the conditional so losing the effect can never lose the
 * entry.
 */
export default function LiveBorder({ children, className }: LiveBorderProps) {
  const { animate } = useMotionAllowed();
  const host = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(host);

  if (!animate) {
    return (
      <div ref={host} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={host} className={className}>
      {onScreen ? (
        <ElectricBorder color="var(--color-accent-2)" speed={0.6} chaos={0.4} borderRadius={12}>
          {children}
        </ElectricBorder>
      ) : (
        children
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run src/motion/LiveBorder.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Use it on the current role only**

In `src/sections/Experience.tsx`, the entry with `endDate === 'present'` is the one. The data invariant already guarantees at most one such entry, so this cannot light up two cards:

```tsx
          {experiences.map((e) => {
            const card = ( /* the existing <Surface> … </Surface> for this item */ );
            return (
              <Reveal key={e.id}>
                {e.endDate === 'present' ? <LiveBorder>{card}</LiveBorder> : card}
              </Reveal>
            );
          })}
```

Add `import LiveBorder from '@/motion/LiveBorder';`. Keep the timeline dot outside `Reveal` as it already is — a transformed ancestor becomes the containing block for absolutely positioned descendants, and that has bitten this section before.

- [ ] **Step 7: Run everything**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

- [ ] **Step 8: Measure, and be willing to drop this one**

Lighthouse as in Task 1. **This is the task most likely to cost real points.** Compare against what Task 6 recorded.

If Performance falls below 85, revert this task rather than trying to tune it: it decorates one card, and the spec threshold is not negotiable for an ornament. `git revert` the commit and record the number in the handoff so nobody tries again without knowing.

- [ ] **Step 9: Commit**

```bash
git add src/components/reactbits/ElectricBorder src/motion/LiveBorder.tsx src/motion/LiveBorder.test.tsx src/sections/Experience.tsx
git commit -m "feat: mark the current role with a moving border"
```

---

## Task 8: Glass icons — read this before starting

**This task is written because the effect was approved, but reading the source changed what it costs.** Decide before writing code.

Spec §6 assigns `GlassIcons` to "Skills + Contact". Three facts about the component:

1. **It imposes a full layout**: `grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em]`.
2. **It hardcodes a palette**: a six-colour gradient map at 90% saturation — blue, purple, red, indigo, orange, green — on a site whose palette is amber and cyan against near-black.
3. **It needs `icon: React.ReactElement`**, while `Skill.icon` and `SocialLink.icon` are both `string`, and **no icon library is installed**. Spec D1 lists `lucide-react`; it never made it into `package.json`.

**On Skills it also costs the cross-highlight.** `GlassIcons` renders its own `<button>` per item and accepts no handlers, so the skill-to-project highlight — which works, and is the most interesting interaction on the page — would have to be given up or the component edited to forward handlers.

**Recommendation: apply it to the Contact social links, not to Skills.** Spec §6 names Contact as a target too, nothing there is interactive beyond a link, and the cross-highlight survives untouched. The cost is one new dependency.

**If you would rather skip it entirely, skip it.** Six effects will have landed by this point and Skills is not one of the quiet sections.

**Files:**
- Modify: `package.json` (add `lucide-react`)
- Create: `src/components/reactbits/GlassIcons/GlassIcons.tsx`
- Create: `src/motion/IconGrid.tsx`
- Create: `src/motion/IconGrid.test.tsx`
- Modify: `src/sections/Contact.tsx`

- [ ] **Step 1: Check the version against the registry, then install**

Never pin from memory on this project — every version recalled in the first plan was wrong.

```bash
npm view lucide-react version
npm install lucide-react@<the version printed above>
```

- [ ] **Step 2: Vendor and de-style the component**

```bash
curl -s -o src/components/reactbits/GlassIcons/GlassIcons.tsx --create-dirs \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/GlassIcons/GlassIcons.tsx
```

Replace the `gradientMapping` object with the project's own two tokens, so an unknown colour falls through to a raw CSS value as before:

```tsx
// The upstream map was six 90%-saturation gradients that have nothing to do
// with this site's palette. These are the design tokens.
const gradientMapping: Record<string, string> = {
  accent: 'linear-gradient(var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))',
  cool: 'linear-gradient(var(--color-accent-2), color-mix(in srgb, var(--color-accent-2) 70%, black))',
};
```

And replace the imposed grid on the root element:

```tsx
    <div className={`flex flex-wrap gap-6 ${className || ''}`}>
```

`gap-[5em]` and `py-[3em]` are a showcase page's spacing, not a section's.

- [ ] **Step 3: Write the failing test**

Create `src/motion/IconGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import IconGrid from './IconGrid';

describe('IconGrid', () => {
  it('gives every item an accessible name', () => {
    render(
      <IconGrid
        items={[
          { icon: 'github', label: 'GitHub', url: 'https://github.com/example' },
          { icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/example' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
  });

  it('keeps every item a real link that opens the profile', () => {
    render(
      <IconGrid items={[{ icon: 'github', label: 'GitHub', url: 'https://github.com/example' }]} />,
    );

    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('falls back to a readable label when the icon name is unknown', () => {
    render(<IconGrid items={[{ icon: 'nonesuch', label: 'Mastodon', url: 'https://example.com' }]} />);
    expect(screen.getByRole('link', { name: 'Mastodon' })).toBeInTheDocument();
  });
});
```

Note what this asserts: **links, not buttons.** `GlassIcons` renders `<button>`, which cannot be middle-clicked, copied, or opened in a new tab. Social profiles must stay anchors, so `IconGrid` renders its own markup and borrows only the appearance.

- [ ] **Step 4: Run it and watch it fail**

```bash
npx vitest run src/motion/IconGrid.test.tsx
```

Expected: FAIL — `Failed to resolve import "./IconGrid"`.

- [ ] **Step 5: Write the wrapper**

Create `src/motion/IconGrid.tsx`:

```tsx
import { Github, Linkedin, Mail, type LucideIcon } from 'lucide-react';

interface IconGridItem {
  icon: string;
  label: string;
  url: string;
}

interface IconGridProps {
  items: IconGridItem[];
}

/** Data carries icon names as strings; this is the only place they become components. */
const ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
};

/**
 * The social links, as icon tiles.
 *
 * These are anchors, not the buttons GlassIcons renders. A profile link that
 * cannot be middle-clicked, copied or opened in a new tab is a worse link, and
 * no amount of glass is worth that — so this borrows the appearance and keeps
 * the semantics.
 *
 * An unknown icon name renders the label alone rather than an empty tile,
 * because the data can name an icon this file has never heard of.
 */
export default function IconGrid({ items }: IconGridProps) {
  return (
    <ul className="flex flex-wrap gap-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon];

        return (
          <li key={item.label}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-edge bg-surface px-4 text-sm text-muted transition-colors hover:border-accent hover:text-primary"
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 6: Run it and watch it pass**

```bash
npx vitest run src/motion/IconGrid.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Use it in Contact**

Replace the existing social `<ul>` in `src/sections/Contact.tsx` with:

```tsx
            <div className="mt-8">
              <IconGrid items={profile.socials} />
            </div>
```

Add `import IconGrid from '@/motion/IconGrid';`. The list keeps its accessible name through the existing `contact.test.tsx` assertions — check those still pass, and if the `aria-label="Social links"` was load-bearing, move it onto the `<ul>` inside `IconGrid`.

- [ ] **Step 8: Run everything, measure, commit**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

Check the bundle did not jump: `lucide-react` is tree-shakeable and three icons should cost under 2 KB gzip. If the initial chunk grows by more than that, the import is pulling the whole library and needs a per-icon path import instead.

```bash
git add package.json package-lock.json src/components/reactbits/GlassIcons src/motion/IconGrid.tsx src/motion/IconGrid.test.tsx src/sections/Contact.tsx
git commit -m "feat: render the social links as icon tiles"
```

---

## Task 9: Measure what all of it cost, and write it down

**Files:**
- Modify: `docs/superpowers/HANDOFF.md`

- [ ] **Step 1: Full verification**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

- [ ] **Step 2: Lighthouse, properly**

```bash
npm run preview -- --port 4173
```

Incognito, mobile, `http://localhost:4173`, no `#home` fragment. Record all four scores.

- [ ] **Step 3: The reduced-motion sweep, again**

Every task in this plan added something that must vanish when motion is refused. Turn Windows animation effects off, reload, and confirm in the console:

```js
console.log('canvases:', document.querySelectorAll('canvas').length);
```

Expected: `0`. The click sparks and the electric border both draw to canvas, so a non-zero count means a wrapper is missing its gate.

Then read the page top to bottom and confirm nothing is missing, only still: the star borders gone, the contact line whole rather than typing, the footer marquee absent, the badge absent.

- [ ] **Step 4: The width sweep**

At 320, 375, 768 and 1440: `document.documentElement.scrollWidth - document.documentElement.clientWidth` should be `0`. The footer marquee is the likely offender.

- [ ] **Step 5: Record it**

In `docs/superpowers/HANDOFF.md`, update the Lighthouse bullet with the new four scores and add a line naming which effects were built, which were skipped, and what each cost. If Performance dropped below 85, name the task that did it — the per-task measurements make that answerable rather than a guess.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/HANDOFF.md
git commit -m "docs: record what the motion enrichment cost"
```

---

## What this plan is trying not to do

Spec §8.3 forbids running two visual languages at once, and eight new effects is exactly how that rule gets broken by accident. Three guards:

- **One hover language.** `Surface`'s spotlight owns hover on cards. Nothing added here introduces a second hover treatment on the same element.
- **One WebGL surface.** `Galaxy` holds it. Nothing here is WebGL — which is why every one of the ~50 React Bits backgrounds was excluded.
- **One effect per job.** `ScrollFloat` is deleted rather than run alongside `SplitText` for the same headings.

And the measurement discipline: Performance was 85 with a threshold of 85 before any of this. Every task ends with a number, so that if the budget runs out it is obvious which effect spent it.
