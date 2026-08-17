# Sections and Cross-Highlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the remaining four sections to life through the primitives already built, and add the one interaction that turns the skills list from a set of claims into an index of evidence — hovering a skill highlights the projects that used it.

**Architecture:** Almost nothing new. `Reveal`, `Surface`, `Heading` and `Counter` already exist and already handle the reduced-motion decision; this plan mostly applies them. One small React Bits component is vendored, for the chip micro-interaction. The cross-highlight is custom, because no component models it: a tiny context holds the hovered skill, Skills writes to it, Projects reads from it.

**Tech Stack:** Existing. One new vendored component of ~2.4 KB and no new npm dependencies.

**Covers:** Spec phase 5 and the animation half of phase 7. The project filter, project modal, and certificate lightbox are the next plan — they share focus-management and keyboard concerns and are better done together than smeared across two plans.

**Reference:** `docs/superpowers/HANDOFF.md`, the design spec, and the three completed plans.

---

## What Already Exists

- All seven sections render from `src/data/`. Navigation, smooth scroll, the hero, and the WebGL backdrop are built. **119 tests pass across 15 files.**
- `src/motion/` exports `Reveal`, `Heading`, `Surface`, `Backdrop`, plus `RotatingRole`, `BlurIn`, `Shine`, `Counter`, `TiltImage`, `Grain`.
- `src/hooks/` exports `useMotionAllowed`, `useOnScreen`, `useActiveSection`, `useScrolledPast`, `useLenis`.
- `Surface` has no caller yet. It was built in plan 3 ahead of its first use; About and Skills are that use.
- `src/data/skills.ts` already carries `relatedProjectIds` on most skills, and an invariant already proves every one of them resolves to a real project.

## Three Spec Components Deliberately Not Used

Checked against the registry before writing this. All three were the spec's own choice, and all three fail on inspection for the same reason `PillNav` did — they are finished widgets rather than pieces.

**`MagicBento` (26.5 KB), the spec's choice A for the Skills grid.** It ships a particle system, spotlight, tilt, magnetism, a click ripple, its own colour props, and its own hardcoded demo content (`Analytics / Track user behavior / Insights`). Using it means deleting its content, replacing its colour system with the design tokens, and switching off half its effects — and its spotlight and tilt duplicate `Surface`, which would put two card hover languages on one page. Spec §8.3 forbids exactly that. The Skills grid stays our own markup wrapped in `Surface`.

**`ScrollReveal`, the spec's choice for the About bio.** It wraps every word in its own `<span>` with a ScrollTrigger. The bio is three paragraphs of up to 420 characters, so that is roughly two hundred elements and two hundred triggers. Spec §8.3 warns against precisely this — "ratusan elemen DOM, jank saat scroll" — while §7.2 assigns it here. The two passages contradict, and the performance warning is the one worth keeping. Bio paragraphs use `Reveal`, one per paragraph: three elements, not two hundred.

**`GlareHover`, the spec's card hover for About and Education.** It takes `width`, `height`, `background`, `borderRadius` and `borderColor` as props and writes them as inline styles, then renders `grid place-items-center cursor-pointer` — a standalone showcase tile that centres whatever you give it and claims to be clickable. Wrapping content cards in it means overriding all five appearance props and undoing the grid and the cursor, leaving only the sheen. And that sheen would be a *second* hover treatment on cards that already get a cursor spotlight from `Surface`, which is the same objection that rules out `MagicBento`. Cards keep one hover language.

