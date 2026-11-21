# Star Map — design spec (round six, builds on night-passport)

Status: awaiting owner review. Branch to create from `redesign/night-passport` once that is committed: `feature/star-map`.
Builds on `docs/superpowers/specs/2026-11-20-night-passport-design.md`; it does not replace the sky, the passport or the palette.

## Why

After seeing the night-passport build the owner said it was not interactive enough and pointed at a friend's portfolio (rilga.vercel.app, "Museum After Hours") as the kind of interaction wanted, without plagiarising it. Looked at on 2026-11-20 (nothing downloaded or copied):

- It is one screen with no vertical scroll and six "rooms". A guard character walks along the bottom; dragging him, the arrow keys or the buttons change room, and he comments on each room in a speech bubble. A flashlight toggles. A video intro can be skipped.
- What works in it: a living presence that answers every action; a physical space to explore; one room at a time; clear controls and deep links; accessibility kept (Lighthouse 100).
- What does not: 3.8 to 4.7 MB (two 1.5 MB intro videos, both fetched, and an 809 KB Rive wasm), mobile Performance 84 with LCP 4.0 s; the speech bubble covers content; everything sits behind six clicks, so nothing can be skimmed.

Our current build is ambient (a sky that reacts). The owner wants something the reader operates. Answers fixed by the owner: direction **Star Map you explore**, **map by default with a reading-mode switch**, and the anti-copy rules below recorded in `CLAUDE.md`.

## What must not be built (recorded in CLAUDE.md)

A guide character with speech bubbles; rooms you slide between; a flashlight or cursor spotlight; per-page narration; any file or sentence from that site. Free to use: skip intro, arrow-key navigation, deep links, language toggle, aria-live announcements.

## The idea

The sky becomes a map the reader moves through. Instead of a guide, the reader is given a tool: drag to pan, wheel or pinch to zoom, click a named constellation and the camera flies there; the section opens as a reading panel beside the sky. The page everyone has been reading stays as **Reading mode**, one switch away, and always holds every word.

## Modes

- **Map** (default). The overview shows the name, role, tagline, the CV and email actions, a one-line hint ("Drag the sky. Pick a constellation.") and six named constellations. Below `md` (phones) it drops the tagline and the two action buttons to leave the sky room; the CV and email stay one tap away in the Menu.
- **Reading**. Exactly the current linear page: Hero, About, Skills, Experience, Projects, Education, Contact, with the sky behind it scrolling as now.
- A switch in the top bar ("Map / Read") sets the mode. The choice is remembered in `localStorage` (`daffa_view`, try/catch). The first visit is Map.
- Forced to Reading, with the switch hidden, when there is no 2D canvas context.
- Deep links: `#about`, `#skills`, `#experience`, `#projects`, `#education`, `#contact` open that region in Map mode and scroll to that section in Reading mode. No hash is the overview. Existing top-bar links keep working in both modes.

## Map mode behaviour

1. **Regions.** Six constellations at fixed positions in a world about 3000 by 2000 units, named by the existing section labels (About, Skills, Experience, Projects, Education, Contact). Home is the overview itself. Each is a small star figure with its label button under it (labels are styled the same everywhere; none brightens with distance).
2. **Camera.** `{x, y, zoom}`, zoom between 0.2 and 3 (the floor is low because the overview must fit six constellations on a phone, about 0.25).
   - One finger or mouse drag pans, with simple inertia.
   - Wheel or two-finger pinch zooms around the pointer, so the point under the cursor stays put.
   - Arrow keys pan, plus and minus zoom, when the map has focus.
3. **Open a region.** Click or tap a constellation, press Enter on its focus-ordered button, or follow a hash. The camera flies there in about 650 ms (an instant cut under reduced motion) with the region offset to the free side of the screen, then the panel opens.
4. **Panel.** On wide screens a drawer on the right (about 720 px, the sky visible on the left); on phones a full-height sheet. It holds the existing section component unchanged apart from a compact single-column layout (SectionShell reads the mode). Close with the button ("Back to the sky"), Escape, or the browser Back button. Focus returns to the region's button.
5. **Hint and onboarding.** One line of hint on the overview ("Drag the sky. Pick a constellation."), shown whenever the overview is. No narration in any region.
6. **The sky beside an open panel.** On a wide screen the sky stays draggable, zoomable and traceable next to the panel; only the region labels go inert (and stay out of the tab order) while a panel is open. The Projects region is framed at a fitted zoom so its four project figures fit the free area and never sit under the panel.
7. **Skills lighting projects.** In Map mode, hovering or focusing a skill in the Skills panel brightens the matching project constellations in the Projects region (stage two).

