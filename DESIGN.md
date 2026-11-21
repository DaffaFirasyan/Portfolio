---
name: Daffa Firasyan Portfolio
description: Star Map. The sky is the page: six constellations open six sections in a panel; a Reading mode keeps the passport column. By day the same tokens become a printed star chart.
colors:
  ground: "#eef1f7"
  surface: "#e1e6f1"
  elevated: "#d6dcea"
  hair: "#b9c0d4"
  ink: "#11162b"
  muted: "#4a5272"
  seal: "#8a4b00"
  on-seal: "#eef1f7"
  danger: "#b3261e"
  ground-night: "#0c1022"
  surface-night: "#151a33"
  elevated-night: "#1d2342"
  hair-night: "#2c3358"
  ink-night: "#eef0ff"
  muted-night: "#a3a9c9"
  seal-night: "#f2c14e"
  on-seal-night: "#0c1022"
  danger-night: "#ff8a80"
typography:
  display:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "clamp(3.25rem, 10vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  display-map:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "clamp(2.75rem, 8vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.375
  lead:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "0.14em"
rounded:
  none: "0"
  full: "9999px"
spacing:
  gutter: "24px"
  gutter-md: "40px"
  column-gap: "40px"
  section-bottom: "80px"
  section-bottom-md: "112px"
  panel-width: "720px"
  panel-gutter: "24px"
  bar: "56px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.seal}"
    textColor: "{colors.on-seal}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  mode-switch:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  region-label:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "44px"
  map-panel:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "720px"
  passport-chip:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  plate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "44px"
---

# Design System: Daffa Firasyan Portfolio

## Overview

**Creative North Star: "Star Map"**

By default the sky is the page. A fixed canvas of stars is a map you move across: drag it, zoom it, and six constellations, one per section, wait on a ring. Choosing one flies the camera there and opens that section in a panel beside it. A switch in the top bar turns the same content into Reading mode, the earlier "Night Passport" column: a passport read top to bottom, the data page first, each section a page of evidence with a stamp slot at its foot. At night the stars are light dots on deep blue ink; in daylight the same tokens become a printed star chart, dark dots on cool paper. Components never name a mode of colour; they use semantic tokens and `src/index.css` swaps the values behind them with `prefers-color-scheme`.

The reading layer stays quiet on purpose: hairlines instead of boxes, no cards, one amber accent, type doing the hierarchy. The sky does the atmosphere, the map does the wayfinding and the stamps do the delight, and none of them is required to read anything: every section is reachable by plain buttons, the URL hash, or Reading mode.

**Key Characteristics:**
- Two modes over one set of sections: Star map (default) and Reading mode. The choice persists in `localStorage` (`daffa_view`); with no 2D canvas the page is always Reading.
- Map: six constellations on a ring in a 3000 x 2000 world, a 720px drawer on the right from 1024px wide (a full sheet below), the Hero title block laid over the sky as the overview.
- Reading: twelve-column grid, 1120px measure, title in the left four columns, evidence in the right eight.
- Hairlines (1px, edge colour) carry structure. The `.plate` frame keeps crosshair corners as star-chart registration marks.
- One accent (amber by night, burnt amber by day), always semantic.
- Fraunces for the name and section titles, Geist for reading, JetBrains Mono for labels, coordinates, region names and the machine line.
- Motion is CSS plus one canvas loop; every moving thing has a still state.

## Colors

A deep night-blue ground with pale lavender ink and a single warm star, inverted by day to cool paper, navy ink and a burnt amber seal. Values live in the frontmatter (unsuffixed names are day, `-night` names are the dark scheme); the prose names them only. The palette is unchanged by the map.

### Primary
- **Star Amber / Burnt Amber** (`seal`, `seal-night`): the single accent. Links, the active skill, the current nav item, the CV button, earned stamps, the focus outline and selection tint, the dawn band, and in Map mode the open region's constellation and any project figure that is lit or traced. Button text on it is `on-seal`.

### Neutral
- **Night Ink / Cool Paper** (`ground`, `ground-night`): page ground, the fixed header, the map panel, region labels (at 80%).
- **Chart Tint** (`surface`, `surface-night`): plates, dialog body.
- **Elevated Tint** (`elevated`, `elevated-night`): defined as a token; reserved for raised surfaces.
- **Hairline** (`hair`, `hair-night`): every rule, border, the panel's left edge, field underline and scrollbar.
- **Ink** (`ink`, `ink-night`): headings, primary text, and the stars and idle constellations themselves.
- **Muted Ink** (`muted`, `muted-night`): secondary text, labels, the map hint, unearned stamps, registration crosshairs.
- **Danger** (`danger`, `danger-night`): form errors only.

### Named Rules
**The One Star Rule.** There is one accent. Never add a second hue; state differences are expressed with ink, muted, weight and underline. On the map "state" is the accent: the open region, a lit or traced figure.

**The 4.5 Rule.** Every text pair is checked by `src/lib/contrast.test.ts`, which reads `src/index.css` and fails under 4.5:1 in both schemes. Check a new pair there before using it.

**The Semantic Rule.** Components use `bg-void`, `text-primary`, `text-muted`, `border-edge`, `bg-surface`, `text-accent`, `text-on-accent`. No hex values and no `dark:` classes in components. Canvas code reads tokens through `cssToken`, because canvas ignores `var()`.

## Typography

**Display Font:** Fraunces Variable (Georgia, serif)
**Body Font:** Geist Variable (system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono Variable (ui-monospace, monospace)

**Character:** A soft, optical serif for the name and the section titles sits over a plain grotesque for reading, with mono as the clerk's hand on labels and region names.

### Hierarchy
- **Display** (400, clamp(3.25rem, 10vw, 8rem), 0.95): the owner's name in Reading mode, one word per line. The only h1.
- **Display, map** (400, clamp(2.75rem, 8vw, 6rem), 0.95): the same h1 as the overview title block over the sky.
- **Headline** (400, 2.25rem to 3rem, 1.08, -0.02em): section titles (Fraunces), balanced; sticky in the left columns from `lg` in Reading mode, a plain heading at the top of the panel column in Map mode. The passport sheet title is a smaller Fraunces step (1.875rem).
- **Title** (500, 1.125rem to 1.5rem): project and paper titles in Geist.
- **Lead** (400, 1.25rem to 1.5rem): hero role line and the About opening statement, capped near 40ch. In the overview the role line is 1.125rem, 1.5rem from `md`.
- **Body** (400, 1rem, 1.5): reading text, 62ch maximum; secondary paragraphs in muted.
- **Label** (400, 0.75rem, 0.14em tracking, uppercase, mono): credit-row labels, stamp captions, region-label buttons, the map hint line; the passport chip (without uppercase), the machine line (no tracking).

### Named Rules
**The Clerk's Hand Rule.** Mono is for data: labels, coordinates, counts, region names, the machine line. It is never used for headings or running text.

**The Two Voices Rule.** The serif speaks only the name and section titles. Everything under a title is Geist.

## Layout

**Reading mode.** A 1120px centred measure with 24px gutters (40px from `md`). Sections share one template: a hairline across the top, then twelve columns from `lg` with a 40px column gap, title in four columns and evidence in eight, 80px (112px from `md`) of space beneath. Below `lg` the columns stack. The hero is a single column with a 46rem data-page plate under the name; its grid is a 14rem photo slot beside the credit rows from `sm`.

**Map mode.** The page is one non-scrolling screen (body overflow hidden). Under the 56px fixed bar, the canvas fills the viewport with a full-screen gesture surface above it. Six constellations sit on a ring round the middle of the world (about 400 to 480 world units out, starting at the top, 60 degrees apart). The overview camera fits them all and, from 1024px wide, pushes the ring to the right of the title block. The open section sits in a panel fixed to the right edge, below the bar: 720px wide from `lg`, the full width below. The panel is a single compact column (24px side padding, hairline on the left edge) with a sticky back bar at its top; sections stay mounted and are `hidden` unless open. Opening a region centres its constellation in the part of the screen the panel leaves free. Projects is fitted to the free width (zoom up to 1.6) so the four project figures stand beside the panel.

**Both.** Fixed bar is 56px tall. Interactive targets are 44px minimum height, with the nav links, skill chips and the mode switch allowed 32 to 36px where they are inline text. No horizontal overflow from 320 to 1440px in either mode.

### Named Rules
**The One Template Rule.** Every section uses the same `SectionShell`; a new section reuses it, and it renders as the Reading column or the panel column from the mode alone.

## Elevation & Depth

Flat. There are no box shadows. Depth is a stack: the fixed canvas sky behind everything (`-z-10`), the gesture surface and region labels, the overview title block (z-10, pointer-events off except its buttons), the panel (z-30) with a hairline edge, and the bar (z-40). The panel slides in with a 300ms transform transition. The Reading hero plate uses `surface` at 70% so stars faintly show through; project plates are solid `surface`. Dialogs use a `ground` backdrop at 80%. The passport chip and header sit on solid `ground`.

### Named Rules
**The No Shadow Rule.** Separation is a hairline or a tint, never a shadow.

## Shapes

Square by default: plates, fields, dialogs, the panel and the photo slot are right-angled (0). Actions, the mode switch, region labels and the passport chip are fully round pills (9999px). Stamps are circles with a dashed ring when empty and a solid ring plus inner ring when earned. The `.plate` frame is a 1px hairline with a 17px registration crosshair standing 8px outside each corner. A constellation is a polyline of 6 stars (a seeded random walk, the same for the same id) with 1px lines and 2.4px dots; a project figure has 4 stars and 3px dots.

## Components

### Buttons
- **Shape:** full pill, 44px high, 20px horizontal padding, 14px medium text.
- **Primary (CV, form submit, passport email):** `seal` fill, `on-seal` text; hover drops opacity to 0.9.
- **Pill (email, view projects):** transparent, 1px hairline border, ink text; hover turns the border to ink.
- **Text links:** accent, medium weight, underlined with 4px offset; the hover sweep (`.sweep`) draws a 2px underline from the left.
- **Focus:** 2px accent outline, 3px offset, on every element.

### Navigation
Fixed 56px bar on `ground` with a hairline beneath: short name left, section links centre, then the mode switch, language toggle and the CV link (accent, underlined) right. The current section is ink with a 2px accent underline; in Map mode the current item follows the open region (the overview counts as Home) and the links are plain hash links that open the region. The mode switch is a hairline pill labelled "Star map" or "Reading mode" (the name of the mode it goes to), 36px high, hidden when there is no canvas. Below `lg` the centre links and the switch collapse into a Menu pill that opens a plain disclosure; the switch, CV and email sit at its foot.

### Map surface and region labels (signature)
The gesture surface turns a drag into panning with a coast, the wheel and a two-finger pinch into zooming about the pointer (zoom 0.2 to 3), a tap on a figure into opening it, and arrow keys, `+`/`-` and `0` (back to the overview) into the same from the keyboard. Each constellation also has a real button under it: mono, uppercase, 0.14em tracking, on a `ground` pill at 80%, 44px high, 12px side padding, named by its section. Labels take focus and bring their figure into view if it is off screen, and are inert while a panel is open. Closing the panel returns focus to the label that opened it. A drag that moved never counts as a click.

### Map panel
A drawer on `ground` with a hairline left edge, sliding from the right (300ms, none under reduced motion). It opens with focus on its sticky back bar ("Back to the sky", underlined text button); Escape and the browser Back button close it, except while a certificate dialog is open, which keeps Escape. The open region lives in the URL hash (`#about` ... `#contact`), so a link, a reload and Back all work. The About panel opens with the passport data page. Leaving the map with a panel open lands the reader on that section in Reading mode.

### Plate (signature)
A hairline frame with crosshair corners, `surface` at 70%. Holds the passport data page and the project images. The data page carries the portrait (3:4, 224px wide), two ruled credit rows, an Arrival stamp slot and a decorative mono machine line (`P<NAME<<<...`, aria-hidden) under a hairline. It is shown in the Hero in Reading mode and at the top of the About panel in Map mode.

### Stamp (signature)
An SVG circle: dashed muted ring when empty; accent double ring, the section name set around the ring in mono and the owner's initials in the centre when earned. Resting tilt is -9deg. Decorative and aria-hidden; its state is also stated in words beside it. Ten stamps: Home, six sections and three secrets (Comet, Language, Reach). In Reading mode a section stamp is earned by being near the screen centre for 5 seconds in total and then scrolling past. In Map mode a region is stamped once its panel has been open 5 seconds in total and the reader then leaves it (closes, opens another, or switches mode); the overview counts as Home. Earned ids persist in localStorage. Nothing is gated behind a stamp.

### Passport chip and sheet
A fixed bottom-right pill ("Passport n/10", mono) opens a dialog on `surface`: the ten stamps in a grid (secrets are hinted until earned), a closing note and email button once all section stamps are in, and a sound checkbox. The click sound is WebAudio, a single oscillator, off by default. A full passport writes the owner's initials in stars on the sky.

### Sky
A fixed canvas of 150 stars in three parallax layers. In Reading mode they drift with scroll, yield to the pointer, twinkle, and join into a project's constellation (accent line, 3px nodes) when a skill that project used is hovered; a flat amber dawn band tints the bottom 45% and strengthens (up to 14% alpha) with scroll progress; a comet crosses every 30 to 40 seconds after the first 15, and clicking it earns the Comet stamp. In Map mode the stars are placed through the camera (parallax 1, 0.55, 0.25 by layer), the six constellations are drawn in ink at 50% alpha (the open one in accent at 90%), and the camera is stepped in the same loop. With the Projects panel open, that region's own figure gives way to one faint figure per project (four, on a ring of 170 world units): ink at 35% line and 50% dots, all accent when a skill that project used is hovered or focused, accent up to the star reached while traced. Dragging from a figure's first star through the rest in order, or tapping any of its stars, scrolls that project's card into view; the trace is a flourish, and the card is also reachable by plain scrolling.
- **Camera:** a flight lasts 650ms (ease-in-out, zoom interpolated geometrically); a drag leaves a coast that decays over about 220ms from at most 2.5 px/ms, so a hard flick carries the sky roughly its own length again and no further. The still tier has neither: the camera cuts and the sky paints on demand.
- **Tiers:** full, lite (half the stars, 30fps, no trail, no comet), still (one frame, redrawn on change). Chosen from the median drawing work of the first 60 drawn frames (over 8ms steps down one tier, never back up; the gap between frames is not measured, so a 30Hz power-saver is not demoted); save-data starts at lite; reduced motion starts at still. It stops in a hidden tab.

### Fields
Underline only: transparent, no radius, 1px hairline bottom border turning ink on focus, 44px minimum height, muted placeholder, muted label above. Errors in `danger` beneath.

### Motion
Colour and opacity transitions only, plus two CSS animations behind `prefers-reduced-motion: no-preference`: the stamp press (0.7s, cubic-bezier(0.2, 0.8, 0.2, 1), rotate and translate and scale from above) and the hairline draw-in above each section (scroll-driven, `animation-timeline: view()`, only where supported). The panel slide carries `motion-reduce:transition-none`; the `.sweep` underline carries `transition: none` under reduce; programmatic card scrolling is `auto` instead of `smooth` when the sky is still. No animation library; the only JavaScript that reads the reduced-motion setting is the sky's own tier choice.

## Do's and Don'ts

### Do:
- **Do** use semantic colour utilities only, and add any new text pair to the contrast test.
- **Do** reach for a hairline before a box, and a tint before a shadow.
- **Do** reuse `SectionShell` for any new section and add its id to the map's regions so it gets a constellation and a label button.
- **Do** keep the accent for links, the active item, the CV button, stamps, and lit or open constellations.
- **Do** give anything that moves a still state and a `motion-reduce` or `no-preference` guard, and make any new sky effect droppable by the lite and still tiers.
- **Do** keep everything readable and reachable without a stamp, the sky, sound, the passport, a pointer or the trace gesture.

### Don't:
- **Don't** add a second accent colour, a card, or a drop shadow.
- **Don't** write a hex value or a `dark:` class in a component.
- **Don't** set body or label text in the serif, or headings in mono.
- **Don't** make a stamp, the comet, the passport or a map gesture a gate on content.
- **Don't** add an animation library; the sky is one canvas and one loop.

### Departures and defects carried by the build (recorded, not rules)
These are deliberate departures or known defects. They are not patterns for future surfaces to copy.
- **Region labels sit on a `bg-void/80` pill** over the stars, so the label text has a near-solid ground. A translucent plate, not a precedent for tinted boxes elsewhere.
- **Stars behind overview text.** The overview title block has no panel behind it; stars sit under it at low alpha. axe-core lists one color-contrast item as incomplete because the background is a canvas; legibility was judged by eye, not proven by the tool. The same applies to Reading-mode body copy (at most 0.55 alpha, times 0.55 by day).
- **The overview thins on phones.** Below `md` it drops the tagline and the CV and email buttons; they stay in the Menu.
- **Accent use is broad** (links, active skill, CV button, stamps, constellation lines, dawn band, and now the open region and lit or traced figures); it stays one hue but is less rare than a strict one-voice rule would ask.
- **Comet is full-tier only.** In lite and still tiers (including reduced motion) the comet never appears, so those readers cannot earn the Comet stamp or the ten-stamp reward. Known inequity; not resolved.
- **Touch gestures are unproven on a device.** Pinch and drag were exercised only with scripted pointer events, never a physical phone.
- **Project tiles dim to 40% opacity** when a skill filter excludes them; a low-contrast transient state.
