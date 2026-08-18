# Handoff — read this first

Written 2026-08-18, with all five written plans built and browser-verified. Kept current as work lands — if it disagrees with the code, the code is right and this needs fixing.

This file exists so a session that remembers nothing can pick the work up without asking. Everything below is either recorded here or in a committed document — nothing important lives only in a conversation.

---

## Where the work stands

**Branch:** `feat/foundation-and-content-layer`, ~115 commits ahead of `main`. Nothing is merged; `main` still sits at the first plan document.

**State:** 329 tests pass across 45 files. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all exit 0. Working tree clean. Initial payload is 204 KB JS plus 11 KB CSS gzip against a 250 KB budget, with the WebGL backdrop split into a further 16 KB chunk that only loads when the capability check passes.

| Plan | Covers | Status |
|---|---|---|
| [Foundation & content](plans/2026-08-17-foundation-and-content-layer.md) | Spec phases 0–1 | **Built.** 16 tasks |
| [Navigation](plans/2026-08-17-navigation.md) | Spec phase 2 | **Built.** 9 tasks |
| [Motion & hero](plans/2026-08-17-motion-and-hero.md) | Spec phases 3–4 | **Built.** 7 tasks |
| [Sections & cross-highlight](plans/2026-08-18-sections-and-cross-highlight.md) | Spec phase 5 + phase 7 animation | **Built.** 7 tasks |
| [Interactive surfaces](plans/2026-08-18-interactive-surfaces.md) | Project filter, modal, certificate lightbox | **Built.** 6 tasks |
| [Contact & launch](plans/2026-08-18-contact-and-launch.md) | Spec phases 8–10 | **Tasks 1–9 built.** Task 10, deploy, held until real content lands |
| [Motion enrichment](plans/2026-08-18-motion-enrichment.md) | The spec §6 effects never built, plus `ScrollFloat` | **Built.** 7 of 8 effects; Task 8 skipped by choice |
| [Hierarchy & rhythm](plans/2026-08-18-hierarchy-and-rhythm.md) | Projects, Certificates, Experience — hierarchy from data already there | **Built.** 5 tasks |

The authority on decisions is [the design spec](specs/2026-08-17-portfolio-onepage-design.md). Each plan records the decisions it changed and why.

## What to do next

**Every plan is built.** Two things remain, both the owner's:

1. **Paste the real content.** It touches only `src/data/` and `public/` — that is spec §11 criterion 3 and it still holds. `npm run placeholders` regenerates the images from whatever the data says. Read the asset requirements in spec §5 first: the profile photo must have its background removed, and the certificate scans need identity numbers, dates of birth, wet signatures and personal QR codes covered before upload.
2. **Deploy.** [Contact & launch](plans/2026-08-18-contact-and-launch.md) Task 10 is written and unstarted, held at the owner's request until real content lands. It needs a Web3Forms key and a Vercel account, so it is theirs to run; the plan says exactly what to do.

**Re-measure Lighthouse after the content paste.** The recorded 85/100/100/100 predates the motion and layout work, and Performance sat exactly on its threshold even then. Run it against `npm run preview` on port 4173, in incognito — a run against the dev server measures an artefact ten times heavier and scored 27.

Expect the page to look different from what the plans describe. After the hierarchy plan the owner said four times that it still read as flat, and the sections were reworked conversationally rather than through a new plan document. What shipped is recorded under "The design pass that followed the plans" below.

Before vendoring any further React Bits component, read its source. **Seven have now been rejected on inspection**, all for the same reason — they are finished widgets rather than pieces:

| Rejected | Why |
|---|---|
| `PillNav` | 15KB importing `react-router-dom` into a site with no routes |
| `StaggeredMenu` | 25KB more, for a seven-item disclosure |
| `MagicBento` | 26KB of particles, tilt, magnetism and hardcoded demo content; its spotlight duplicates `Surface` |
| `ScrollReveal` | One span and one ScrollTrigger per word, on prose |
| `GlareHover` | A showcase tile that imposes width, height, background and `cursor-pointer` |
| `Masonry` | Packs items of differing heights; every thumbnail is 800×500 in an equal-height grid |
| `PixelTransition` | A second hover effect on cards that already carry the spotlight |

