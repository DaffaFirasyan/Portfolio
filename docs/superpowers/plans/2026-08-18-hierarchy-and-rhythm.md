# Hierarchy & Rhythm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the page rendering everything at the same weight. Projects, Certificates and Experience currently read as three stacks of identical boxes; this gives each one a hierarchy that already exists in the data and is shown nowhere.

**Architecture:** No new components, no new dependencies, no new render loops. This is layout and typography over data that is already typed, already tested, and already there.

**Covers:** The three sections the owner named as boring. About, Skills, Hero and Contact are not touched.

**Reference:** `docs/superpowers/HANDOFF.md`, spec §4 (data), §8.3 (one visual language).

---

## The diagnosis, with evidence

Three fields exist in `src/data/`, are covered by invariants, and are rendered **nowhere**:

| Field | What it holds | Rendered |
|---|---|---|
| `project.featured` | at most three, enforced by `LIMITS.counts.featuredMax` | no |
| `certificate.category` | `course` `competition` `workshop` `professional` `bootcamp` | no |
| `experience.type` | `work` `internship` `organization` `freelance` `volunteer` `research` | no |

So the page flattens three dimensions it already knows about. Eight projects of equal weight, fourteen certificates of equal weight, five roles of equal weight. A reader scanning for thirty seconds is given nothing to land on.

**This is why the answer is not more motion.** Two effects have already been rejected for being too loud, and Lighthouse Performance sits exactly on its 85 threshold with three render loops already running. Adding a fourth would cost the score and would not fix boredom — uniformity is the problem, not stillness.

## What this deliberately does not do

- **No new React Bits components.** Nothing is vendored. The bundle should move by well under a kilobyte.
- **No new render loop.** The only motion added is the entrance stagger that already exists, plus CSS transitions on transform and opacity.
- **No second hover language.** `Surface` keeps it, as spec §8.3 requires.
- **No change to `src/data/` shape or `public/`.** Replacing placeholder content stays a data-only edit, which spec §11 criterion 3 requires.

## The three fragile things this touches

Named up front, because each has tests that will fail loudly and should:

1. **The skill-to-project cross-highlight.** `data-dimmed` and the opacity classes must stay on each project's `<article>`, in both the featured layout and the compact one. `cross-highlight.test.tsx` finds cards via `.closest('article')`.
2. **The category filter.** `projects-filter.test.tsx` and `projects-empty.test.tsx` assert counts and titles. The featured split interacts with filtering — see Task 2.
3. **The certificate lightbox.** `education-lightbox.test.tsx` steps through certificates by index with the arrow keys. Grouping changes the visual order, so the index the lightbox walks must stay the flat data order or the arrows will jump between groups unpredictably.

---

## Task 1: Projects — three featured entries become editorial rows

**The change.** Up to three `featured` projects stop being grid cells and become full-width alternating rows: the thumbnail on one side, the story on the other, direction flipping each row. Large title, the `problem` sentence at reading size, `outcome` given its own line.

The remaining projects stay a grid, but tighter and quieter — smaller type, no thumbnail description — so the contrast between the two tiers is the thing a reader notices first.

**Why this and not a bento grid.** A bento grid is asymmetry without meaning: boxes differ in size for visual interest, not because anything is more important. The featured flag is a real editorial judgement already recorded in the data, and at most three of them, which is exactly the number a 30-second scan can hold.

**Files:** `src/sections/Projects.tsx`, new `src/components/ui/FeaturedProject.tsx`, tests.

**Layout, at `lg` and up:**

```
┌──────────────────────────┐  01 — FEATURED
│                          │  Project title, large
│        thumbnail         │  The problem sentence, at reading size
│                          │  → outcome
└──────────────────────────┘  stack chips        [demo] [repo]

  02 — FEATURED             ┌──────────────────────────┐
  Project title, large      │                          │
  The problem sentence      │        thumbnail         │
  → outcome                 │                          │
  stack chips  [demo][repo] └──────────────────────────┘
```

Below `lg` both collapse to a single column with the image first — the alternation is a wide-screen idea and reversing on a phone just makes two layouts to debug.

- [ ] **Step 1:** Write `FeaturedProject.test.tsx` first: it renders the title as a heading, keeps `data-dimmed` on an `<article>`, shows `outcome`, and renders no link for an absent `demo`/`repo` — the error-handling rule from spec §7 that says an absent link renders nothing rather than a dead control.
- [ ] **Step 2:** Build `FeaturedProject.tsx`. Thumbnail keeps its explicit `width`/`height` — CLS is 0.001 today and that is not free, it is those attributes.
- [ ] **Step 3:** Split the list in `Projects.tsx`: `projects.filter((p) => p.featured)` and the rest.
- [ ] **Step 4:** Run the whole suite. `cross-highlight.test.tsx` is the one to watch.
- [ ] **Step 5:** Browser: no page overflow at 320/768/1440, images not stretched, alternation correct at `lg` and gone below it.
- [ ] **Step 6:** Commit.

---

## Task 2: Projects — what the filter does to the split

**The decision, made here rather than discovered later.** When a category filter is active, the featured/rest split is dropped and every match renders in the uniform grid.

