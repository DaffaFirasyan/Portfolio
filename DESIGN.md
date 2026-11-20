---
name: Daffa Firasyan Portfolio
description: A printed plate section on warm paper: hairlines, one grotesque, one vermilion seal.
colors:
  ground: "#f6f3ec"
  surface: "#ede9df"
  elevated: "#e6e1d5"
  hair: "#cbc5b8"
  ink: "#1b1a17"
  muted: "#5c584f"
  seal: "#b0351b"
  on-seal: "#f6f3ec"
  danger: "#b3261e"
  ground-night: "#151412"
  surface-night: "#1e1c19"
  elevated-night: "#26231f"
  hair-night: "#38342e"
  ink-night: "#ede9e0"
  muted-night: "#a49e92"
  seal-night: "#ee7152"
  on-seal-night: "#151412"
  danger-night: "#ff8a80"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 11vw, 8.5rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
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
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.14em"
rounded:
  none: "0"
  sm: "2px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  gutter: "40px"
  gutter-mobile: "24px"
  section-bottom: "112px"
  section-bottom-mobile: "80px"
  max-width: "1120px"
  nav-height: "56px"
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
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "44px"
  plate:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "16px"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Daffa Firasyan Portfolio

## Overview

**Creative North Star: "The Plate Section"**

The page reads like the plate section of a design annual: uncoated warm paper, a never-pure-black ink, and a hairline grid that carries everything. Every section has the same shape. A 1px rule draws across the top, the title takes the left four of twelve columns, the evidence takes the right eight. Type does the work: one grotesque at regular weight, enormous where it matters (the name) and quiet elsewhere. Content is separated by rules, not boxes.

Colour is paper, ink and a single vermilion seal. Light and dark both follow the device (`prefers-color-scheme`); components only use semantic tokens and never name a mode. The seal is the only chroma. There is one remembered moment, a round letterpress stamp that presses itself half onto the portrait plate once at load; everything else is still.

Rejected by the owner, and still the line: the previous departure-board world, with tiles everywhere, several colours and many things moving at once. Calm is the brief.

**Key Characteristics:**
- Hairline (1px) rules and credits tables instead of cards.
- Registration crosshairs mark the corners of image plates (hero portrait, project screenshots).
- One typeface for display, body and caption; mono only for labels.
- No shadows, no blur; depth is a tint change and a hairline.
- One moving thing at load (the stamp), plus a rule that draws in per section.

## Colors

Warm paper, bone-grey surfaces, near-black warm ink, one vermilion seal. The source documents every text pair as computed to 4.5:1 or better on ground and surface in both modes.