`LogoLoop` was dropped once and then brought back on 2026-08-18, when the owner named the seventeen logos they wanted. Both original objections were answerable rather than fatal. It takes `{ node }` items as well as `{ src }`, so it needs no image files — the logos are SVG path data in `src/data/technologies.ts`. And its 21 lint problems reduced to zero: sixteen were `no-explicit-any` from a union the code never narrowed, which `'node' in item` already narrows, so deleting the casts type-checked untouched. Of the remainder, three were genuine (a ref missing from a dependency list, and two generic hooks whose dependency array arrives as a parameter and cannot be verified statically).

Two of the seventeen are not from simple-icons: **Java and C# were removed from that set**, so they come from devicon's monochrome variants. Both sets draw single paths, but on different grids — 24 units versus 128 — which is why `viewBox` is stored per logo rather than assumed, and why a test asserts more than one distinct viewBox exists.

Four of the eleven vendored components needed edits. `SplitText` renders its own heading via a `tag` prop and `BlurText` its own `<p>`, so wrapping either naively nests a heading in a heading or a paragraph in a paragraph. `SpotlightCard` hardcoded `bg-neutral-900`, which collided with the design tokens. `Magnet` and `SplitText` both set state synchronously inside an effect.

## What exists in `src/`

Enough of a map to orient without reading everything.

| Path | What is there |
|---|---|
| `data/` | `profile`, `projects` (8), `skills` (4 categories), `experiences` (5) + `EXPERIENCE_TYPE_LABEL`, `education`, `certificates` (14), `technologies` (17 logo paths), `site` (canonical URL, title, OG), `sections` (`SECTIONS` + `shellProps`), `constraints` (`LIMITS`, `longest`, `STRESS_RATIO`), plus `invariants.test.ts` and `site.test.ts` — the data rules and the metadata drift guards |
| `types/` | Every content interface, plus `SectionMeta`, `SectionNavProps`, `Site`, `Technology` |
| `lib/` | All pure and tested directly: `scroll`, `filter`, `cycle`, `rail` (node geometry), `group` (`groupByCategory`, `CATEGORY_ORDER`), `validate` (contact fields), `web3forms` (the submit call), `token` (`cssToken` — canvas cannot read `var()`), `skillIcon` (kebab-case data key → lucide component, explicit table not a derived lookup) |
| `hooks/` | `useActiveSection`, `useScrolledPast`, `useMotionAllowed`, `useOnScreen`, `useLenis` — the last is a **module singleton**, see the traps |
| `motion/` | The wrapper layer, and the only place React Bits is touched: `Reveal` (takes `fill`), `Heading`, `Surface` (the one hover language), `Backdrop`, `Chip`, `Dialog` (takes `wide`), `Counter`, `BlurIn`, `Shine`, `RotatingRole`, `Grain`, `StarButton`, `Typed`, `Marquee`, `Sparks`, `CircularBadge`, `PulseDot`, `AvatarCard`, `LogoMarquee`, `ProjectFlow` |
| `highlight/` | `SkillHighlightProvider` and `useSkillHighlight` — the skill-to-project cross-highlight |
| `nav/` | `NodeRailNav` (in use), `PillNavAdapter` (kept unimported as the second implementation that proves the seam), `Navbar` (owns the hooks) |
| `sections/` | The seven sections. Governed: no React Bits imports |
| `components/reactbits/` | Sixteen vendored components, owned and edited by this project |
| `components/ui/` | `ContactForm`, `FeaturedProject` |
| `components/layout/` | `SectionShell` |
| `test/` | `setup.ts`, and `stubs.ts` with the seven APIs jsdom lacks plus the drivable `observers` registry |

The timeline rule that forced absolutely positioned dots outside their `Reveal` is gone, so that constraint no longer binds anything — but the rule behind it still does: a transformed ancestor becomes the containing block for absolutely positioned descendants, and `AnimatedContent` transforms its wrapper.

## Working practices this project arrived at the hard way

