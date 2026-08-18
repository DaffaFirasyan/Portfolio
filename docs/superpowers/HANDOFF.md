# Handoff — read this first

Written 2026-08-18, at the point where plans 1, 2 and 3 are built and verified in a browser.

This file exists so a session that remembers nothing can pick the work up without asking. Everything below is either recorded here or in a committed document — nothing important lives only in a conversation.

---

## Where the work stands

**Branch:** `feat/foundation-and-content-layer`, 74 commits ahead of `main`. Nothing is merged; `main` still sits at the first plan document.

**State:** 192 tests pass across 25 files. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all exit 0. Working tree clean. Initial JS is 165 KB gzip against a 250 KB budget, with the WebGL backdrop split into a further 15 KB chunk that only loads when the capability check passes.

| Plan | Covers | Status |
|---|---|---|
| [Foundation & content](plans/2026-08-17-foundation-and-content-layer.md) | Spec phases 0–1 | **Built.** 16 tasks |
| [Navigation](plans/2026-08-17-navigation.md) | Spec phase 2 | **Built.** 9 tasks |
| [Motion & hero](plans/2026-08-17-motion-and-hero.md) | Spec phases 3–4 | **Built.** 7 tasks |
| [Sections & cross-highlight](plans/2026-08-18-sections-and-cross-highlight.md) | Spec phase 5 + phase 7 animation | **Built.** 7 tasks |
| [Interactive surfaces](plans/2026-08-18-interactive-surfaces.md) | Project filter, modal, certificate lightbox | **Built.** 6 tasks |
| Contact & launch | Spec phases 8–10 | Not written |

The authority on decisions is [the design spec](specs/2026-08-17-portfolio-onepage-design.md). Each plan records the decisions it changed and why.

## What to do next

Write and execute the last plan: the contact form, the node-rail navigation upgrade that spec D6 always intended, accessibility and performance polish, meta tags and structured data, and deployment.

**Two checks are still open from the interactive-surfaces plan** and need a real browser, because the in-app pane holds no document focus: that Tab cannot escape an open dialog, and that Escape closes it. Everything else there was measured — focus moves into the dialog on open and returns to the trigger on close, the body locks and Lenis genuinely stops, and the filter changes card count without resizing the cards that remain.

Before vendoring any further React Bits component, read its source. Four have now been rejected on inspection — `PillNav`, `MagicBento`, `ScrollReveal` and `GlareHover` — because they are finished widgets rather than pieces, and three already in the tree needed edits: `SplitText` renders its own heading via a `tag` prop, `BlurText` renders its own `<p>`, and `SpotlightCard` hardcoded a palette that collided with the design tokens.

## Decisions that changed after the spec was approved

The spec is not silently wrong anywhere, but three of its decisions were revised once reality was checked. Each is argued in the plan that changed it; this is the index.

1. **TypeScript is pinned to 6.0.3, not the 7.x that npm calls latest.** typescript-eslint refuses to load under TS 7. Under TS 7 the section import boundary matched *nothing* while still exiting 0 — a lint rule that silently guards nothing.
2. **The React Bits navigation components are not used.** Spec D6 chose `PillNav` because it was "drop-in". It is not: 15KB importing `react-router-dom` for a site with no routes, plus 25KB more for `StaggeredMenu`, to render seven anchors. The navigation is written instead. D6's substance survives — a simple pill nav ships now, the node-rail nav replaces it later through the same `SectionNavProps` contract.
3. **Certificate thumbnails are 10:7, not 4:3.** The spec asked for both; §2.3 of the spec records the resolution.

## Environment facts that cost real time to discover

Every one of these produced a wrong turn before it was understood. They are not obvious from the code.

**The browser pane does not composite unless it is displayed, and `requestAnimationFrame` never fires there** — measured at 0 frames. That one fact explains every symptom: no scroll events, CSS transitions frozen at `currentTime: 0`, no IntersectionObserver callbacks, and every GSAP animation stuck at its starting values, since GSAP runs entirely on rAF. Always force an explicit size with `resize_window` first, too; the pane's native size is 0x0 when hidden, which makes every element measure zero wide. This produced two false bug reports during the plan-2 verification — the navbar background looked broken and scroll tracking looked dead, and both were fine. If a browser measurement looks impossible, check `element.getAnimations()` and whether the page is compositing before concluding the code is wrong. Screenshots and real input events are unavailable in this pane.

**jsdom 29 implements none of** `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollIntoView`, `document.fonts`, or `HTMLDialogElement.showModal`/`close`, and every `getBoundingClientRect()` returns zeroes. `src/test/stubs.ts` provides observable fakes — `observers` is a live registry a test can drive by hand, which is the only way to exercise observer wiring here. Layout-derived logic therefore lives in pure functions over numbers (`src/lib/scroll.ts`), not in components.