Nothing is lost architecturally. `src/components/reactbits/` and the section import boundary stay exactly as they are.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/reactbits/Magnet/Magnet.tsx` | Vendored, ~2.4 KB, no dependencies |
| `src/motion/Chip.tsx` | A tag or pill that leans towards the cursor |
| `src/highlight/SkillHighlight.tsx` | Context holding the hovered skill, plus its hook |
| `src/sections/About.tsx` | Animated |
| `src/sections/Skills.tsx` | Animated, and the source of the cross-highlight |
| `src/sections/Experience.tsx` | Animated |
| `src/sections/Education.tsx` | Animated |
| `src/sections/Projects.tsx` | Reads the cross-highlight |
| `src/App.tsx` | Wraps the page in the highlight provider |

`src/highlight/` is its own directory rather than living in `src/motion/`: the cross-highlight is information, not decoration, and it must keep working when motion is refused.

---

## Task 1: Vendor Magnet

**Files:**
- Create: `src/components/reactbits/Magnet/Magnet.tsx`

- [ ] **Step 1: Fetch it**

```bash
npx jsrepo@3.8.1 add https://reactbits.dev/r/Magnet-TS-TW
```

If `jsrepo` prompts, writes outside `src/components/reactbits/`, or tries to install dependencies, abandon it and fetch the registry JSON directly — each response carries a `files` array of `path` and `content`:

```bash
curl -sS https://reactbits.dev/r/Magnet-TS-TW
```

It declares no npm dependency. If the tool tries to install one, something is wrong; stop and report.

- [ ] **Step 2: Read the file before wrapping it**

This is not optional and it is not a formality. In plan 3, `SplitText` turned out to render its own heading element and `BlurText` its own `<p>`, so wrapping either naively nests a heading inside a heading or a paragraph inside a paragraph. `SpotlightCard` turned out to hardcode `bg-neutral-900`, which collides with the design tokens in a way that resolves by stylesheet order rather than class order.

Report: what element it renders, whether it accepts `children`, whether it hardcodes any appearance, and its full prop list.

- [ ] **Step 3: Verify lint, types and build**

```bash
npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Vendored source routinely trips this project's rules — 16 `react-hooks` rules run at error level. Fix the file rather than weakening a rule, and report each change. If a rule is genuinely wrong about the code, a targeted `eslint-disable-next-line` with a written reason is acceptable; a blanket exemption is not.

- [ ] **Step 4: Commit**

```bash
git add src/components/reactbits/ && git commit -m "feat: vendor Magnet"
```

---

## Task 2: The `Chip` primitive

**Files:**
- Create: `src/motion/Chip.tsx`, `src/motion/Chip.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/motion/Chip.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import Chip from "./Chip";

function setMotion({ animate, hover = true }: { animate: boolean; hover?: boolean }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? !animate : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe("Chip", () => {
  it("renders its label whether or not motion is allowed", () => {
    setMotion({ animate: false });
    render(<Chip>TypeScript</Chip>);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("leans towards the cursor when motion and a pointer are both available", () => {
    setMotion({ animate: true, hover: true });
    const { container } = render(<Chip>TypeScript</Chip>);
    expect(container.querySelector("[data-magnet]")).not.toBeNull();
  });

  it("drops the attraction on a touch device, which has no cursor to follow", () => {
    setMotion({ animate: true, hover: false });
    const { container } = render(<Chip>TypeScript</Chip>);
    expect(container.querySelector("[data-magnet]")).toBeNull();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("keeps the shared pill styling on both paths", () => {
    for (const animate of [true, false]) {
      setMotion({ animate, hover: false });
      const { container, unmount } = render(<Chip>TypeScript</Chip>);
      expect(container.textContent).toBe("TypeScript");
      expect(container.innerHTML).toContain("rounded-full");
      unmount();
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./Chip"`. Report the exact message.

- [ ] **Step 3: Write `src/motion/Chip.tsx`**