- **Read a component's source before planning around it.** Seven React Bits components were rejected on inspection and four of the eleven vendored ones needed edits. Assuming an API cost a wrong plan every time it was tried.
- **Query the registry for versions.** Every version pinned from memory in the first plan was wrong.
- **Open the browser before calling visual work done.** The project modal shipped pinned to a corner with 177 tests green; it was caught from a screenshot, not a test. Verification scheduled for a later task is verification that arrives too late.
- **Prove a guard fails.** Several tests here were checked by deliberately breaking the thing they watch — the import boundary, the asset invariant, the focus return, the cross-highlight wiring. A guard nobody has seen fail is a guess.
- **Commit after each task.** Two sessions were cut off mid-task by usage limits, each time stranding finished work uncommitted. Per-task commits cap the loss at one task.

## The design pass that followed the plans

Everything below was decided in conversation, not in a plan document, after the owner said the page still read as flat. It is recorded here because nothing else records it — and because several of the decisions were reversals.

**The hero avatar is `ProfileCard`, and it needs a cut-out portrait.** It anchors the image to the bottom of the card and lets the gradient show around it, so an opaque square renders as a pasted block with a seam across the card. Spec §5 carries the requirement; the placeholder is a transparent silhouette so the wrong shape is obvious in development. `mix-blend-mode: luminosity` was removed from the vendored component — it tinted the portrait into the card's hue and would have rendered a real face in blue-violet. `showUserInfo={false}` does **not** suppress the name and title upstream; the flag closes before them, and they are gated now.

**The technology strip is `LogoLoop` with seventeen logos as path data** in `src/data/technologies.ts`. Java and C# are from devicon because simple-icons removed them, which is why `viewBox` is per logo.

**Certificates are a wall, not a list.** Fourteen tiles in a six-column grid, labels revealed on hover, categories as a filter row above. This replaced grouped three-column cards, which replaced full-width thumbnails. The measurements that drove it: the section was 3484px with 3151px of it thumbnail — ninety percent — and is 1143px now. Grouping was tried and removed: it gave structure at the cost of the "look how many" reaction, and the smallest group held one tile.

**The quiet project tier is `FlowingMenu` rows** that reveal a screenshot on hover, at 75px each against 285px as tiles. The three `featured` projects stay editorial rows above them.

**A carousel was considered and rejected**, for reasons worth keeping: it hides work from a reader the spec says scans for 30–60 seconds, its slides must be large to justify the chrome so the height does not drop, and for Projects it would flatten the hierarchy the featured split had just created. Spec §9 had already excluded `CardSwap`, `CircularGallery`, `DomeGallery`, `FlyingPosters`, `InfiniteMenu` and `ScrollStack`. The distinction that mattered: the certificate wall hides no work, only labels, and all fourteen are on screen at once.

**Every React Bits card component was rejected**: `ChromaGrid`, `ReflectiveCard` and `PixelCard` impose fixed pixel widths, and `BorderGlow` and `PixelCard` add render loops. They are showcase pieces sized for a demo page, and none of them addressed height, which was the actual complaint.

**The featured project row went through a second pass**, because shrinking the margins wasn't the actual complaint — "itu sebatas card besar dengan penjelasan" (it's just a big card with an explanation) was about the row duplicating the dialog. `problem` used to print in full beside `outcome`, when the dialog already shows problem, solution and outcome together; nothing on the row earned a click. `problem` now lives in the dialog only, the row leads with `outcome` alone as the hook, and the image is a second labelled button opening the same dialog as the title — a third, always-visible "View case study" control covers the rest, since nothing on this row gets a hover cue on a touch device. The three rows went from 433/433/373px to a uniform 373px, no longer duplicated dialog content, and are no longer different heights from each other, because a fixed-height teaser stopped depending on copy length at all.