**ImageMagick is not installed, and the `convert` on PATH is the Windows FAT-to-NTFS disk utility.** Placeholder assets are generated by `scripts/generate-placeholders.mjs` using `sharp`. Run `npm run placeholders` to regenerate; it derives its file list from `src/data/` so it cannot drift.

**`.gitattributes` is load-bearing.** The placeholder CV is mostly ASCII, so git misdetected the PDF as text and line-ending conversion corrupted it — valid in the working tree at 570 bytes, broken in a fresh clone at 602. Binary types are marked explicitly.

**Verify package versions against the registry rather than recalling them.** Every version pinned from memory in the first plan was wrong, including three majors. `npm view <pkg> version` before writing a plan.

**Two layout traps this project has already hit.** `AnimatedContent` sets a transform on its wrapper, and a transformed ancestor becomes the containing block for absolutely positioned descendants — so anything positioned against a section must stay outside its `Reveal`, as the timeline dots do. And `Reveal` adds one or two divs, which breaks a `h-full` chain: it takes `fill` for the grid-item case and must not take it anywhere else, because stacked Reveals each claim the full height of their column.

**Tailwind preflight un-centres native dialogs.** A modal dialog is centred by the UA stylesheet through `margin: auto`, and preflight resets margin to 0 on every element, so it pins itself to the top-left corner. `Dialog` carries `m-auto` for exactly that reason. Nothing in jsdom can catch it, because every rect there is zero — it shipped looking broken and was only found from a screenshot.

**A fixed header can overflow invisibly.** `documentElement.scrollWidth` does not grow for a fixed element, so an overflow sweep reports clean while a control sits off screen and unreachable. Measure the header contents against `clientWidth` directly.

## Architectural rules that are enforced, not just documented

- **No file under `src/sections/` may import `src/components/reactbits/`.** ESLint rule, verified to fire on relative, alias, and barrel import forms. The fix for a violation is a wrapper in `src/motion/`, never an exception in the config.
- **Swapping the navigation touches one file.** `Navbar.tsx` is the only non-test file naming `PillNavAdapter`.
- **Replacing placeholder content touches only `src/data/` and `public/`.** Section headers read from `SECTIONS` via `shellProps(id)`, so a section's number, nav label, and heading cannot drift apart.
- **`src/index.css` contains `@source not '../docs'`.** Tailwind v4 scans the whole repository, and these plan documents name utility classes in prose. Without the exclusion, `docs/` generates real CSS and "this class is in the bundle" stops proving a component uses it.

## Things known to be imperfect

- **The stress rule does not apply to proper nouns.** `certificate.issuer` and `experience.organization` are names owned by someone else — "Coursera" cannot be stretched to 36 characters. When real content lands, those two assertion clauses should be deleted, not worked around. Spec §4.1 records this.
- **Nothing animates while Windows has animation effects off**, and that setting is easy to forget. It makes every Chromium browser on the machine report `prefers-reduced-motion: reduce`, which correctly disables the starfield, per-character headings, the rotating role, the counters, the tilt, the grain, and Lenis smooth scroll all at once. The switch is **Settings → Accessibility → Visual effects → Animation effects**. The low-end heuristic is not involved on this machine — `deviceMemory` is 16 and `hardwareConcurrency` is 20.

  With the setting on, verified in a browser: `prefers-reduced-motion` reads false, Lenis mounts (`html.lenis`), `SplitText` splits the h1, the Galaxy chunk is fetched on demand, and there is **exactly one WebGL 2.0 context** at hero width with the gradient fallback gone.

  Do not relax the gate to make the effects visible during development. The preference is an explicit request, and honouring it completely is the thing this architecture was built around.

  The owner confirmed in a real browser that both canvases leave the DOM once the hero is scrolled past, so the unmount works end to end. The film grain is gated the same way through `useOnScreen` — it repainted every third frame regardless of visibility until that was fixed.

  **Still unverified:** that the hero entrance reads as a staggered sequence finishing inside ~1.2s. Needs a compositing browser; the in-app pane advances no transitions and delivers no IntersectionObserver callbacks.
- **Active-section tracking has never been watched in a real browser.** Its logic is covered by unit tests driving the observer directly, including fast scroll and document-order tie-breaks, but nobody has seen the indicator follow a real scroll. Worth a look in `npm run dev`.
- **All content is placeholder.** Names, projects, certificates and the CV are realistic fixtures written at the maximum lengths the layout contract permits, so the layout is stress-tested before real content arrives.
