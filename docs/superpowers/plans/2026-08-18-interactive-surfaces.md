# Interactive Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a visitor filter the work by category, open a project to read the whole story, and enlarge a certificate to read it — each reachable and escapable from the keyboard alone.

**Architecture:** One `Dialog` primitive built on the native `<dialog>` element carries both the project modal and the certificate lightbox. `showModal()` gives the focus trap, the Escape handler, and an inert background for free; what the platform does not give — returning focus to whatever opened the dialog, and stopping the smooth-scroll engine behind it — the primitive adds. The filter is plain state over the existing data.

**Tech Stack:** Existing. No new dependencies and no new vendored components.

**Covers:** The interactive half of spec phases 6 and 7. The contact form, the node-rail navigation, accessibility and performance polish, and deployment are the last plan.

**Reference:** `docs/superpowers/HANDOFF.md`, the design spec, and the four completed plans.

---

## What Already Exists

- Every section renders and animates. The skill-to-project cross-highlight works. **143 tests pass across 18 files.**
- `src/motion/` exports `Reveal`, `Heading`, `Surface`, `Backdrop`, `Chip`, `Counter`, and the hero wrappers.
- `src/hooks/useLenis.ts` owns the smooth-scroll instance but currently exposes only `scrollTo`.
- `src/test/stubs.ts` already stubs `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollIntoView` and `document.fonts`, and exports an `observers` registry tests can drive.
- Project cards are `<article>` elements in a plain grid; certificate cards likewise.

## Why the native `<dialog>`, and what it costs

A modal has to trap focus, close on Escape, make the background inert, and hand focus back when it closes. Hand-rolling that is roughly a hundred lines of subtle code, and getting it subtly wrong is the normal outcome. `showModal()` does the first three correctly, in the browser, for free.

The cost is testability. **jsdom 29 defines `HTMLDialogElement` but implements neither `showModal` nor `close`** — verified against the installed version. So:

- `src/test/stubs.ts` gains a `showModal`/`close` stub, exactly as it already does for the other five APIs jsdom lacks. Tests then cover what the primitive adds — open and close state, focus return, scroll lock, what is rendered — but **not** the focus trap itself, because the stub cannot trap anything.
- The trap, the Escape key and the inert background are browser behaviour and are verified in Task 6, not by a test.

Say this plainly in the report rather than implying the tests prove more than they do.

## No New React Bits Components

Two the spec names are not used, for reasons this project has now hit four times.

**`Masonry` for the project grid.** Masonry exists to pack items of differing heights. Every project thumbnail is 800×500 by the asset contract and the cards already sit in an equal-height grid — the previous plan fixed exactly that. Masonry would buy nothing and fight the fix.

**`PixelTransition` on card hover.** Project cards already carry the cursor spotlight from `Surface`. A second effect on the same element is the second hover language spec §8.3 rules out, and the same objection that ruled out `MagicBento` and `GlareHover`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/test/stubs.ts` | Add the `<dialog>` stub |
| `src/hooks/useLenis.ts` | Expose `stop` and `start` for scroll lock |
| `src/motion/Dialog.tsx` | The shared modal shell: focus return, scroll lock, close handling |
| `src/sections/Projects.tsx` | Category filter and the detail modal |
| `src/sections/Education.tsx` | Certificate lightbox |
| `src/lib/filter.ts` | Pure category filtering, so the logic is testable without a DOM |

---

## Task 1: Stub `<dialog>` and expose the scroll lock

**Files:**
- Modify: `src/test/stubs.ts`, `src/test/stubs.test.ts`, `src/hooks/useLenis.ts`, `src/hooks/useLenis.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to `src/test/stubs.test.ts`:

```ts
describe('dialog stub', () => {
  it('implements the two methods jsdom leaves out', () => {
    const dialog = document.createElement('dialog');
    expect(typeof dialog.showModal).toBe('function');
    expect(typeof dialog.close).toBe('function');
  });

  it('tracks open state the way the real element does', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);

    expect(dialog.open).toBe(false);
    dialog.showModal();
    expect(dialog.open).toBe(true);
    dialog.close();
    expect(dialog.open).toBe(false);

    dialog.remove();
  });

  it('fires a close event, which is how components learn the dialog was dismissed', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);

    let closed = 0;
    dialog.addEventListener('close', () => (closed += 1));

    dialog.showModal();
    dialog.close();

    expect(closed).toBe(1);
    dialog.remove();
  });
});
```

Append to `src/hooks/useLenis.test.tsx`:

```tsx
it('exposes the scroll lock a modal needs', () => {
  mockMedia(() => false);
  const { result } = renderHook(() => useLenis());

  expect(typeof result.current.stop).toBe('function');
  expect(typeof result.current.start).toBe('function');
  expect(() => {
    result.current.stop();
    result.current.start();
  }).not.toThrow();
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npm test`
Expected: FAIL on both. Report the exact messages.

- [ ] **Step 3: Add the dialog stub to `src/test/stubs.ts`**

```ts
/**
 * jsdom 29 defines HTMLDialogElement but implements neither showModal nor
 * close, so anything built on the native dialog cannot even render in a test.
 *
 * This stub tracks `open` and fires `close`, which is enough to exercise the
 * wiring around a dialog. It traps no focus and makes nothing inert — those
 * are the parts only a real browser can be trusted to do, and they are checked
 * there rather than here.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(returnValue?: string) {
    if (!this.open) return;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event('close'));
  };
}
```

- [ ] **Step 4: Expose `stop` and `start` from `useLenis`**

Lenis provides `stop()`, `start()` and `isStopped` — verified against the installed package. Extend `SmoothScroll` to `{ scrollTo, stop, start }`. Both must be safe to call when Lenis is not running at all, which is the case under reduced motion; a no-op is correct there, since native scrolling needs no stopping and the modal locks the body separately.

- [ ] **Step 5: Run the tests, verify lint, types and build**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build && echo "clean"
```

Expected: 143 existing plus 4 new, so 147 total.

- [ ] **Step 6: Commit**

```bash
git add src/test/ src/hooks/ && git commit -m "test: stub the dialog element and expose the scroll lock"
```

---

## Task 2: The `Dialog` primitive

**Files:**
- Create: `src/motion/Dialog.tsx`, `src/motion/Dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/motion/Dialog.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import Dialog from "./Dialog";

const stop = vi.fn();
const start = vi.fn();

vi.mock("@/hooks/useLenis", () => ({
  useLenis: () => ({ scrollTo: () => {}, stop, start }),
  NAV_OFFSET: 80,
}));

