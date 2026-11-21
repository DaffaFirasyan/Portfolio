# Map discoverability — design spec (addendum to the star map)

Status: approved by the owner's answers (AskUserQuestion, 2026-11-21). Builds on `2026-11-20-star-map-design.md`; branch `feature/star-map` after the "Star Sky v2" commit.

## Problem

After trying the star map the owner said visitors will not know how to use it: nothing says a constellation can be clicked, and once a panel is open you must go back to the sky to reach another section.

## Decisions (owner's answers)

- **Primary way to move between sections: scroll.** A wheel or trackpad scroll carries the reader to the next or previous section and opens its panel; zoom moves to Ctrl+wheel, pinch, and the `+`/`-` keys.
- **Plus:** Previous / Next controls in the panel, and constellations that pulse until first use and preview their section when hovered.
- **Start:** the map stays the default on every screen, with clear cues.
- Not chosen, so not built: a three-step first-visit guide, a route bar.

## The order

Overview, then About, Skills, Experience, Projects, Education, Contact (`SEQUENCE = [null, ...REGION_IDS]`). `stepFrom(region, dir)` returns the neighbour, or the same region at either end.

## Behaviour

1. **Scroll on the sky.** A plain wheel (no Ctrl) accumulates; about 80 px of delta makes one step (down = next, up = previous) and the panel opens or closes accordingly. One gesture makes one step: after a step the stepper stays locked until the wheel has been quiet for 200 ms and at least 700 ms have passed, so a trackpad's long inertia tail never skips sections. Ctrl+wheel (which is also how a trackpad pinch arrives) zooms about the pointer, as the plain wheel did before. `PageDown` / `PageUp` on the map step as well.
2. **Scroll inside a panel.** Wheel scrolls the panel as normal. When it is already at its end (or start) and the reader keeps scrolling in that direction, about 220 px of further delta steps to the next (or previous) section, with the same one-gesture lock. A short row at the end of every panel names where that goes: "Next: Skills →".
3. **Previous / Next in the panel.** The sticky top bar keeps "← Back to the sky" and adds the neighbours' names ("‹ About", "Experience ›"; icons only on a phone, with full accessible names). The last section has no Next; the first section's Previous is the overview, which is "Back to the sky". Moving scrolls the panel to its top and puts focus on the back button.
4. **Start on the overview.** A pill, bottom left, "Start exploring" steps to About; it exists for touch screens, where a vertical swipe pans the map. The hint line gains "Scroll to begin." on devices with a fine pointer only.
5. **Pulse.** Until the visitor first touches the map (a press, a wheel, a key, opening a region) the constellations breathe in brightness, in the full tier only. Lite and still tiers draw them still. After the first touch it stops for the visit.
6. **Hover preview.** With a mouse, hovering a constellation (its figure or its label) brightens it in the accent colour, shows the section's own title under its label (from the section metadata, no new copy), and turns the cursor into a pointer; the sky shows a grab cursor elsewhere.

## Strings (dictionary, EN and ID)

`mapStart` "Start exploring" / "Mulai menjelajah"; `mapScrollHint` "Scroll to begin." / "Scroll untuk mulai."; `prevSection(name)` "Previous: {name}" / "Sebelumnya: {name}"; `nextSection(name)` "Next: {name}" / "Berikutnya: {name}".

## Architecture

- `mapEngine.ts`: `SEQUENCE`, `stepFrom`, `neighbours`, `createWheelStepper(onStep, threshold)` returning `{ push(delta, now), reset() }` (pure, timed by the caller's clock).
- `ViewProvider`: `step(dir)`, plus refs `interacted` and `hover` shared with the sky.
- `StarMap`: wheel navigation and Ctrl zoom, `PageUp`/`PageDown`, the Start pill, hover state, cursor, tooltip, sets `interacted`.
- `MapPanel`: neighbour buttons, end-of-panel row, overscroll stepping, scroll to top and focus on region change.
- `SkyCanvas`: pulse and hover highlight on the region figures.
- `Hero` (map overview): the scroll hint.

## Limits and risks

- Wheel zoom without Ctrl is gone; zoom is still available by Ctrl+wheel, pinch, and keys, but it is no longer the first thing a mouse does. Zoom is a nicety here, navigation is not.
- On touch, a vertical swipe still pans the map; the Start pill and the Next/Previous controls carry navigation. Sections cannot be advanced by swipe.
- Trackpad inertia and mouse-wheel notches differ widely; the lock and thresholds are conservative and need a pass on a real trackpad and a real wheel mouse.
- Verification is scripted wheel events in headless Chrome; a physical trackpad and phone have not been used.

## Testing

Unit: `stepFrom` over the whole sequence and at both ends; `createWheelStepper` (threshold, one step per gesture, lock until quiet, reset). Component: plain wheel steps and a second event inside the lock does not; Ctrl+wheel zooms; `PageDown`; the Start pill; hover shows the title and sets the cursor; panel Previous/Next names and clicks, no Next on Contact, panel scrolls to top and focus moves on a step; overscroll at the end steps, in the middle does not. Browser (headless Chrome): wheel from the overview to About, a second wheel inside the lock ignored, overscroll at the bottom of About to Skills, Start pill, Next/Previous, hover title, pulse varies before the first touch and stops after.