**Skills got two additions with no reactbits component at all.** `Skill.icon` had been in the data and the type since the first plan, unread by any component — the same shape of gap `EXPERIENCE_TYPE_LABEL` closed earlier. `lucide-react@1.32.0` renders it now (16 icons, ~2.4 KB gzip; two of the sixteen data values, `chart` and `flask`, have no bare-word icon in the set and map to `ChartColumn`/`FlaskConical` through `src/lib/skillIcon.ts` rather than a derived lookup). Separately, the skill chip that drives the Projects cross-highlight gave no feedback of its own — the dimming lands on Projects, which can be a scroll away — so the active chip now gets `bg-accent/15`, added rather than a border or text-colour override because both of those already exist on `Chip`'s base classes and a second utility for the same property is a coin flip on which one wins in the generated stylesheet. This is also what surfaced that the pane never gives the document real focus (see the environment facts below) — a `cross-highlight.test.tsx` assertion that had looked fine for months turned out to pass whether or not focus did anything at all, and only failed to catch that because it never needed to.

## Decisions that changed after the spec was approved

The spec is not silently wrong anywhere, but three of its decisions were revised once reality was checked. Each is argued in the plan that changed it; this is the index.

1. **TypeScript is pinned to 6.0.3, not the 7.x that npm calls latest.** typescript-eslint refuses to load under TS 7. Under TS 7 the section import boundary matched *nothing* while still exiting 0 — a lint rule that silently guards nothing.
2. **The React Bits navigation components are not used.** Spec D6 chose `PillNav` because it was "drop-in". It is not: 15KB importing `react-router-dom` for a site with no routes, plus 25KB more for `StaggeredMenu`, to render seven anchors. The navigation is written instead. D6's substance survives — a simple pill nav ships now, the node-rail nav replaces it later through the same `SectionNavProps` contract.
3. **Certificate thumbnails are 10:7, not 4:3.** The spec asked for both; §2.3 of the spec records the resolution.

## Environment facts that cost real time to discover

Every one of these produced a wrong turn before it was understood. They are not obvious from the code.

**The browser pane does not composite unless it is displayed, and `requestAnimationFrame` never fires there** — measured at 0 frames. That one fact explains every symptom: no scroll events, CSS transitions frozen at `currentTime: 0`, no IntersectionObserver callbacks, and every GSAP animation stuck at its starting values, since GSAP runs entirely on rAF. Always force an explicit size with `resize_window` first, too; the pane's native size is 0x0 when hidden, which makes every element measure zero wide. This produced two false bug reports during the plan-2 verification — the navbar background looked broken and scroll tracking looked dead, and both were fine. If a browser measurement looks impossible, check `element.getAnimations()` and whether the page is compositing before concluding the code is wrong. Screenshots and real input events are unavailable in this pane.

**`resize_window` in the browser pane changes the viewport without dispatching a `resize` event.** Measured: a listener installed by hand counted **0 events** while the viewport genuinely went from 1425 to 1085. Anything that resizes itself from `window.addEventListener('resize', …)` — the `Galaxy` backdrop calls `renderer.setSize()` there — therefore looks frozen at its mount size in the pane, and looks exactly like a real bug. It is not. Resizing only proves things about CSS-driven layout, never about JavaScript that reacts to a resize.

**Bash heredocs truncate above roughly 8 KB.** The command is passed as an argv string, so a long `cat > file <<'EOF'` either fails with `ENAMETOOLONG` or, worse, gets cut mid-content and dies on an unterminated quote. Both happened. Write long files with the file tools instead.

**jsdom 29 implements none of** `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollIntoView`, `document.fonts`, or `HTMLDialogElement.showModal`/`close`, and every `getBoundingClientRect()` returns zeroes. `src/test/stubs.ts` provides observable fakes — `observers` is a live registry a test can drive by hand, which is the only way to exercise observer wiring here. Layout-derived logic therefore lives in pure functions over numbers (`src/lib/scroll.ts`), not in components.

**ImageMagick is not installed, and the `convert` on PATH is the Windows FAT-to-NTFS disk utility.** Placeholder assets are generated by `scripts/generate-placeholders.mjs` using `sharp`. Run `npm run placeholders` to regenerate; it derives its file list from `src/data/` so it cannot drift.

**`.gitattributes` is load-bearing.** The placeholder CV is mostly ASCII, so git misdetected the PDF as text and line-ending conversion corrupted it — valid in the working tree at 570 bytes, broken in a fresh clone at 602. Binary types are marked explicitly.