```tsx
import type { ReactNode } from "react";

import Magnet from "@/components/reactbits/Magnet/Magnet";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

interface ChipProps {
  children: ReactNode;
  className?: string;
}

const BASE = "inline-block rounded-full border border-edge px-3 py-1 text-sm text-muted";

/**
 * A tag pill that leans towards the cursor.
 *
 * Skills, stacks and certificate badges all use this, so the pill styling lives
 * here rather than being retyped at four call sites where it would slowly drift
 * apart.
 *
 * The attraction needs a pointer that can hover as well as permission to
 * animate — on a touch screen it has nothing to follow — so a touch device gets
 * the plain pill and none of the wrapper markup.
 */
export default function Chip({ children, className }: ChipProps) {
  const { animate, hover } = useMotionAllowed();
  const classes = className ? `${BASE} ${className}` : BASE;

  if (!animate || !hover) return <span className={classes}>{children}</span>;

  return (
    <Magnet padding={30} magnetStrength={8} innerClassName={classes}>
      {children}
    </Magnet>
  );
}
```

`Magnet` accepts a `disabled` prop, which looks like the tidier way to express this. It is not: disabled or not, it still renders its wrapper divs, so the touch path would carry markup that exists only to do nothing. Branching keeps the plain path plain.

The test looks for `[data-magnet]` to tell the paths apart. Add that attribute to the vendored `Magnet` wrapper element — it is a file this project owns, `SpotlightCard` already carries `data-spotlight` for the same reason, and a test that cannot distinguish the branches is not testing anything.

- [ ] **Step 4: Run the tests, then verify lint, types and build**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Expected: 119 existing plus 4 new, so 123 total.

- [ ] **Step 5: Commit**

```bash
git add src/motion/ src/components/reactbits/ && git commit -m "feat: add the Chip interaction primitive"
```

---

## Task 3: Animate About

**Files:**
- Modify: `src/sections/About.tsx`
- Modify: `src/sections/sections.test.tsx`

- [ ] **Step 1: Extend the existing About test**

Add to the `About` describe block:

```tsx
  it('keeps every bio paragraph as one element, not one per word', () => {
    const { container } = render(<About />);
    for (const paragraph of profile.bio) {
      const match = [...container.querySelectorAll('p')].find(
        (p) => p.textContent?.replace(/ /g, ' ') === paragraph,
      );
      expect(match, 'a bio paragraph was split across elements').toBeDefined();
      expect(match!.childElementCount).toBe(0);
    }
  });
```

That assertion is the whole reason `ScrollReveal` was rejected. It fails the moment someone reaches for a word-splitting effect on prose.

- [ ] **Step 2: Run it to confirm it passes already**

Run: `npm test`
Expected: passes — the section is still static. It is a guard against a regression this plan could easily introduce, not a red test. Say so in your report rather than pretending it drove the change.

- [ ] **Step 3: Animate `About.tsx`**

Keep the layout, the data bindings, the image dimensions, and the `alt` text. Change only what animates:

- Wrap the photo column in `<Reveal>`.
- Wrap each bio paragraph in its own `<Reveal delay={0.08 * index}>`, so they arrive in reading order.
- Replace the quick-facts `<dl>` wrapper with `<Surface className="mt-8 grid gap-4 p-6 sm:grid-cols-2">`, dropping the `rounded-xl border border-edge bg-surface` classes it currently carries — `Surface` supplies those, and repeating them is how two card treatments start to diverge.

- [ ] **Step 4: Run the tests, then verify lint, types and build**

Every pre-existing About assertion must pass unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/sections/ && git commit -m "feat: animate the about section"
```

---

## Task 4: Animate Skills

**Files:**
- Modify: `src/sections/Skills.tsx`

- [ ] **Step 1: Animate**

- Wrap each category card in `<Reveal delay={0.06 * index}>` and replace its wrapper with `<Surface className="p-6">`.
- Render each skill through `<Chip>`, replacing the hand-written pill classes.
- Leave the `<h3>` category headings as they are — they are already correct, and `Heading` is for section titles.

There are still no percentage bars. Levels stay qualitative in the data and unrendered; a made-up "Python 85%" is the kind of thing an engineer reading this page discounts the whole section for.

- [ ] **Step 2: Run the tests, then verify lint, types and build**

The existing Skills test asserts every category name is an `h3` and every skill name is present. It must pass unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/sections/ && git commit -m "feat: animate the skills section"
```