### Primary
- **Vermilion Seal** (`seal` #b0351b light, `seal-night` #ee7152 dark): the stamp, the focus ring, the primary action (CV button), the current nav link underline, the CV link, text links with a destination (repository, demo, DOI, verify credential), the active skill, the active certificate filter, and the date of a running role. It is also the text-selection tint at 28%.

### Neutral
- **Warm Paper** (`ground` #f6f3ec / `ground-night` #151412): page background, nav bar, dialog backdrop at 80%.
- **Bone Tint** (`surface` #ede9df / `surface-night` #1e1c19): the faint panel behind portraits, screenshots, certificate scans, form inputs, and the dialog.
- **Elevated Tint** (`elevated` #e6e1d5 / `elevated-night` #26231f): defined as a token; no shipped component uses it yet.
- **Hairline** (`hair` #cbc5b8 / `hair-night` #38342e): every rule, plate frame, input border, scrollbar thumb.
- **Warm Ink** (`ink` #1b1a17 / `ink-night` #ede9e0): headings, lead text, active states.
- **Quiet Ink** (`muted` #5c584f / `muted-night` #a49e92): body paragraphs, labels, captions, crosshairs, inactive links.
- **Seal Ground** (`on-seal` #f6f3ec / `on-seal-night` #151412): text on the seal fill.
- **Error Red** (`danger` #b3261e / `danger-night` #ff8a80): form errors only.

### Named Rules
**The One Seal Rule.** Chroma is the seal and nothing else. Never add a second hue, a gradient fill, or a tinted background.
**The Mode-Blind Rule.** Components use `bg-void`, `text-primary`, `border-edge` and the other semantic names; they never branch on light or dark. Only the values behind `--c-*` swap.

## Typography

**Display Font:** Geist Variable (system-ui, sans-serif)
**Body Font:** Geist Variable (system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono Variable (ui-monospace, monospace)

**Character:** One grotesque carries every role, so hierarchy comes from size, tracking and ink-versus-muted colour rather than from a second face. Display tightens hard (-0.045em) and is set at regular weight, like a title page.

### Hierarchy
- **Display** (400, clamp(3.5rem, 11vw, 8.5rem), 0.92, -0.045em): the name in the hero h1, one word per line. Only one on the page.
- **Headline** (400, 2.25rem rising to 3rem at md, 1.05, -0.03em): each section title, sticky in the left four columns from lg. The contact email is the same family at 1.875rem to 3rem (xl), -0.03em.
- **Title** (500, 1.5rem, -0.02em): project titles (lead project 1.875rem) and degree names. Role titles are 500 at 1.25rem; the dialog title is 400 at 1.875rem.
- **Lead** (400, 1.5rem, snug, 40ch): first About paragraph. The hero role line is 1.25rem to 1.5rem.
- **Body** (400, 1rem, muted, 62ch): paragraphs; denser evidence text runs at 0.875rem with relaxed leading.
- **Label** (mono, 11px, 0.14em, uppercase): credit-row labels (location, status), publication credit labels, project problem/solution/outcome captions. Experience dates and the dialog counter use mono at 0.75rem, not uppercase (a build departure; see Do's and Don'ts).

### Named Rules
**The One Grotesque Rule.** Display, body and caption are the same family. Mono never sits above a heading and never sets running text.
**The Medium-Is-Enough Rule.** Weight tops out at 500 for titles and links; 600 appears only on active toggles and a few buttons. Display and headlines stay at 400.

## Layout

A twelve-column grid inside a 1120px centred container, 40px column gap from lg, gutters of 24px (40px from md). Each section is a rule (full width), then title in 4 columns and evidence in 8. The hero is the exception: name, role, tagline, credits row and actions in 7 columns, the portrait plate in 5 aligned right, max 24rem wide. Sections end with 80px of space (112px from md); the hero opens with 112px (144px from md) to clear the 56px fixed nav. Anchored sections use a 56px scroll margin.

Below lg everything stacks: the plate drops under the name, section titles sit above their evidence and stop being sticky, the nav collapses to the short name plus a "Menu" pill that opens a plain disclosure (not a modal). Credits tables switch from a label column (9rem to 10rem) beside the value to stacked below sm. Project accounts are three columns from md. Certificates are 2, 3 and 4 columns at base, sm and lg. Breakpoints are Tailwind defaults: sm 640, md 768, lg 1024, xl 1280.

Rhythm is generous and uneven by role: rows in credits tables take 16px to 32px of vertical padding, evidence blocks are separated by 64px.

## Elevation & Depth

Flat. There are no shadows, no blur and no glass. Depth is one tint step (`surface` behind images, inputs and the dialog) plus a 1px hairline. The dialog sits over an 80% ground backdrop. Opacity is used for state only: a project dims to 40% while a hovered skill is not in it.

### Named Rules
**The Hairline Rule.** A 1px `hair` line is the only separator. If something needs emphasis, enlarge the type; do not box it or lift it.

## Shapes

Square is the default: plates, tables, rules and certificate mounts have no radius. Controls are pills (fully rounded, 1px hairline outline or seal fill). Form inputs are 8px, the status panel and the dialog are 12px, certificate scan images carry 2px.

The signature silhouette is the plate: a square hairline frame with registration crosshairs on its corners. The `.plate` class draws them as one pseudo-element extending 8px beyond the frame, built from eight 17px by 1px gradients in `muted`. The stamp is a circle: two concentric rings (radius 75 and 45 on a 160 viewBox) with the name, role and city around the outer ring in mono and the initials in the middle at weight 500, drawn in the seal colour.

## Components

### Buttons
- **Shape:** pill (9999px), minimum 44px tall, 20px side padding.
- **Primary:** seal fill, on-seal text, 0.875rem weight 500, used once in the hero (CV download, trailing arrow). Hover drops opacity to 90%.
- **Secondary (pill):** transparent, 1px hairline border, ink text; hover darkens the border to ink. Used for email and view-projects; the mobile Menu button is the same shape at 36px.
- **Text links:** seal-coloured, underlined with 4px offset, weight 500, trailing arrow for external destinations. Contact links are ink with an underline that turns seal on hover.
- **Focus:** a 2px seal outline at 3px offset on everything.

### Inputs / Fields
- **Style:** 1px hairline border, `surface` fill, 8px radius, 44px minimum height, 16px by 12px padding, muted placeholder. Labels above at 0.875rem weight 500 in muted.
- **Error:** message beneath in `danger` at 0.875rem; `aria-invalid` and `aria-describedby` wire it. Validation shows only after a field is left.
- **Outcome panel:** after sending, a 12px, hairline, surface panel above the form carries the status and takes focus.

### Navigation
Fixed 56px bar on ground with a hairline beneath. Short name left (1rem, weight 500). From lg the section links sit inline at 0.875rem, muted, ink for the current one with a 2px seal underline at 10px offset; the EN / ID toggle (active word underlined and semibold, inactive at 70% opacity) and the seal CV link follow. Below lg: the Menu pill and a disclosure list with 44px rows, closing on selection and Escape.

### Plate (signature)
The `.plate` hairline frame with corner crosshairs. In the hero it holds the portrait on `surface`, 3:4, with the stamp absolutely placed at the lower-left. In a project it holds the 16:10 screenshot with 12px (16px from sm) padding inside the frame. Under a project plate a hairline-topped caption row sets the title left and "category · year · role" right in muted, then problem, solution and outcome as three labelled columns, the stack as one ink line, and links.

### Stamp
The one moment. Press animation over 0.95s after a 0.45s delay: drops in from 20px above at -16deg and 1.18 scale, settles at -9deg. Transform and opacity only, once, and only under `prefers-reduced-motion: no-preference`. It is aria-hidden because all of its words exist as text elsewhere.

### Credits table
A `dl` or `ol` with a top hairline and a hairline under each row: label or date in the left column, content right. Used for the hero credits row (two cells), the publication, skills by category and the experience list. Skill names are buttons: muted at rest, seal and underlined while active, which lights the projects that use that skill.

### Dialog
Native `<dialog>` for certificate scans, 12px radius, `surface` fill, hairline border, `min(72rem, 92vw)` wide. Hairline-outlined pills for Previous, Next and Close; mono counter.

### Motion
- **The rule draws in** (`.rule`): scaleX 0 to 1 from the left as the section enters view, via scroll-driven `animation-timeline: view()` only where supported and only without a reduced-motion preference.
- **Sweep** (`.sweep`): a 2px underline growing from 0 to 100% over 0.3s ease-out on hover and focus; used on the contact email.
- Reduced motion is honoured in CSS blocks and through `useMotionAllowed()`; no component tests the media query itself.

## Do's and Don'ts

### Do:
- **Do** separate content with 1px `hair` rules and credits-table rows, not with boxes.
- **Do** put the title in the left four columns and the evidence in the right eight in every new section, using `SectionShell`.
- **Do** spend `seal` on the stamp, focus, the primary action, the current or active state and links that lead somewhere.
- **Do** use semantic tokens (`bg-void`, `text-primary`, `text-muted`, `border-edge`, `text-accent`) and let `--c-*` swap per mode.
- **Do** frame images in `.plate` on a `surface` tint, and set mono labels in uppercase at 11px with 0.14em tracking.
- **Do** keep touch targets at 44px minimum on primary controls.

### Don't:
- **Don't** add shadows, blur or glass, or a second chroma beside the seal.
- **Don't** set display type in anything but Geist at weight 400, and don't use the mono face for headings or running text.
- **Don't** wrap content in rounded cards or tiles; plates are square and hairline-framed.
- **Don't** add moving effects beyond the stamp press, the rule draw-in and the sweep; no parallax, marquees or hover glows.
- **Don't** import the departure-board world (dense tiles, yellow bands, multiple accent colours).

### Departures from the contract (recorded in the build, not canonized as rules)
- The contract limits the seal to the stamp, current link and primary action; the build also colours every outbound text link (DOI, repository, demo, CV in the bar), the active skill and the active certificate filter. The Do above records the reused pattern, which is wider than the contract.
- The contract says "never boxes" and weight 400 throughout; the build has pill outlines, 8px inputs, a 12px status panel and dialog, and titles at 500 with 600 on toggles and some buttons.
- The contract says mono is 11px uppercase only; experience dates and the dialog counter are mono at 12px, not uppercase. A defect the build carries, not a rule.
- The contract says the stamp stays half off the frame on a phone; the build offsets it only 12px left of the plate below sm (48px from sm), so on a phone it sits mostly over the portrait.
- The contract puts the section links on the right at every width; the build shows them only from lg and uses a Menu pill below.
- The contract says no gradients; the crosshairs and the sweep underline draw their lines with gradient syntax (no gradient fill is visible).