**Verify package versions against the registry rather than recalling them.** Every version pinned from memory in the first plan was wrong, including three majors. `npm view <pkg> version` before writing a plan.

**Shell and tooling traps on this machine**, each of which cost a wrong turn:

- `/tmp` is a Git Bash path that Node and PowerShell do not share. A `cp` to `/tmp` fails or lands somewhere the next command cannot read. Use the session scratchpad directory instead.
- `git checkout <file>` on a file with uncommitted changes discards them. Backing a file up before deliberately breaking it needs a real copy, not git.
- A literal non-breaking space in source trips `no-irregular-whitespace`, and it is invisible in an editor and in `JSON.stringify`. Write ` `.
- A `{/* comment */}` cannot sit beside a JSX element inside a `return (…)` — that is two expressions. Between attributes in an opening tag, `//` is fine.
- Writing a ref during render trips `react-hooks/refs`, correctly: it breaks under concurrent rendering. Depend on the value in a callback instead.

**Two layout traps this project has already hit.** `AnimatedContent` sets a transform on its wrapper, and a transformed ancestor becomes the containing block for absolutely positioned descendants — so anything positioned against a section must stay outside its `Reveal`, as the timeline dots do. And `Reveal` adds one or two divs, which breaks a `h-full` chain: it takes `fill` for the grid-item case and must not take it anywhere else, because stacked Reveals each claim the full height of their column.

**A hook that constructs a page-wide engine gives every caller its own copy.** `useLenis` built `new Lenis()` inside its own effect, and both `Navbar` and `Dialog` called it — so two instances drove the same window. Opening a modal stopped the dialog's copy while the navbar's kept scrolling the page behind it, which is exactly what it looked like. Lenis is a module-level singleton now, acquired and released by reference count, and a test builds two callers and asserts one construction; it was proved by restoring the old shape, which reports `expected [ …(2) ] to have a length of 1 but got 2`.

**Lenis also has to be told to keep out of a scroll container.** It reads wheel events on the window, so a modal's own `overflow-y-auto` never receives them even once Lenis is stopped. `data-lenis-prevent` on the dialog is what hands the subtree back to native scrolling; Lenis 1.3 reads the attribute itself.

**A sweep that only tests the extremes misses the middle.** `ProfileCard` sizes itself from `height: 80svh` capped at 540px and derives its width from `aspect-ratio: 0.718` — 388px — so it never consults its container and overflowed it at every width. It went unnoticed through several sweeps because the two ends hide it: below 768 the pane emulates touch, so `AvatarCard` ships its plain `<img>` and the card never renders at all; at 1280 and above the hero column is wide enough that the overflow does not grow the document. Only at **753** did it push the page 94px sideways. Sweep 320, 375, **768**, 1440 — the tablet width is where hover exists and space does not.

**Canvas 2D silently ignores a CSS variable.** `ctx.strokeStyle = 'var(--color-accent)'` does not throw and does not resolve — it keeps whatever was there, which is `#000000` by default. Measured in a browser. `ClickSpark` shipped that way for one task and drew black sparks on a near-black page, invisible, with the whole suite green. Anything that paints to a canvas needs the resolved value: `src/lib/token.ts` reads it, so CSS keeps the single source of truth. The same applies to `ElectricBorder`, which additionally parses its colour as hex.

**Measuring layout after `resize_window` without reloading gives false results.** The pane fires no `resize` event and no `ResizeObserver` callback, so anything that sizes itself from either keeps its old dimensions and drags the layout with it. Measured: resizing 1265 → 320 left `ClickSpark`'s canvas at its old width and reported **808px of page overflow**, with `<header>` — a `fixed` element — claiming to be 1128px wide inside a 320px viewport. That impossible header width is the tell. On a fresh load at 320 the overflow was 0. **Always reload after resizing before believing a measurement.**