---

## Task 5: The skill-to-project cross-highlight

The one genuinely novel interaction in the design, and the reason `relatedProjectIds` has been sitting in the data since plan 1 with an invariant guarding it.

**Files:**
- Create: `src/highlight/SkillHighlight.tsx`, `src/highlight/SkillHighlight.test.tsx`
- Modify: `src/sections/Skills.tsx`, `src/sections/Projects.tsx`, `src/App.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/highlight/SkillHighlight.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillHighlightProvider, useSkillHighlight } from './SkillHighlight';

function Source({ name, projects }: { name: string; projects: string[] }) {
  const { setActive, clear } = useSkillHighlight();
  return (
    <button
      onMouseEnter={() => setActive(name, projects)}
      onFocus={() => setActive(name, projects)}
      onMouseLeave={clear}
      onBlur={clear}
    >
      {name}
    </button>
  );
}

function Target({ id }: { id: string }) {
  const { isHighlighted, activeSkill } = useSkillHighlight();
  return (
    <div data-testid={id} data-highlighted={isHighlighted(id) ? 'true' : undefined}>
      {activeSkill ?? 'none'}
    </div>
  );
}

function setup() {
  return render(
    <SkillHighlightProvider>
      <Source name="Neo4j" projects={['kg-assistant']} />
      <Target id="kg-assistant" />
      <Target id="kos-finder" />
    </SkillHighlightProvider>,
  );
}

describe('SkillHighlight', () => {
  it('highlights nothing until a skill is active', () => {
    setup();
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
    expect(screen.getByTestId('kos-finder')).not.toHaveAttribute('data-highlighted');
  });

  it('highlights only the related project on hover', async () => {
    setup();
    await userEvent.hover(screen.getByRole('button', { name: 'Neo4j' }));

    expect(screen.getByTestId('kg-assistant')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByTestId('kos-finder')).not.toHaveAttribute('data-highlighted');
  });

  it('works from the keyboard, not just the mouse', async () => {
    setup();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Neo4j' })).toHaveFocus();
    expect(screen.getByTestId('kg-assistant')).toHaveAttribute('data-highlighted', 'true');
  });

  it('clears when the pointer leaves', async () => {
    setup();
    const chip = screen.getByRole('button', { name: 'Neo4j' });

    await userEvent.hover(chip);
    await userEvent.unhover(chip);

    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
  });

  it('reads as inert outside a provider rather than throwing', () => {
    render(<Target id="kg-assistant" />);
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
  });
});
```

The keyboard test is the one that matters. A hover-only implementation makes this feature invisible to anyone navigating by keyboard, which is most of the point of building it into an accessible page.

The last test keeps the sections renderable in isolation — every existing section test renders its component without a provider, and they must keep passing.

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — unresolved import. Report the exact message.

- [ ] **Step 3: Write `src/highlight/SkillHighlight.tsx`**

Export `SkillHighlightProvider`, and a `useSkillHighlight()` hook returning `{ activeSkill, setActive, clear, isHighlighted }`.

Two requirements that are easy to miss:

- **It must not read `useMotionAllowed`.** This is information, not decoration. Someone who asked for reduced motion still benefits from seeing which projects used a skill; what they asked to avoid is movement, and a colour change is not movement.
- **Outside a provider it must be inert, not fatal.** Default the context to a no-op value so a section rendered on its own — as every section test does — keeps working.

- [ ] **Step 4: Wire it up**

- `App.tsx` wraps `<main>` in `<SkillHighlightProvider>`.
- In `Skills.tsx`, each skill becomes focusable and reports itself: `onMouseEnter`/`onFocus` call `setActive(skill.name, skill.relatedProjectIds ?? [])`, `onMouseLeave`/`onBlur` call `clear`. A skill with no related projects should still be focusable but highlight nothing.
- In `Projects.tsx`, each card reads `isHighlighted(project.id)` and dims when something else is active — for example `opacity-40` on the non-matching cards rather than a ring on the matching one, so the page does not gain a new colour language.

