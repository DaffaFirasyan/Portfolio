---
name: Daffa Firasyan Portfolio
description: Night Passport. A calm reading column under a fixed canvas night sky; by day the same tokens become a printed star chart.
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

**Creative North Star: "Night Passport"**

A single calm reading column is laid over a fixed canvas sky. The page is a passport read top to bottom: the hero is the data page, every later section is a page of evidence with a stamp slot at its foot. At night (the default of the palette) the stars are light dots on deep blue ink; in daylight the same tokens become a printed star chart, dark dots on cool paper. Components never name a mode; they use semantic tokens and `src/index.css` swaps the values behind them with `prefers-color-scheme`.

The reading layer is quiet on purpose: hairlines instead of boxes, no cards, one amber accent, type doing the hierarchy. The sky does the atmosphere and the stamps do the delight, and neither is required to read anything.

**Key Characteristics:**
- Twelve-column grid, 1120px measure: title in the left four columns, evidence in the right eight.
- Hairlines (1px, edge colour) carry structure. The `.plate` frame keeps crosshair corners as star-chart registration marks.
- One accent (amber by night, burnt amber by day), used sparingly and always semantically.
- Fraunces for the name and section titles, Geist for reading, JetBrains Mono for credit-row labels, coordinates and the machine line.
- Motion is CSS plus one canvas loop; every moving thing has a still state.

## Colors

A deep night-blue ground with pale lavender ink and a single warm star, inverted by day to cool paper, navy ink and a burnt amber seal. Values live in the frontmatter (the unsuffixed names are day, the `-night` names are the dark scheme); the prose names them only.

### Primary
- **Star Amber / Burnt Amber** (`seal`, `seal-night`): the single accent. Links, the active skill, the current nav item, the CV button, earned stamps, constellation lines, the dawn band, focus outline and selection tint. Button text on it is `on-seal`.

### Neutral
- **Night Ink / Cool Paper** (`ground`, `ground-night`): page ground and the fixed header.
- **Chart Tint** (`surface`, `surface-night`): plates, dialog body.
- **Elevated Tint** (`elevated`, `elevated-night`): defined as a token; reserved for raised surfaces.
- **Hairline** (`hair`, `hair-night`): every rule, border, field underline and scrollbar.
- **Ink** (`ink`, `ink-night`): headings and primary text.
- **Muted Ink** (`muted`, `muted-night`): secondary text, labels, unearned stamps, registration crosshairs.
- **Danger** (`danger`, `danger-night`): form errors only.

### Named Rules
**The One Star Rule.** There is one accent. Never add a second hue; state differences are expressed with ink, muted, weight and underline.

**The 4.5 Rule.** Every text pair is checked by `src/lib/contrast.test.ts`, which reads `src/index.css` and fails under 4.5:1 in both schemes. Check a new pair there before using it.

**The Semantic Rule.** Components use `bg-void`, `text-primary`, `text-muted`, `border-edge`, `bg-surface`, `text-accent`, `text-on-accent`. No hex values and no `dark:` classes in components. Canvas code reads tokens through `cssToken`, because canvas ignores `var()`.

## Typography