**An element at a negative z-index never receives a pointer event.** Hit testing follows paint order, and a child with `z-index: -1` or lower paints behind its parent's own background — so the parent wins every hit test over it. `Backdrop` sits at `-z-10`, which meant `Galaxy`'s `mousemove` listener was correctly attached to a container that could not receive a single event: measured on the built page, **no point anywhere in the hero resolved to it**. The pointer parallax was wired up and silently dead from the day it shipped. Raising the z-index does not fix it either, because the hero's `max-w-[1200px]` content wrapper legitimately covers most of the section and must stay hittable for text selection. `Galaxy` now listens on the window and normalises against its own `getBoundingClientRect()`, which works regardless of stacking; outside that box it fades the effect out rather than clamping to an edge. Anything decorative behind the content that wants pointer input has to do the same.

**Tailwind preflight un-centres native dialogs.** A modal dialog is centred by the UA stylesheet through `margin: auto`, and preflight resets margin to 0 on every element, so it pins itself to the top-left corner. `Dialog` carries `m-auto` for exactly that reason. Nothing in jsdom can catch it, because every rect there is zero — it shipped looking broken and was only found from a screenshot.

**A fixed header can overflow invisibly.** `documentElement.scrollWidth` does not grow for a fixed element, so an overflow sweep reports clean while a control sits off screen and unreachable. Measure the header contents against `clientWidth` directly.

## Architectural rules that are enforced, not just documented

- **No file under `src/sections/` may import `src/components/reactbits/`.** ESLint rule, verified to fire on relative, alias, and barrel import forms. The fix for a violation is a wrapper in `src/motion/`, never an exception in the config.
- **Swapping the navigation touches one file.** `Navbar.tsx` is the only non-test file naming `NodeRailNav`, and a test in `Navbar.test.tsx` enforces it by scanning `src/`.
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
- **The profile photo has to be cut out of its background.** `ProfileCard` in the hero anchors the image to the bottom of the card and lets the gradient show around it, so an ordinary opaque square renders as a pasted block with a visible seam across the card — measured at 388×388 covering 72% of a 540px card, with 153px of bare gradient above it. Spec §5 now carries the requirement. The placeholder is a transparent silhouette so the wrong shape is obvious during development rather than after deploy. `mix-blend-mode: luminosity` was also removed from the vendored component: it tinted the portrait into the card's hue, which would have rendered a real face in blue-violet.

- **All content is placeholder.** Names, projects, certificates and the CV are realistic fixtures written at the maximum lengths the layout contract permits, so the layout is stress-tested before real content arrives. The owner intends to paste real content once every plan is built. It touches only `src/data/` and `public/`; `npm run placeholders` regenerates the images from whatever the data says.
- **The dialogs are fully verified as of 2026-08-18.** The owner confirmed in a real browser that Tab cannot escape an open dialog and that Escape closes it, for both the project modal and the certificate lightbox, with the arrow keys stepping through certificates. Together with what was already measured — focus moves in on open, returns to the trigger on close, the body locks and Lenis genuinely stops — the native `<dialog>` bet is settled. Nothing here is outstanding.
- **Lighthouse passes all four thresholds, with no headroom on one.** Measured 2026-08-18 on the production build (`npm run preview`), mobile, incognito: **Performance 85, Accessibility 100, Best Practices 100, SEO 100** against spec §12.3's 85/95/95/95. FCP 2.7s, LCP 3.1s, TBT 220ms, CLS 0.001.

  **Run it against `preview`, never `dev`.** The first two runs scored 27 and 34 against the Vite dev server, which serves hundreds of unbundled ES modules — Lighthouse reported a 7,951 KB payload and offered to save 6,091 KB by minifying. The real initial payload is 179 KB gzip (170 JS, 8 CSS) plus about 109 KB of latin font subsets, with the Galaxy chunk a further 15 KB loaded only on demand. A run against `dev` is measuring the wrong artefact by a factor of ten.

  Chrome extensions cost 8 accessibility points in the very first run. In incognito it is 100.

  **Performance sits exactly on the threshold, so it has nowhere to fall.** Real content is the risk: fourteen certificate scans at up to 250 KB each and eight project thumbnails replace placeholders that are currently a few KB of flat colour. If the score drops after the paste, Lighthouse already names the targets — render-blocking requests (750ms), main-thread work (7.6s), JavaScript execution (4.2s), and 18 non-composited animations. All four are GSAP and WebGL, not file size.

