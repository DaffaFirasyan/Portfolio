# Night Passport — design spec (redesign round 5)

Status: awaiting owner review. Branch to create: `redesign/night-passport`.
Supersedes the design-plate look (`redesign/design-plate`), not its structure.

## Why

The owner wants a portfolio that is not boring and that gets better the longer it is read, different from other portfolios, with heavy animation allowed provided it does not weigh on any device. Rounds 1–4 were rejected as too plain (rail), then too busy (board, signage). Decision: **the reading surface stays calm; all of the spectacle lives in a sky behind it, and a passport turns reading into a collection.**

Answers fixed by the owner: concept = Passport (C) with a star sky (B) behind it; look = replace the design-plate look entirely; devices = automatic adaptation; sound = optional, off by default; stamp trigger = visible 5 s and scrolled past; palette = night indigo + amber.

## Kept without change

Seven sections (Home, About, Skills, Experience, Projects, Education, Contact), EN/ID toggle, all copy in `src/data/` and `src/data/i18n/`, project category filter, certificate filter and dialog, skill-to-project highlight, contact form, light/dark following the device, `Konten_Asli/` rule, the avatar rules in `CLAUDE.md`.

## 1. World

A traveller at an observation post at night. The hero is the **data page of a passport**: portrait in the photo slot (existing 240×320 `srcSet` image), name, role, location, status. Each section ends in an empty dashed stamp ring that fills when the section is read.

| Token | Dark (night) | Light (star chart) |
|---|---|---|
| ground | `#0c1022` | pale blue-grey chart paper, ≈ `#eef1f7` |
| ink | blue-white, ≈ `#eef0ff` | deep indigo, ≈ `#11162b` |
| muted | to be computed ≥ 4.5:1 | to be computed ≥ 4.5:1 |
| accent | amber "stamp ink", ≈ `#f2c14e` | darker amber, computed ≥ 4.5:1 on ground |

Exact values are computed and recorded in `DESIGN.md` during the build; none are accepted unchecked. One accent only (`text-accent`), semantic tokens only, no hex and no `dark:` in components.

Type: a serif display face for name and section titles, Geist for reading, mono for coordinates and dates. Final serif chosen in the build from `@fontsource-variable` packages after checking `npm view`.

Structure: one centred reading column, hairlines instead of boxes, no cards, no ribbons. No blur, no glow, no shadow. Stars are flat dots and hairlines.

## 2. Sky (canvas 2D, fixed behind the page)

- About 150 stars in three depth layers; scroll moves the layers at different rates.
- Pointer or touch: nearby stars drift away gently; a short dust trail follows the pointer (full tier, fine pointers only).
- Constellations: each project owns a constellation made from the stars of its `relatedProjectIds` skills. Hovering or focusing a skill draws the lines of every project using it and the matching project lights up in the list (reuses `SkillHighlight`).
- Dawn: horizon brightens with scroll progress, reaching dawn at Contact.
- Shooting star: one every 30–40 s; clicking it earns a secret stamp.
- Canvas is `aria-hidden`, `pointer-events: none` except the shooting star's hit target, which is a real focusable button offscreen-labelled for keyboard users.

## 3. Passport

- Chip fixed at a corner: "3/10". It opens the passport sheet (existing `Dialog`).
- **Seven section stamps.** A section earns its stamp when it has been at least 5 s in view **and** the reader has scrolled past it (its bottom edge has crossed above the viewport centre). Fast scrolling earns nothing.
- **Three secret stamps:** catch the shooting star, switch language, open the CV or copy the email.
- **Stamp effect:** CSS press (reusing the `press` keyframes idea), a short `navigator.vibrate` where available, and an optional sound.
- **Rewards:** 7 stamps reveal a closing note from the owner and promote the contact call to action. 10 stamps draw a constellation of the owner's initials in the sky.
- **No gating.** Every word and the contact path are available without any stamp. Stamps add, never hide.
- Progress is stored in `localStorage` inside `try/catch`, as an array of stamp ids. No personal data. The page renders correctly when storage is unavailable.
- Earning a stamp is announced in an `aria-live="polite"` region.
- Copy for every stamp and message lives in `src/data/i18n/` (EN and ID).

## 4. Weight policy (hard limits)

- Tiers: **full**, **lite** (half the stars, 30 fps, no trail), **still** (one frame, redrawn on resize and theme change).
- Selection: median frame time of the first 60 frames above 24 ms drops one tier; `prefers-reduced-motion` goes straight to still; `navigator.connection.saveData` starts at lite. A tier never moves back up within a visit.
- Loop pauses when the canvas is offscreen (IntersectionObserver) or the tab is hidden; device pixel ratio capped at 2.
- No WebGL, no animation library, no vendored kit. JS stays under about 100 KB gzip. CSS animations stay behind `@media (prefers-reduced-motion: no-preference)` or `motion-reduce:`.
- Sound: WebAudio oscillators created on first user opt-in (no files), off by default, toggle inside the passport sheet, remembered in `localStorage`.
- Targets, measured as the median of three production-build runs: Lighthouse mobile Performance ≥ 90, desktop ≥ 95, Accessibility / Best Practices / SEO 100; axe-core clean in dark, light, tablet and phone; no horizontal overflow from 320 to 1440 px; frame time of the full tier measured in the browser.

## 5. Structure

```
src/sky/        engine.ts (pure: seeded stars, layers, constellation paths, tier choice),
                SkyCanvas.tsx (canvas, loop, visibility, resize)
src/passport/   stamps.ts (ids, rules), PassportProvider.tsx (state + storage),
                useDwell.ts (5 s + scrolled-past), Passport.tsx (chip + sheet), sound.ts
```

- `App.tsx` mounts `SkyCanvas` once, behind the existing provider tree, and the passport chip.
- Each `SectionShell` gets a stamp slot at its end and reports its element to `useDwell`.
- `src/index.css` gets the new tokens; the plate classes (`.plate`, `.stamp`, `.rule`, `.sweep`) are replaced or removed as the new look requires.
- Documents to update with the build: `DESIGN.md`, `.impeccable/design.json`, `CLAUDE.md` (motion rule becomes "CSS and one canvas 2D sky, no libraries"), `HANDOFF.md`, memory index.

## 6. Testing

- Unit: seeded star generation is deterministic; tier choice for slow frames, reduced motion and saveData; constellation paths for a project; stamp rules (dwell without scroll earns nothing, scroll without dwell earns nothing, both earn once, no duplicates); storage failure leaves the page working.
- Component: passport chip count, sheet contents, live-region announcement, reward at 7 and 10, language toggle earns its secret stamp, EN/ID strings.
- Existing suites updated where they encode the plate look. `npm test`, `tsc`, lint and the design detector must pass.
- Browser (before calling anything done): screenshots in dark and light at phone and desktop, console clean, frame time sampled, Lighthouse and axe as above.

## Out of scope

WebGL or 3D, audio files, gyroscope tilt, server-side counters or analytics, leaderboards, anything that hides content behind progress, new sections.

## Risks and open items

- Round five after two "too plain / too busy" verdicts: the mitigation is a calm reading column with one accent; if it still feels busy, dim the sky, not the structure.
- The design-plate work is still uncommitted on `redesign/design-plate`. The owner commits it before this branch is cut, otherwise the new branch starts from an uncommitted tree.
- Merging to `main` redeploys the live site; the owner decides when.
- Not yet checked on a physical phone.