Featuring is a judgement about the whole body of work. Inside "3 of 8 match Web", a featured row would claim an importance it does not have, and with one match the page would show a single enormous row and an empty grid beneath it. The split returns when the filter returns to All.

- [ ] **Step 1:** Add the case to `projects-filter.test.tsx`: with `ALL` selected, the featured articles exist; with any real category selected, they do not, and the visible count still equals `filterByCategory` — which is what the existing tests already assert.
- [ ] **Step 2:** Implement. `category === ALL` is the only condition.
- [ ] **Step 3:** Check the empty state still appears with its reset button (`projects-empty.test.tsx`).
- [ ] **Step 4:** Browser: switch filters and confirm the grid does not jump — the reader's cursor should stay over the same control.
- [ ] **Step 5:** Commit.

---

## Task 3: Certificates — fourteen boxes become five named groups

**The change.** Certificates group under their `category`, each group headed by its name and a count. Within a group the tiles get smaller and denser: thumbnail, title, issuer, and nothing else. Skills chips move into the lightbox, where there is room for them.

**Why this is the fix.** Fourteen identical tiles is a wall; the eye cannot enter it. Five groups of two to four is a structure — and it answers a question a recruiter actually has, which is *what kind* of certificates these are. A competition win and a video course currently look identical on this page.

**The ordering trap.** `education-lightbox.test.tsx` steps through certificates with the arrow keys using `cycleIndex` over the flat array. Grouping must not reorder that array. The lightbox continues to walk `certificates` in data order; only the rendering is grouped. Say so in the code, because the next person will be tempted to pass the grouped list.

**Files:** `src/lib/group.ts` (pure, tested), `src/sections/Education.tsx`, tests.

- [ ] **Step 1:** Write `src/lib/group.test.ts` for `groupByCategory(certificates)`: preserves data order inside each group, returns groups in a documented order rather than object-key order, and handles a category with no entries by omitting it.
- [ ] **Step 2:** Implement `groupByCategory`. Pure, no DOM — the same shape as `filter.ts` and `cycle.ts`.
- [ ] **Step 3:** Render the groups. Each heading is an `h4` under the existing `h3`, so the outline stays ordered — the page currently runs 1,2,3 with no jumps and `app-a11y` would catch a break.
- [ ] **Step 4:** Confirm the lightbox still opens the right certificate from any group, and that the arrows still traverse all fourteen. This is the assertion most likely to fail.
- [ ] **Step 5:** Browser: 320 and 1440, no overflow, groups readable.
- [ ] **Step 6:** Commit.

---

## Task 4: Experience — the year leads, the rule goes

**The change.** The vertical rule and its dots are removed. Each role becomes a band: the year set large in the left margin as display type, the role as the headline, the organisation beside it, and `type` shown as a small label — Internship, Freelance, Research.

```
        ┌ role, large
 2024   │ Organisation · INTERNSHIP
        │ summary
        └ highlights, stack
```

**Why the timeline goes.** The owner is right that it is the default portfolio layout; a rule with dots down the left is what almost every template ships. It also earns nothing here — with five entries in reverse order, the sequence is obvious from the dates alone, and the rule spends horizontal space to restate it.

A year set in display type does the same job and gives the section a rhythm the rest of the page does not have: every other section leads with prose, this one leads with a number.

**What happens to the current role.** It keeps the quiet card from the previous plan. `PulseDot` loses its home on the rule, so the marker moves to the year itself — accent colour, and the ring behind it. If that reads as too much, the card alone is enough and the ring can go; decide it in the browser.

- [ ] **Step 1:** Update `sections-lower.test.tsx` expectations for the new structure, and assert `type` is rendered for every entry.
- [ ] **Step 2:** Rebuild the section. `PulseDot` moves; `Reveal` and the entrance stagger stay.
- [ ] **Step 3:** Confirm the timeline-dot containing-block trap is gone with the rule — that constraint only existed because the dots were positioned against the section.
- [ ] **Step 4:** Browser at 320: the year cannot sit in a margin on a phone, so it stacks above the role. Check that it does.
- [ ] **Step 5:** Commit.

---

## Task 5: Sweep and measure

- [ ] **Step 1:** `npm test && npm run lint && npx tsc --noEmit && npm run build`.
- [ ] **Step 2:** Width sweep at 320, 375, 768, 1440 on the production build, **reloading after each resize** — measuring after a resize without a reload reports false overflow in this pane, and has done twice.
- [ ] **Step 3:** Reduced motion: every section still readable, `document.querySelectorAll('canvas').length` still `0`.
- [ ] **Step 4:** Lighthouse, incognito, mobile, against `http://localhost:4173`. This plan should not move Performance — it adds no loop and almost no bytes. If it does move, that is a finding worth chasing.
- [ ] **Step 5:** Record the four scores and the outcome in `HANDOFF.md`. Commit.

---

## What this will not fix

Worth saying plainly before starting. **The content is still placeholder.** Eight projects with invented names, fourteen certificates with flat-colour thumbnails, and a silhouette where a face goes. A large part of why the page feels lifeless is that there is nothing real to read yet, and no layout fixes that.

This plan is worth doing anyway — the structure has to exist before real content can land well, and doing it now means the layout is stress-tested by placeholder text written at the maximum permitted lengths. But if the page still feels flat afterwards, the next move is content, not another redesign.