- **The reduced-motion pass is confirmed too.** With Windows animation effects off, the owner verified no canvas remains on the page. The keyboard pass through the whole page is likewise done.

- **The `Galaxy` resize is confirmed** in the owner's browser. Nothing from the contact-and-launch sweep is outstanding.

- **Seven motion effects landed; one was declined and two were replaced after being built.** `StarBorder` on the CV and Send buttons, `TextType` on the contact opening line, `ClickSpark` in Contact, `CircularText` as a badge, and `PulseDot` marking the current role. The footer marquee began as `CurvedLoop` and is `ScrollVelocity` now: the curve locked the element to `aspect-[100/12]`, so it took 152px of a 281px footer with no way to ask for less, and its replacement is 32px and moves with the scroll rather than on its own. `ScrollFloat` was deleted rather than wired, because `SplitText` already carries `scrollTrigger: { once: true }` and running both would put two heading languages on one page.

  `ElectricBorder` was built and then removed: the owner found it too loud beside prose, and it cost a render loop for as long as Experience was on screen. What replaced it is cheaper in every direction — a tinted card plus a three-second ring on the 10px timeline dot, animating only transform and opacity so it composites.

  `GlassIcons` was declined. It imposes its own grid and a six-colour 90%-saturation palette, needs `React.ReactElement` icons the data does not have and no installed library provides, and on Skills it would have cost the working skill-to-project cross-highlight. Same objection that rejected `MagicBento` and `GlareHover`.

  **Cost: about 10 KB gzip.** Initial payload went from 179 KB to 189 KB (179.62 JS + 9.42 CSS) against a 250 KB budget. Width sweep on the production build at 320, 753 and 1425, each on a fresh load: no page overflow and no header overflow at any of them.

  **Not yet measured: Lighthouse after these effects.** The last recorded run is 85/100/100/100, taken before any of them. Three render loops now exist — the starfield, the footer marquee and the click sparks — all gated on visibility, and the sparks idle when no spark is alive.

- **`SplashCursor` was built, shipped and reverted on 2026-08-19, and the reason is the sharpest warning in this file.** A full-screen WebGL fluid cursor, vendored with six real fixes — upstream has *no effect cleanup at all* (discarded rAF handle, five inline-arrow window listeners that `removeEventListener` can never match, and `BACK_COLOR` in the dependency array so a re-render stacks a second simulation on the first), and it *throws* `Unable to initialize WebGL` from inside its effect, making its own `if (!gl || !ext) return;` unreachable. All of that was fixed and tested. It still had to be reverted, because none of it was the problem.

  The problem: a full-screen canvas at `z-30` covers every piece of page content, and the pane cannot render it to show that. Everything below `z-40` vanished behind an opaque canvas — the owner's screenshot showed a white page with only the navbar and the node rail, both of which sit at `z-40`, still visible. Every check that *was* possible here passed: the canvas mounted with a live `webgl2` context, `z-index` computed to 30 against the navigation's 40, and `elementFromPoint` at three places hit page content rather than the canvas. The display shader even emits alpha correctly (`vec4(c, max(c.r,c.g,c.b))`), so reading the source predicts transparency. It was not transparent in a real browser.

  Two lessons. **`TRANSPARENT` is a dead prop** — it is declared, defaulted, threaded into `config` and listed in the dependency array, and never read anywhere in the render path, which is the kind of thing only a browser tells you. And more generally: **the pane can verify that a canvas exists, not what it paints.** For anything whose whole purpose is pixels on a full-screen surface, no amount of DOM measurement here substitutes for one look in a real browser. Revert is `git revert 85bc1e6` if it is ever worth another attempt; the correct next try puts it *behind* the content the way `Backdrop` and `Grain` already are, at a negative z-index, not above it.