**Display Font:** Fraunces Variable (Georgia, serif)
**Body Font:** Geist Variable (system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono Variable (ui-monospace, monospace)

**Character:** A soft, optical serif for the name and the section titles sits over a plain grotesque for reading, with mono as the clerk's hand on the credit rows.

### Hierarchy
- **Display** (400, clamp(3.25rem, 10vw, 8rem), 0.95): the owner's name in the hero, one word per line. The only h1.
- **Headline** (400, 2.25rem to 3rem, 1.08, -0.02em): section titles (Fraunces), balanced, sticky in the left columns from `lg`. The passport sheet title is a smaller Fraunces step (1.875rem).
- **Title** (500, 1.125rem to 1.5rem): project and paper titles in Geist.
- **Lead** (400, 1.25rem to 1.5rem): hero role line and the About opening statement, capped near 40ch.
- **Body** (400, 1rem, 1.5): reading text, 62ch maximum; secondary paragraphs in muted.
- **Label** (400, 0.75rem, 0.14em tracking, uppercase, mono): credit-row labels (location, status, arrival), stamp captions, the passport chip (without uppercase), the machine line (no tracking).

### Named Rules
**The Clerk's Hand Rule.** Mono is for data: labels, coordinates, counts, the machine line. It is never used for headings or running text.

**The Two Voices Rule.** The serif speaks only the name and section titles. Everything under a title is Geist.

## Layout

A 1120px centred measure with 24px gutters (40px from `md`). Sections share one template: a hairline across the top, then twelve columns from `lg` with a 40px column gap, title in four columns and evidence in eight, 80px (112px from `md`) of space beneath. Below `lg` the columns stack. The hero is a single column with a 46rem data-page plate under the name; its grid is a 14rem photo slot beside the credit rows from `sm`. Fixed header is 56px tall. Interactive targets are 44px minimum height, with the nav links and skill chips allowed 32 to 36px where they are inline text. No horizontal overflow from 320 to 1440px.

### Named Rules
**The One Template Rule.** Every section uses the same shell. A new section reuses it rather than composing a new layout.

## Elevation & Depth

Flat. There are no box shadows. Depth is a stack of three things: the fixed canvas sky behind everything (`-z-10`), the paper-coloured column over it, and hairlines. The hero plate uses `surface` at 70% opacity so stars faintly show through; project plates are solid `surface`. Dialogs use a `ground` backdrop at 80%. The passport chip and header sit on solid `ground`.

### Named Rules
**The No Shadow Rule.** Separation is a hairline or a tint, never a shadow.

## Shapes

Square by default: plates, fields, dialogs and the photo slot are right-angled (0). Only actions and the passport chip are fully round pills (9999px). Stamps are circles with a dashed ring when empty and a solid ring plus inner ring when earned. The `.plate` frame is a 1px hairline with a 17px registration crosshair standing 8px outside each corner.

## Components

### Buttons
- **Shape:** full pill, 44px high, 20px horizontal padding, 14px medium text.
- **Primary (CV, form submit, passport email):** `seal` fill, `on-seal` text; hover drops opacity to 0.9.
- **Pill (email, view projects):** transparent, 1px hairline border, ink text; hover turns the border to ink.
- **Text links:** accent, medium weight, underlined with 4px offset; the hover sweep (`.sweep`) draws a 2px underline from the left.
- **Focus:** 2px accent outline, 3px offset, on every element.

### Navigation
Fixed 56px bar on `ground` with a hairline beneath: short name left, section links centre, language toggle and the CV link (accent, underlined) right. The current section is ink with a 2px accent underline. Below `lg` a Menu pill opens a plain disclosure.

### Plate (signature)
A hairline frame with crosshair corners, `surface` at 70%. Holds the hero data page and the project images. The hero plate carries the portrait (3:4, 224px wide), two ruled credit rows, an Arrival stamp slot and a decorative mono machine line (`P<NAME<<<...`, aria-hidden) under a hairline.

### Stamp (signature)
An SVG circle: dashed muted ring when empty; accent double ring, the section name set around the ring in mono and the owner's initials in the centre when earned. Resting tilt is -9deg. Decorative and aria-hidden; its state is also stated in words beside it. Ten stamps: seven sections and three secrets (Comet, Language, Reach). A section stamp is earned by being in a band across the screen centre for 5 seconds in total and then scrolling past it. Earned ids persist in localStorage. Nothing is gated behind a stamp.

### Passport chip and sheet
A fixed bottom-right pill ("Passport n/10", mono) opens a dialog on `surface`: the ten stamps in a grid (secrets are hinted until earned), a closing note and email button once all seven section stamps are in, and a sound checkbox. The click sound is WebAudio, a single oscillator, off by default. A full ten-stamp passport writes the owner's initials in stars on the sky.

### Sky
A fixed canvas of 150 stars in three parallax layers that drift with scroll, yield to the pointer, twinkle, and join into a project's constellation (accent line, 3px nodes) when a skill that project used is hovered. A flat amber dawn band tints the bottom 45% and strengthens (up to 14% alpha) with scroll progress. A comet crosses every 30 to 40 seconds after the first 15; clicking it earns the Comet stamp.
- **Tiers:** full, lite (half the stars, 30fps, no trail, no comet), still (one frame, redrawn on change). Chosen from the median drawing work of the first 60 drawn frames (over 8ms steps down one tier, never back up; the gap between frames is not measured, so a 30Hz power-saver is not demoted); save-data starts at lite; reduced motion starts at still. It stops in a hidden tab.

### Fields
Underline only: transparent, no radius, 1px hairline bottom border turning ink on focus, 44px minimum height, muted placeholder, muted label above. Errors in `danger` beneath.

### Motion
Colour and opacity transitions only, plus two CSS animations behind `prefers-reduced-motion: no-preference`: the stamp press (0.7s, cubic-bezier(0.2, 0.8, 0.2, 1), rotate and translate and scale from above) and the hairline draw-in above each section (scroll-driven, `animation-timeline: view()`, only where supported). The `.sweep` underline carries `transition: none` under reduce. No animation library and no JavaScript that reads the reduced-motion setting, other than the sky's own tier choice.

## Do's and Don'ts

### Do:
- **Do** use semantic colour utilities only, and add any new text pair to the contrast test.
- **Do** reach for a hairline before a box, and a tint before a shadow.
- **Do** reuse `SectionShell` for any new section and keep title left, evidence right.
- **Do** keep the accent for links, the active item, the CV button, stamps and constellation lines.
- **Do** give anything that moves a still state and a `motion-reduce` or `no-preference` guard.
- **Do** keep everything readable without a stamp, the sky, sound or the passport.

### Don't:
- **Don't** add a second accent colour, a card, or a drop shadow.
- **Don't** write a hex value or a `dark:` class in a component.
- **Don't** set body or label text in the serif, or headings in mono.
- **Don't** make a stamp, the comet or the passport a gate on content.
- **Don't** add an animation library; the sky is one canvas and one loop.

### Departures and defects carried by the build (recorded, not rules)
These are deliberate departures or known defects. They are not patterns for future surfaces to copy.
- **Dawn band.** A flat accent gradient tint across the lower sky, growing with scroll. It is a decoration of the world, not a general permission for gradient washes.
- **Stars behind text.** Stars sit under body copy at low alpha (at most 0.55, times 0.55 by day). axe-core reports 8 color-contrast nodes as incomplete because the background is a canvas; legibility was judged by eye, not proven by the tool.
- **Comet is full-tier only.** In lite and still tiers (including reduced motion) the comet never appears, so those readers cannot earn the Comet stamp or the ten-stamp reward. Known inequity; not resolved.
- **Accent use is broad** (links, active skill, CV button, stamps, constellation lines, dawn band); it stays one hue but is less rare than a strict one-voice rule would ask.
- **Project tiles dim to 40% opacity** when a skill filter excludes them; a low-contrast transient state.