/** A trigger plus a dialog, wired the way a real caller wires them. */
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open project
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Project detail">
        <p>detail body</p>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  beforeEach(() => {
    stop.mockClear();
    start.mockClear();
    document.body.style.overflow = "";
  });

  it("keeps its content out of reach until it is opened", () => {
    render(<Harness />);
    expect(screen.queryByText("detail body")).not.toBeVisible();
  });

  it("opens on demand and announces what it is", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open project" }));

    const dialog = screen.getByRole("dialog", { name: "Project detail" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("detail body")).toBeVisible();
  });

  it("returns focus to whatever opened it", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open project" });

    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    // The platform traps focus but does not hand it back, and without this a
    // keyboard user is dropped at the top of the document.
    expect(trigger).toHaveFocus();
  });

  it("stops the smooth scroll while open and starts it again after", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open project" }));

    expect(stop).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(start).toHaveBeenCalled();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("tells its owner when the browser closes it, which is how Escape arrives", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open project" }));

    // Escape is handled by the browser without telling React, so the component
    // has to listen for the element's own close event or its state drifts.
    const dialog = screen.getByRole("dialog");
    (dialog as HTMLDialogElement).close();

    expect(await screen.findByRole("button", { name: "Open project" })).toHaveFocus();
    expect(start).toHaveBeenCalled();
  });

  it("behaves the same when the reader asked for reduced motion", async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open project" }));

    // A dialog that will not open because someone asked for less motion is
    // broken, not considerate.
    expect(screen.getByRole("dialog", { name: "Project detail" })).toBeInTheDocument();
  });
});
```

Note the first assertion uses `not.toBeVisible()` rather than `queryBy... toBeNull()`: the dialog element stays mounted so its ref survives, and a closed `<dialog>` is hidden rather than absent.

- [ ] **Step 2: Run it to confirm it fails**

Report the exact message.

- [ ] **Step 3: Write `src/motion/Dialog.tsx`**

Props: `open: boolean`, `onClose: () => void`, `label: string`, `children: ReactNode`.

Requirements:

- Render a `<dialog>` and drive it with `showModal()` / `close()` from an effect keyed on `open`. Do not render `null` when closed — the element must exist for the ref to work.
- `aria-label={label}` so the dialog announces what it is.
- Listen for the element's own `close` event and call `onClose`, so the Escape key — which the browser handles without telling React — keeps the component's state honest.
- Capture `document.activeElement` when opening and restore focus to it after closing. The platform does not do this, and without it a keyboard user is dumped at the top of the document.
- Call `stop()` on the smooth scroll while open and `start()` after, and set `overflow: hidden` on `document.body`. Lenis keeps scrolling the page behind a modal otherwise.
- Style the backdrop through `::backdrop`, not an extra overlay div.

This primitive is decoration-free: it must behave identically whether or not motion is allowed, so it does **not** read `useMotionAllowed`. A dialog that will not open because someone asked for less motion is broken, not considerate.

- [ ] **Step 4: Run the tests, verify lint, types and build**

- [ ] **Step 5: Commit**

```bash
git add src/motion/ && git commit -m "feat: add the Dialog primitive"
```

---

## Task 3: The project category filter

**Files:**
- Create: `src/lib/filter.ts`, `src/lib/filter.test.ts`
- Modify: `src/sections/Projects.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/lib/filter.test.ts` for two pure functions:

```ts
import { categoriesOf, filterByCategory } from './filter';
import { projects } from '@/data/projects';

describe('categoriesOf', () => {
  it('lists every category once, in first-appearance order, with All first', () => {
    const list = categoriesOf(projects);
    expect(list[0]).toBe('All');
    expect(new Set(list).size).toBe(list.length);
    for (const project of projects) expect(list).toContain(project.category);
  });
});