**The highlight must not move anything.** Spec §7.3 requires no layout shift, so change opacity or border colour, never size, margin, or position. Verify it in the browser in Task 7 rather than assuming.

- [ ] **Step 5: Run the tests, then verify lint, types and build**

Expected: 123 existing plus 5 new, so 128 total. Every existing section test must pass unchanged, including the ones that render a section with no provider.

- [ ] **Step 6: Commit**

```bash
git add src/highlight/ src/sections/ src/App.tsx && git commit -m "feat: highlight related projects when a skill is focused"
```

---

## Task 6: Animate Experience and Education

**Files:**
- Modify: `src/sections/Experience.tsx`, `src/sections/Education.tsx`

- [ ] **Step 1: Animate Experience**

- Wrap each timeline `<li>` body in `<Reveal delay={0.06 * index}>`.
- Mark the entry with `endDate === 'present'` using the accent token on its timeline dot — `bg-accent` instead of `bg-edge`. No new component: `ElectricBorder` would be a second border language for one element.
- Keep the timeline one-sided at every width. The alternating pattern was considered and rejected in the spec for breaking at tablet widths.
- Render the stack tags through `<Chip>`.

- [ ] **Step 2: Animate Education**

- Wrap the degree card in `<Surface className="p-6">`, dropping the classes `Surface` supplies.
- Wrap each certificate card in `<Reveal delay={0.04 * index}>`.
- Render the certificate count through `<Counter>`; it currently renders as plain interpolated text.
- Render the skill badges through `<Chip>`.

A certificate with no `credentialUrl` must still render no link at all. Three of the fourteen have none, and an existing test counts them — it must pass unchanged.

- [ ] **Step 3: Run the tests, then verify lint, types and build**

- [ ] **Step 4: Commit**

```bash
git add src/sections/ && git commit -m "feat: animate the experience and education sections"
```

---

## Task 7: Verify in a browser

**Files:** none — verification only.

- [ ] **Step 1: Build and serve**

```bash
npm run build && npx vite preview --port 4186 --strictPort
```

- [ ] **Step 2: Verify and report measurements**

1. **The cross-highlight causes no layout shift.** Record every project card's `getBoundingClientRect()` before and during a highlight and confirm each is identical. This is the acceptance criterion most likely to be quietly violated.
2. **It works from the keyboard.** Tab to a skill and confirm the related project cards respond.
3. **It still works with reduced motion emulated**, since it is information rather than decoration.
4. **Sections stagger in rather than appearing at once**, and no section takes longer than about 700ms to settle.
5. **No horizontal overflow** at 320, 375, 768 and 1280.
6. **Card treatments are consistent** — every card on the page uses the same hover language. Count distinct hover treatments; the answer should be one.

The in-app browser pane does not composite unless displayed, which freezes CSS transitions and suppresses IntersectionObserver and scroll events. It produced three false bug reports across the earlier plans. Force an explicit viewport with `resize_window` before measuring anything, and check whether the page is compositing before concluding the code is wrong.

- [ ] **Step 3: Report findings before changing anything, then commit any fixes**

---

## Done When

- `npm test` passes, with the cross-highlight covered for mouse, keyboard, clearing, and the no-provider case.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.
- Every section animates in, and every card on the page shares one hover language.
- Hovering or focusing a skill highlights the projects that used it, with no layout shift.
- Bio paragraphs remain one element each.
- No file under `src/sections/` imports from `src/components/reactbits/`.

## Not In This Plan

The project category filter and detail modal, the certificate lightbox, the contact form, the node-rail navigation, accessibility and performance polish, and deployment.