## Stage two: projects as constellations

Zooming into Projects reveals four constellations, one per project. Dragging a line across a project's stars in order traces it; completing the trace "launches" the project card in the panel. A click opens the card directly, so the trace is a flourish and never a requirement.

## Passport in Map mode

- The ten stamps, the chip, the sheet, the secrets and the rewards are unchanged.
- The reading rule for a region: its panel has been open for five seconds in total and the reader then closes it or opens another region. Home: the overview has been shown five seconds and the reader then opens a region or switches to Reading mode. In Reading mode the existing rule applies.
- The comet crosses the Map overview as well (screen space), and the ten-stamp initials appear in the sky.

## Architecture

- `SkyCanvas` keeps one canvas, one loop, the tiers, the trail, the comet and the finale. It gains a **camera mode**: stars, regions and constellations are placed through the camera instead of the scroll offset. The camera lives in a ref owned by the map layer and is read in the loop.
- New `src/map/`:
  - `mapEngine.ts`: pure maths (screen to world and back, zoom around a point, clamp, fly-to easing, inertia decay, nearest-region hit test, region layout).
  - `ViewModeProvider.tsx`: mode state, storage, forced fallback, `useViewMode()`.
  - `StarMap.tsx`: input (pointer, wheel, pinch, keys), focusable region buttons positioned from the camera each frame, hash handling, panel orchestration.
  - `MapPanel.tsx`: drawer or sheet around the active section, using the existing `Dialog`-style focus handling.
- `src/sections/Hero.tsx` is split into the title block (shown on the overview) and the passport data page (shown at the top of the About panel in Map mode, and in the Hero in Reading mode).
- `src/passport/useStampOnRead.ts` gains a panel rule used when the section lives in a Map panel.
- Copy for the switch, the hint, "Back to the sky" and the region labels' accessible names goes in `src/data/i18n/dictionary.ts`, EN and ID.

## Device care and limits

- The tiers apply as before: full (inertia, fly-to, trail, comet), lite (30 fps, no trail or comet), still (camera cuts without animation, canvas redrawn only when the camera or the theme changes).
- Touch is the main input: `touch-action: none` on the map layer, one-finger pan, two-finger pinch.
- No video, no wasm, no library, no WebGL. Whole page transfer stays under about 500 KB; Lighthouse mobile at least 90 as the median of three; accessibility, best practices and SEO 100; axe clean in dark, light, tablet and phone; no horizontal overflow from 320 to 1440 px.

## Accessibility

- The canvas stays decorative (`aria-hidden`). Every region is a real button with the section's name; Tab visits them and focusing one pans the camera to it.
- The panel announces its section by heading and returns focus on close. The mode switch is a button whose label names where it will take you ("Reading mode" on the map, "Star map" on the page), so it needs no `aria-pressed`. It sits in the top bar from 1024 px wide and in the Menu below that.
- Every word of content exists in Reading mode, and in Map mode all sections stay in the DOM and the inactive ones are `hidden`.
- Reduced motion: no fly-to animation, no inertia, no trail, no comet.

## Testing

- Unit: camera maths (point under the pointer stays put when zooming, clamp, fly-to ends exactly at the target, inertia decays to zero, the hit test returns the nearest region inside its radius and nothing outside it).
- Component: overview shows six region buttons and the hint; Enter opens the right panel; Escape closes it and returns focus; a hash opens a region; the switch toggles and is remembered; no canvas context gives Reading mode with the switch hidden; the stamp rule for a panel; EN and ID strings; Reading mode still renders all sections in order.
- Browser, with the pane visible (a hidden pane freezes `requestAnimationFrame`): drag and wheel on desktop, pinch and drag on a phone size, fly-to and panel on both, mode switch, hash deep links, frame time, Lighthouse and axe as above.

## Delivery in stages (each shippable)

1. Mode switch, map overview, camera, regions, panel, hash, stamps rule, accessibility.
2. Projects as constellations and the trace, skills lighting projects.
3. Hint, polish, tiers in the map, documents.

## Out of scope

Any guide character, narration, rooms, flashlight, video, Rive, wasm, WebGL, new sections, server code.

## Risks

- Map by default is less skimmable than a page; the Reading switch and the always-present DOM answer it, and the hint says so.
- It is round six after five rejected or revised directions; the calm reading panel and one accent are kept so the spectacle stays in the sky.
- Touch gestures are the hardest part to get right and cannot be proved in jsdom; they need a real phone.
- The hidden-pane trap means browser verification needs the pane shown.
- The Comet stamp and the ten-stamp reward remain unreachable under reduced motion.