describe('filterByCategory', () => {
  it('returns everything for All', () => {
    expect(filterByCategory(projects, 'All')).toHaveLength(projects.length);
  });

  it('returns only the matching category', () => {
    const category = projects[0].category;
    const result = filterByCategory(projects, category);

    expect(result.length).toBeGreaterThan(0);
    for (const project of result) expect(project.category).toBe(category);
  });

  it('preserves the original order rather than reshuffling', () => {
    const category = projects[0].category;
    const result = filterByCategory(projects, category);
    const expected = projects.filter((p) => p.category === category);
    expect(result.map((p) => p.id)).toEqual(expected.map((p) => p.id));
  });

  it('returns nothing for a category no project uses', () => {
    expect(filterByCategory(projects, 'Nonexistent')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it, then write `src/lib/filter.ts`**

Both functions are pure and take the project list as an argument rather than importing it, so they can be tested against fixtures as well as real data.

- [ ] **Step 3: Wire the filter into `Projects.tsx`**

- A row of category buttons rendered through `Chip`, with `aria-pressed` on the active one.
- Selecting a category filters the grid.
- **An empty result shows an explicit message and a reset control**, never a blank area. No category is empty today, so the state is reachable only through code — write a test that renders with a category that matches nothing and asserts the message and the reset button.
- The filter must not fight the cross-highlight: a dimmed card that is filtered out simply is not rendered, and clearing the filter restores it.

- [ ] **Step 4: Extend the Projects tests**

Cover: selecting a category shows only its projects; `aria-pressed` moves with the selection; the empty state appears with a working reset.

- [ ] **Step 5: Run the tests, verify lint, types and build, then commit**

```bash
git add src/lib/ src/sections/ && git commit -m "feat: filter projects by category"
```

---

## Task 4: The project detail modal

**Files:**
- Modify: `src/sections/Projects.tsx`, and its tests

- [ ] **Step 1: Write the failing test**

Cover: each card has a control that opens the modal; the modal shows the project's problem, solution and outcome — the three fields the data contract requires and the card only shows part of; links appear only when present; closing returns focus to the card's control.

- [ ] **Step 2: Implement**

- The card gets a button carrying the project title as its accessible name. The whole card must not become a button — it contains links, and a button containing links is invalid.
- The modal uses `Dialog` with the project title as its label.
- It shows `problem`, `solution`, `outcome`, the full stack, and every link that exists. A missing link renders nothing, not a disabled control.

- [ ] **Step 3: Run the tests, verify lint, types and build, then commit**

---

## Task 5: The certificate lightbox

**Files:**
- Modify: `src/sections/Education.tsx`, and its tests

- [ ] **Step 1: Write the failing test**

Cover: clicking a certificate opens the lightbox showing the full image; the left and right arrow keys move between certificates and wrap at both ends; the verify link appears only for certificates that carry one; closing returns focus to the certificate that opened it.

- [ ] **Step 2: Implement**

- The thumbnail sits inside a button labelled with the certificate title.
- The lightbox uses `Dialog` and shows `imageUrl` — the full-size image, whose aspect ratio varies by design. Constrain it with `max-h-[90vh] max-w-[90vw]` and `object-contain`, which is why no intrinsic dimensions are stored per certificate.
- Arrow keys move through the list and wrap. Put the index arithmetic in a pure function next to `filterByCategory` so wrapping is tested without a DOM.
- If the image fails to load, show the title, issuer and verify link instead of a broken image.

- [ ] **Step 3: Run the tests, verify lint, types and build, then commit**

---

## Task 6: Verify in a browser

This is the task that actually checks the parts the stub cannot.

**Files:** none — verification only.

- [ ] **Step 1: Build and serve**

```bash
npm run build && npx vite preview --port 4192 --strictPort
```

- [ ] **Step 2: Verify and report**

1. **Focus is trapped.** With a modal open, Tab repeatedly and confirm focus never leaves it.
2. **Escape closes it**, and focus returns to the control that opened it.
3. **The background does not scroll** while a modal is open, including with the mouse wheel — Lenis is the thing most likely to ignore this.
4. **The lightbox arrows work** and wrap at both ends.
5. **The filter causes no horizontal overflow** at 320, 375, 768 and 1280, and the empty state renders when forced.
6. **No layout shift** when the filter changes the number of cards — measure the section's height before and after.

The in-app pane cannot do any of this: it has no document focus, so `element.focus()` fires nothing, and `requestAnimationFrame` never runs. **This task needs the owner's own browser.** Report exactly which checks were run there and which were not.

- [ ] **Step 3: Report findings before changing anything, then commit any fixes**

---

## Done When

- `npm test` passes, covering the filter and lightbox arithmetic as pure functions and the dialog wiring through the stub.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.
- A project opens, reads, and closes from the keyboard alone, returning focus where it started.
- A certificate enlarges, moves with the arrow keys, and closes the same way.
- Filtering to an empty category explains itself and offers a way back.
- Nothing scrolls behind an open modal.

## Not In This Plan

The contact form, the node-rail navigation upgrade, accessibility and performance polish, meta tags and structured data, and deployment.