- **GSAP-driven animation cannot be measured in the pane at all**, and the failure mode is silent. GSAP runs entirely on `requestAnimationFrame`, which never fires there, so it never applies its `from` state — every element reads `opacity: 1, transform: none` whether the animation already finished or never started. A reading like that looks like evidence and is not. Anything scheduled with `setInterval` or `setTimeout` **is** measurable there; that is why the `TextType` check worked and the `SplitText` one did not. The owner confirmed in a real browser that section headings animate per character on arrival and that the contact line types on arrival.

  What **was** measured on the production build, at 320, 375, 753, 985, 1085, 1265 and 1425: `documentElement.scrollWidth` never exceeds `clientWidth`, and the header's inner container never exceeds its own client width either — checked separately because a fixed element does not grow the document's scroll width. On a fresh load at 320 the grain canvas matches the viewport exactly.

- **Raising `testTimeout` does not raise the hook timeout, and the failure names a number you never configured.** Vitest times `beforeEach`/`afterEach` separately at a 10s default, and Testing Library registers its cleanup — which unmounts the whole App tree — as an `afterEach`. So App.test.tsx failed with `Hook timed out in 10000ms` while `testTimeout` sat at 45s looking innocent, and the test that "failed" had already finished its assertions. Unmounting this page costs about what mounting it does. `hookTimeout` is set alongside `testTimeout` now; keep them together.

- **A `:focus` style cannot be verified in the pane at all**, which is the focus gap below showing up in CSS rather than in JavaScript. `:focus` only matches while the document itself is focused, and `document.hasFocus()` is permanently false there — so a `focus:z-50` utility computes as `z-index: auto` no matter what `.focus()` did to `document.activeElement`. To check what a focus variant resolves to, apply the same utilities to a throwaway element and read *that*: `document.createElement('a')` with `className = 'absolute z-50'` reports 50, which is the fact the assertion actually needed.

- **The pane never gives the document real focus, so `.focus()` is exactly as unreliable there as `requestAnimationFrame` — same root cause, one more symptom.** Measured: `element.focus()` moves `document.activeElement` (that part is real bookkeeping, not faked), but `document.hasFocus()` reads `false` and neither a native `focus` nor `focusin` listener — attached directly, bypassing React entirely — ever fires. A React `onFocus` handler that depends on that event therefore never runs, which looked exactly like a bug in a freshly-added active-chip style before a plain `addEventListener('focusin', …)` check showed the event itself never arrives. Mouse events dispatched for real (`userEvent.hover`) still work fine in a real browser; this is specific to focus. Trust jsdom via `@testing-library/react`'s `act()` for anything focus-triggered — it has no such gap — and treat the pane the way this file already treats GSAP: fine for layout and DOM shape, blind to anything that starts with an event the pane cannot actually deliver.
- **`main` has nothing on it.** Over a hundred commits sit on one branch with no merge. Nothing is broken by that, but the longer it runs the more there is to unpick if something needs reverting. The deploy task merges it.

- **The contact form has never sent a message.** `VITE_WEB3FORMS_KEY` is unset, so submitting reaches the error state and offers the `mailto:` fallback — which is the designed behaviour, not a bug, but it means the success path has only ever been seen in tests. Sending one real message is a step in the deploy task.

- **One test was wrongly called a flake, twice.** The `Sparks` frame clock flushed at an absolute timestamp of `10_000` while `ClickSpark` stamps sparks with `performance.now()`, so once the test process had been alive that long the flush stopped being past the 400ms duration. It is relative now. The lesson is the general one: a test that fails only in full-suite runs is usually reading a clock it does not own.

## How this project verifies things

The short version, because it is what makes the rest trustworthy:

- **Prove the guard fails.** Nearly every guard here was checked by breaking what it watches — the import boundary, the asset invariant, the honeypot, the band clamp, the metadata drift, the navigation seam, the render loop, the section outline, the CSS-variable-on-canvas bug. A guard nobody has seen fail is a guess.
- **Measure in a browser, then say the number.** Four visual defects shipped with a green suite before this became habit. Every layout claim in this file has a measurement behind it.
- **Distrust a measurement that is impossible.** A `fixed` header claiming to be 1128px wide inside a 320px viewport, a page overflow that appears only without a reload, an element at `opacity: 1` that GSAP never touched — each looked like a bug and was not.
