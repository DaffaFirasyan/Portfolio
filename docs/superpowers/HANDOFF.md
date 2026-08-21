# Handoff — read this first

Written 2026-08-18, **last updated 2026-08-22** with the real content in and the performance pass done. Kept current as work lands — if it disagrees with the code, the code is right and this needs fixing.

This file exists so a session that remembers nothing can pick the work up without asking. Everything below is either recorded here or in a committed document — nothing important lives only in a conversation.

---

## Where the work stands

**Branch:** `feat/foundation-and-content-layer`, **160 commits** ahead of `main`. Nothing is merged; `main` still sits at the first plan document.

**State (2026-08-22):** 330 tests pass across 45 files. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all exit 0. Working tree clean.

**The real content has landed.** Profile, education, experience, projects, skills, certificates and every asset are the owner's own, pasted through `src/data/` and `public/` exactly as spec §11 criterion 3 promised — no component was touched to do it. What is still unfilled is listed under [Still the owner's to fill](#still-the-owners-to-fill).

**Bundle, gzip, measured on this commit:**

| Loaded | Chunks | gzip |
|---|---|---|
| Eagerly | `react` 57.15, `index` 50.07, `gsap` 50.27, `motion` 39.94, `lenis` 5.39, `icons` 2.31, runtime 0.51 | **205.6 KB JS** + 11.1 KB CSS |
| On the hero, desktop only | `Galaxy` 15.99, `SplashCursor` 6.04 | 22 KB |
| On approach to Contact, desktop only | `react-spline` 571.22, `physics` 733.92, `opentype` 50.62, plus `ui`/`gaussian-splat-compression`/`process`/`boolean`/`navmesh`/`howler` | ~1.4 MB |

The eager 216.7 KB is inside spec §12.3's 250 KB budget. The Spline robot is several times outside it, knowingly — see [its own section](#the-spline-robot-at-the-foot-of-contact). Fonts add about 130 KB of woff2 on top, already compressed.

Two animation libraries with overlapping capability, `gsap` and `motion`, are 44% of the eager bundle. That is the single largest reduction still available and nobody has taken it.

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

**Every plan is built and the content is in.** What remains is listed below, and most of it is the owner's.

### Still the owner's to fill

None of this is guessed or invented — the project's standing rule is that a portfolio describing work in words its author did not choose is worse than one that says less. Each is marked `TODO(owner)` in the file, so `grep -rn "TODO(owner)" src/` is the live list.

| What | Where | State |
|---|---|---|
| **Dukunify** — role, problem, solution, outcome, stack | [`src/data/projects.ts:83`](../../src/data/projects.ts) | Every field is a `TODO(owner)` string and `stack` is `['TODO']`. It is `featured: false`, so it shows only as a `ProjectFlow` row. **This is the one visible gap on the page.** |
| **Animart** — the owner's own part on it | [`src/data/projects.ts:66`](../../src/data/projects.ts) | `role` was deliberately removed rather than guessed: the project report says the team chose the approach, and an earlier inferred "Solo — analysis and build" was wrong. Optional; the meta line reads "Data · 2025" without it. |
| ~~**Certificate dates** — 7 of 14~~ | — | **Closed 2026-08-22 by deleting the fields**, not by filling them. See [no dates on certificates](#no-dates-on-certificates). |
| **The `web-developer` certificate title** | [`src/data/certificates.ts:38`](../../src/data/certificates.ts) | Issuer is confirmed **BNSP**. The exact wording on the scan is not. This is now the only unverified string in `src/data/`. |
| **`site.url`** | [`src/data/site.ts:4`](../../src/data/site.ts) | `https://daffa-firasyan.vercel.app` — a guess at the deploy target. Canonical URL, OG tags and JSON-LD all read from it, and `site.test.ts` guards it against drift, so changing it is one line. |

### Then, in order

1. **Deploy.** [Contact & launch](plans/2026-08-18-contact-and-launch.md) Task 10 is written and unstarted. It needs a Web3Forms key and a Vercel account, so it is the owner's to run; the plan says exactly what to do. It also merges this branch, which is the other reason to get to it.
2. **Check the certificate scans before they go public, by eye.** Identity numbers, dates of birth, wet signatures and personal QR codes must be covered. The owner has confirmed they checked (*"Soal privasi sudah saya pastikan aman"*), but **no test can check this and none pretends to** — it is a look at fourteen images, and the only chance to do it is before the files are public.
3. **Re-measure Lighthouse.** See [the performance pass](#the-performance-pass) for where it stands and what is already known to be costing points. Run it against `npm run preview` on port 4173, in incognito — a run against the dev server measures an artefact ten times heavier and scored 27.
4. **Replace the Spline scene.** It is Spline's own sample robot, the same asset the 21st.dev demo points at. A recognisable template on a portfolio argues against the portfolio.

### `Konten_Asli/` is gitignored, and must stay that way

The owner's source folder holds unredacted certificate scans and a real CV. `.gitignore` excludes everything in it except its `README.md`. **Do not `git add -f` anything from it.** A file committed once stays in history after it is deleted, and there is no undo for that on a pushed branch.

`docs/KONTEN_ASLI.md` is the committed specification of what belongs in that folder — every file, its format and its pixel size. It is safe to read and safe to share; it contains no content, only requirements.

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
| `data/` | `profile`, `projects` (4, three featured), `skills` (4 categories), `experiences` (3, all engineering) + `EXPERIENCE_TYPE_LABEL`, `education` (1), `certificates` (14), `technologies` (18 logo paths), `site` (canonical URL, title, OG), `sections` (`SECTIONS` + `shellProps`), `constraints` (`LIMITS`, `longest`, `STRESS_RATIO`), plus `invariants.test.ts` and `site.test.ts` — the data rules and the metadata drift guards. **All of it is the owner's real content now**, except what is listed under "Still the owner's to fill" |
| `types/` | Every content interface, plus `SectionMeta`, `SectionNavProps`, `Site`, `Technology` |
| `lib/` | All pure and tested directly: `scroll`, `filter`, `cycle`, `rail` (node geometry), `group` (`groupByCategory`, `CATEGORY_ORDER`), `validate` (contact fields), `web3forms` (the submit call), `token` (`cssToken` — canvas cannot read `var()`), `skillIcon` (kebab-case data key → lucide component, explicit table not a derived lookup) |
| `hooks/` | `useActiveSection`, `useScrolledPast`, `useMotionAllowed`, `useOnScreen`, `useLenis` — the last is a **module singleton**, see the traps |
| `motion/` | The wrapper layer, and the only place React Bits is touched: `Reveal` (takes `fill`), `Heading`, `Surface` (the one hover language), `Backdrop`, `Chip`, `Dialog` (takes `wide`), `Counter`, `BlurIn`, `Shine`, `RotatingRole`, `Grain`, `StarButton`, `Typed`, `Marquee`, `Sparks`, `PulseDot`, `AvatarCard`, `LogoMarquee`, `ProjectFlow`, `SplashCursor`, `SplineRobot` (`@splinetool/react-spline`, the only npm-backed wrapper here and by far the most expensive — see its own section) |
| `highlight/` | `SkillHighlightProvider` and `useSkillHighlight` — the skill-to-project cross-highlight |
| `nav/` | `NodeRailNav` (in use), `PillNavAdapter` (kept unimported as the second implementation that proves the seam), `Navbar` (owns the hooks) |
| `sections/` | The seven sections. Governed: no React Bits imports |
| `components/reactbits/` | Eighteen vendored components, owned and edited by this project |
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
- **Never `git add -A` in this repo.** The owner edits files while a session is working, so a blanket stage silently absorbs his in-progress changes into a commit whose message says nothing about them. It happened twice. Stage the specific paths the task touched, and run `git status` first to see what else is live.
- **A report that "nothing changed" is evidence, not noise.** Three separate rounds of tuning the Spline pose were spent on an input the scene never read, and the owner saying his own console edits did nothing was the fact that finally ruled the approach out. When a change that must work appears not to, stop tuning and question the mechanism — after ruling out stale HMR, which produced the same symptom in this project more than once.

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

**Three later fixes in the same conversational pass, each from something the owner saw:**

- **Skill names were wrapping untidily inside their cards.** `LIMITS.skill.name` came down from 24 to 22, which is what actually fits the 162px the card gives it. A limit derived from a measurement, not from a round number.
- **The `FlowingMenu` reveal is a near-white panel with near-black type**, which is the component's own default and what the owner asked for. It replaced the accent field, because a 76px band of amber reads as a warning, and a neutral field sidesteps the hue question rather than trading one loud hue for another — it also suits the panel's job, which is showing a screenshot, the way a gallery mat does. It uses `--color-primary` and `--color-void` rather than `#ffffff` and `#000000`: this page deliberately has no pure white anywhere. Stated plainly because it is a real trade — off-white sits at 0.841 luminance against the page's 0.004, roughly twice the brightness of the amber it replaced. `--color-elevated` is the quiet version if it ever reads as a flash.
- **The Experience years hung 29px outside the section's own left edge**, and the current entry's year sat further out still than the others — the two things the owner spotted were one bug. The column was 7rem against a year that renders 120–123px, and `justify-end` sends overflow leftwards; on top of that the pulse dot shares the year's flex row and pushed the one current year a further 19px. Left-aligning at 10rem fixes both, because only the year's own box now decides where it starts and the dot grows rightwards into space the column has.

## The real content, and what pasting it actually took

Landed 2026-08-21/22 across five commits, from the owner's CV and his own accounts of each project. **The architectural promise held**: `git show --stat` on `514ff25` and `1fd57e7` touches `src/data/`, `public/`, `index.html` and tests, and not one component. That was spec §11 criterion 3, written before there was any content to test it with, and it is now tested.

**What is on the page:** Raden Daffa Firasyan Adikusumah (short form "Daffa Firasyan" everywhere, and the comment in `profile.ts` says why), Bachelor of Information Systems from Telkom University at 3.64, three engineering roles — Telkom University, Pertamina Hulu Indonesia, Arranet — fourteen certificates, four projects, and the real avatar, CV and OG cover.

### Experience is engineering only, and nothing is current

Three student-organisation roles — media, human-capital and external-relations staff — were removed on 2026-08-22 at the owner's decision. The section is headed "Where I have worked", and those posts are not that.

**They also held the section's only signal for *now*.** Both ongoing entries were organisational, so the accent year and the pulse dot — the one device the timeline uses to mean "this is what I do today" — were pointing at organisational admin rather than at engineering. That was the strongest argument for removing them and it was not the one that prompted it.

Nothing is hidden by the removal: the CV is a download on the page and carries the complete record. The portfolio is the curated subset; the CV is the whole one.

**The consequence to accept is that no role is current.** The timeline ends September 2025 and no pulse dot renders anywhere. That is simply true of a fresh graduate looking for work, and `profile.openToWork` is what says so.

**Two tests had encoded a fact about the owner's life as an invariant, and it has now been wrong in both directions.** `invariants.test.ts` first insisted on *at most* one current role, which held only while the content was invented — he genuinely held two at once. It was then changed to insist on *at least* one, and removing the organisational roles left zero and failed it. Both versions were making the same mistake as the five deleted stress clauses: asserting something about a person rather than about the data. What survives is the part that is a real invariant — "present" must mean present, so an ongoing entry still needs a real start date — which is vacuous at zero, and correctly so. The companion assertion in `sections-lower.test.tsx` moved from `getAllByText` to `queryAllByText`, because `getAllBy*` throws on an empty result and made zero literally inexpressible.

`EXPERIENCE_TYPE_LABEL` still covers all six `ExperienceType` members even though only `work` and `internship` are used. It is a `Record`, so the compiler requires exhaustiveness, and that is what stops a newly-added type rendering `undefined` beside an organisation. That is not dead data in the way `credentialId` is.

**Two content decisions worth not re-litigating:**

- **Outcome lines say what a system does, not what its marketing claims.** Simpel IBS's own homepage advertises "500+ residents, 1,200+ letters, 98% satisfaction". Those are the product's claims about itself, not measurements, and an outcome line on a portfolio reads as something its author stands behind. What the system does is verifiable by opening it; what it achieved is not. The line describes the former.
- **Nothing was invented to fill a field.** Animart's stack and role were inferred once, and the owner's project report contradicted both. `role` is optional on `Project` precisely so a project without a stated one renders "Data · 2025" rather than a dangling separator — that filter lives in both `FeaturedProject` and the dialog.

**Five stress clauses were deleted, not worked around.** `certificate.issuer`, `certificate.title`, `skill.name`, `experience.role` and `experience.organization` are proper nouns owned by someone else: "BNSP" cannot be stretched to 90% of a 36-character limit, and a test demanding it would only ever be satisfied by lying in the data. Spec §4.1 anticipated exactly this. The length *ceilings* all still apply — it is only the floor that came off.

**Two certificate test regexes broke on real titles**, both for the same underlying reason: a real string is not a pattern. `Python (Basic)` contains regex groups, and `Web Developer` is a substring of `Junior Web Developer — …`, so a `.includes` match hit the wrong row. Both are function matchers now.

**Two inconsistencies were found by reading the data against the page, and both are fixed.** `profile.stats` claimed 8 projects against the 4 in `projects.ts` — a reader counts what is on screen, so the stat came down to 4. And `site.description` called him "an Information Systems student" while `profile.bio` says fresh graduate; it says graduate now, in `site.ts` *and* in the two `index.html` meta tags, because `site.test.ts` asserts the HTML contains the description verbatim and fails if only one moves. That guard was written for exactly this and this is the first time it has been needed.

### No dates on certificates

`Certificate` has **no `issueDate` and no `expiryDate`**, by the owner's decision on 2026-08-22, and the fields are gone from the type rather than left optional and empty.

The reason is that the lightbox shows the scan at full size and **every scan states its own date**, so a caption printing it was reprinting part of the picture it captions. Seven of the fourteen were still placeholder `2025-01` values, which would have shipped as confident misinformation sitting directly beneath an image that contradicted them — the worst version of a wrong date, not the mildest.

Nothing broke, because nothing depended on them: the wall groups by `category` and walks in array order, so **no sort used the date** despite an old comment in `certificates.ts` claiming it did. `expiryDate` existed on exactly one certificate and was rendered nowhere at all. The lightbox caption is now the issuer alone, which is the one thing a scan does not always make scannable at a glance.

The YYYY-MM invariant for certificates went with the fields; the compiler enforces their absence now, which is stricter than the test was. **Experience dates are untouched** and still checked.

If a date is ever wanted as *data* — for sorting, or a "valid until" badge the scan cannot provide — it comes back as a field. It does not come back to be printed under a picture of itself.

`credentialId` is worth knowing about while here: it is set on one certificate, and **rendered nowhere**. Either surface it in the lightbox or drop it; it is the same shape of dead data that `Skill.icon` was before `lucide-react` arrived.

### The hero portrait has a dial, and it is the only thing to turn

`npm run avatar` runs [`scripts/crop-avatar.mjs`](../../scripts/crop-avatar.mjs), which has **one number in it** — `const ZOOM` at line 30, currently `0.75`. Higher crops tighter and renders the person larger. It always writes 320×446, so `Hero.tsx`, `ProfileCard` and the `index.html` preload never need touching to change the framing. That was the point: the owner asked where to adjust it himself, and a single constant with a fixed output size is an answer he can act on without a code review.

`sharp` fought this three ways, each worth knowing before editing that script:

- **A raw buffer carries no metadata between calls.** Piping `.raw()` output into a new `sharp()` loses width and height, and the next operation guesses.
- **It reorders `extend` and `extract` inside one pipeline**, which surfaces as `bad extract area` on a pipeline that reads correctly top to bottom. Going through an intermediate **PNG buffer** forces the order.
- **Clamping height without reducing width squeezes the subject.** My first version did, by 9%, and only the taller source image ever reached that branch — so it passed on the old photo and distorted the new one.

**And the check for that distortion was wrong before it was right.** Thresholding alpha at >24 to find the subject's edges catches antialiased pixels differently at two resolutions, so it reported a squeeze that was not there and missed one that was. Comparing a **ratio** — head width ÷ subject height — is resolution-independent, and gives 0.1% drift on a correct crop.

### The card effects were turned down because they were bleaching a real face

`ProfileCard`'s holographic layers are tuned for the demo's stock portrait. On an actual photograph they washed the skin out — the owner's words were that his face had gone very pale. `SHINE` is 0.32 and `GLARE_LIGHTNESS` 62 now, and the portrait sits at `zIndex: 6`, **above** the glare layers rather than under them. This is the second time this component has had to be edited for the same reason: `mix-blend-mode: luminosity` came out earlier because it tinted a face blue-violet. Anything added to that card gets checked against the real photo, not the placeholder silhouette.

## The Spline robot at the foot of Contact

Added 2026-08-19 in the slot the rotating `CircularText` badge held. `CircularText` and its `CircularBadge` wrapper were deleted, following what already happened to `ElectricBorder` and `CurvedLoop` when they were replaced.

**Both embedding routes were built, and which one you need is decided by the URL you have.** A `.splinecode` asset can only be driven by `@splinetool/react-spline`; a `my.spline.design/...` public-view link is a self-contained HTML document and is embedded as an iframe, needing no npm dependency at all. Deriving one from the other does not work — the id in a share URL is not the asset id, and asking `prod.spline.design` for it returns **403**. The owner's public-view URL was fetched and searched: 1 MB of HTML, zero occurrences of `splinecode`.

The iframe route was tried and reverted. It cost **zero JavaScript** — both `@splinetool` packages were uninstalled and the build dropped to `index` 204.15, `Galaxy` 15.95, `SplashCursor` 6.00 and nothing else — but the scene published behind that URL does not follow the pointer, and following the pointer is the entire reason this element is on the page. A 3D object that ignores the reader is a picture.

**So the runtime is back, and this is the most expensive thing in the project by a wide margin:**

| Chunk | Raw | gzip |
|---|---|---|
| `react-spline` | 2,034.90 KB | **571.18 KB** |
| `physics` | 1,987.83 KB | **733.92 KB** |
| `opentype` | 169.90 KB | 50.62 KB |
| `ui`, `gaussian-splat-compression`, `process`, `boolean`, `navmesh`, `howler` | — | 107 KB combined |
| The scene, from `prod.spline.design` | — | 1,349,622 bytes |

Spline splits by feature and pulls what a scene uses, so `react-spline` at 571 KB is the floor rather than the total. Spec 12.3 sets a 250 KB budget and the rest of the page fits in 204 KB; this breaks that budget several times over, knowingly, on the owner's decision with these numbers in front of them.

**The initial payload is still 204 KB.** Everything above is behind a lazy import and the `webgl && hover` gate, which does double duty: a phone spends nothing, and a cursor-tracking robot has nothing to track without a hovering pointer.

**`renderOnDemand` is deliberately not set.** It suits a scene that redraws only on interaction; this one follows the pointer continuously, and on-demand rendering is what would make it stutter.

**Mounted on approach, exactly once.** This went through three shapes. `useOnScreen` was tried and removed, because it tore the scene down when the reader scrolled away and rebuilt a WebGL context on every return. Deferring to the `load` event was tried next and made the score *worse* — see [the performance pass](#the-performance-pass) for why. What it does now is its own `IntersectionObserver` at `rootMargin: '150% 0px'`, which **disconnects on the first hit**, with a `ready` flag that only ever goes true. So it starts loading a viewport and a half before Contact arrives, is ready long before anyone reaches it, and is never rebuilt by scrolling away and back — which is what the owner asked for on both counts. A reader who never scrolls that far never pays for it, and an audit that never scrolls is simply the most extreme such reader.

**Layout: no frame, standing on the footer border.** A border and surface background made it read as a picture of a robot hung on the page rather than something standing in it. It bleeds into the section's bottom padding instead, and the offset is not a tuned number — `-mb-20 md:-mb-32` is exactly the `py-20 md:py-32` that `SectionShell` applies, so the two cancel. `overflow-hidden` cuts anything past that line rather than pushing it into the footer, which is what makes standing the robot on the border safe: its feet are allowed to be cut.

Verifying that flush landing needed the pane's own limitation worked around, and the technique generalises. The box measured 40px *past* the footer, which looked like a layout bug and was not: `Reveal` wraps its children in a transform that this pane never animates away, so the wrapper sits frozen at `translateY(40px), opacity: 0`. Setting `transform: none` on that one ancestor by hand and re-measuring gave a gap of exactly **0**. Anything measured inside a `Reveal` here carries that 40px until it is settled by hand.

### The pose: three attempts failed for one reason, and it is worth knowing before touching this again

The scene ships a **`lookAt` event**, and the obvious way to drive it is to hand the canvas pointer events. That was built, then refined twice — forwarding the events, then mapping viewport coordinates onto the canvas, then pinning their vertical axis — and the owner reported that **nothing changed, including when he set values from the console himself**. That report was the evidence that ruled the whole approach out, and it should have been sooner: `lookAt` is serviced by Spline's own internal event manager, which **does not read synthetic events dispatched onto the canvas**. Every one of those three rounds was tuning an input the scene never consulted. `lookAt` also aims the whole upper body, so while it was in charge the torso bent no matter what else was tried.

`getAllObjects()` shows the rig is addressable — `Bot`, `Top part`, `Head`, `Neck` — and every `rotation` on it is writable. **So the pose is written rather than requested.** Each frame the head takes a yaw from the cursor, the torso takes a fraction of it, and **pitch and roll are written to zero**. A body assigned zero lean every frame cannot lean, whatever the scene's event would have done with it. The loop is registered after Spline's, so its values are the last written before the frame draws.

**The settled rig is the owner's, measured against the running scene:** `{ headYaw: 0.8, headPitch: 0.8, torsoYaw: 0.25 }`. `headPitch` is far above the cautious `0.12` this started at — the nodding was never what bent the robot over. It is overridable at runtime for tuning without a rebuild: set `robotRig` in the console and move the mouse. `window.spline` is the loaded app.

**The canvas is deliberately bigger than the box that shows it.** Spline fits the scene to its canvas, so a larger canvas renders a larger robot; `h-[44rem] w-[44rem]` anchored to the top of a clipping box sends the overflow to the legs, below the crop. That is what lets the head and torso be large in a column that has no room for a whole figure.

**Suspect stale HMR before suspecting the code.** During this work Vite served stale modules at least three times, reporting old values in a way that reads exactly like "the change did nothing" — which is almost certainly what defeated the owner's own attempts at tuning it. Hard-reload before concluding an edit had no effect.

**Three things to know before deploy.** The scene is Spline's own sample robot, the same one the 21st.dev demo points at — worth replacing with a scene made in Spline's free editor, because a recognisable template asset on a portfolio argues against the portfolio. `prod.spline.design` is a third party in this page's critical path, with no error hook to catch a failure: `SplineProps` extends the div's HTML attributes, so its `onError` is the DOM media handler and never fires for a failed scene fetch. And re-measure Lighthouse — Performance was 85 against a threshold of 85 before any of this.

## The performance pass

Run on 2026-08-20/21 after the owner chose performance as the first thing to fix, and before the content landed. Every score below is a real Lighthouse run on `npm run preview`, mobile, incognito. **Six commits, `bdb6802` through `3c7187c`, and each one carries its own measurements in its message** — read those rather than trusting a summary.

| Run | Mobile Performance | What had changed |
|---|---|---|
| Baseline, pre-robot | 85 | The last score in this file before the Spline work |
| 1 | **57** | The robot landed, deferred to the `load` event |
| 2 | **70** | Robot tied to approach instead of to a timer |
| 3 | **78** | Starfield off phones; vendor chunks split |
| 4 | **80** | Below-the-fold decorations stopped mounting at load |

Two more landed after that fourth run and have **not been measured**: the LCP preload plus removing the hero blur (`00b9f19`), and the desktop CLS fix (`3c7187c`).

**The one lesson that changed how the rest was approached: Lighthouse does not stop measuring at the `load` event.** Deferring the robot to `load` did exactly what it was meant to — transfer before `load` fell from 931 KB to 210 KB, measured — and the score went *down*, 85 to 57, with blocking time going 220ms to 1,150ms. Parsing 2 MB of runtime and initialising a 3D scene still lands inside the blocking-time window; it just lands later. Lighthouse keeps going until the page is quiet. **Moving expensive work later in the same page does not help. Not doing it does.** Tying the robot to an IntersectionObserver instead — so an audit that never scrolls never pays for it, and neither does a reader who never scrolls — is what recovered the points.

**The robot costs about 930ms of main thread and roughly 28 points wherever it runs.** That number is the price of the decision, and it is the owner's decision with the number in front of him.

**Three findings from that pass that generalise past this project:**

- **`useOnScreen` started `true`, and its own comment carried the condition that made that safe** — "callers are elements that are on screen by construction anyway". True while the hero backdrop was the only caller. It silently stopped being true when the Skills logo strip and the footer marquee adopted the hook, and nothing failed, so nothing said so: 71 SVGs and two scrolling animations mounted on page load for sections two and nine screens down. The starting value is an explicit argument now. **An assumption written in a comment is not enforced by the comment.**
- **`webgl` was the wrong gate for "is this a phone".** It tests memory, cores and Save-Data — none of which a phone-emulating audit fakes — so a continuous WebGL starfield ran through every mobile run, and on real phones too whenever one reported enough memory. `hover` is the flag that actually separates a laptop from a phone.
- **Splitting the vendor chunks was diagnostic before it was an optimisation.** A single 598 KB `index.js` makes "4.9s of script execution" unactionable. Named chunks turned it into an answer.

**The accessibility dip was not a colour problem, and three passes over the rendered page missed it.** Lighthouse dropped Accessibility to 97 and named the About paragraph, whose colour measures 6.58:1 and passes comfortably. The cause was `opacity`: `AnimatedContent` fades from 0, so every block of text on the page spends the first six tenths of a second below its own contrast ratio, and the audit photographed one mid-fade. A reader scrolling quickly sees the same thing, so it is a real defect rather than an artefact of being measured. `Reveal` passes `animateOpacity={false}` now and the entrance rises without fading. **An entrance fade on text is an accessibility cost, not a matter of taste.** Fading a container that holds no text is free; fading one that does is not.

**Measuring contrast in a Tailwind v4 page requires compositing, not reading.** Colours resolve to `oklab(…)`, and scraping the computed value and treating it as RGB produces confident nonsense — 1.04:1 on an element that plainly passes. Paint both colours to a canvas and read the pixels back. A related trap in my own probe: starting the background search at `parentElement` skips the element's own `background-color`, which reported the accent-filled "View projects" button at 1.0:1.

**The desktop audit is a different page from the mobile one**, and reading only one of them hides half the problems. Desktop scored **79** with FCP 1.1s, LCP 1.4s and TBT 50ms — all excellent — and **CLS 0.245** against a 0.1 budget, dragging the score down almost single-handedly. Two causes, both invisible on mobile:

- **The rotating job title had no reserved width.** The four roles render between 103px and 212px, so the hero line resized by up to 109px every 2.6 seconds with no user interaction behind it. That is exactly what CLS counts. The width is held by the longest role rendered invisibly in the same single-cell grid — a sizer rather than a magic number, so it survives the roles in `src/data` changing.
- **`ProfileCard`'s portrait carried `loading="lazy"`, and on desktop that portrait *is* the LCP.** Lazy-loading the one image the metric is measured against is the case Lighthouse warns about by name.

**The remaining structural CLS risk is the font fallbacks, and it is unfixed.** Measured on the real page: Geist renders 3.9% wider than `system-ui`, Bricolage 8.1%, and **JetBrains Mono 51.8% wider than `ui-monospace`**. Any font swap therefore reflows. That wants `size-adjust` overrides in `@font-face`, not a quick fix.

**Known remaining targets, named by Lighthouse itself:** render-blocking requests, main-thread work, JavaScript execution, and the non-composited animations. They are GSAP and WebGL, not file size — which is why shrinking images will not move this score.

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

**Tailwind v4 resolves colours to `oklab()`, so contrast cannot be measured by scraping a computed value.** Reading `getComputedStyle().color` and treating the string as RGB produces confident nonsense — it reported 1.04:1 on an element that plainly passes. Composite both colours to a canvas and read the pixels back instead. Two more ways the same probe went wrong here, both mine: starting the background walk at `parentElement` skips the element's *own* `background-color`, which reported an accent-filled button at 1.0:1; and a contrast failure Lighthouse reports may not be about colour at all — the one that cost a point on this page was `opacity` mid-fade.

**Vite 8 runs Rolldown, which accepts only the function form of `manualChunks`.** The familiar object map — `{ react: ['react', 'react-dom'] }` — does not compile, rather than being quietly ignored. `vite.config.ts` carries the working form.

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

- **~~The stress rule does not apply to proper nouns.~~ Settled.** Five clauses were deleted when the real content landed — `certificate.issuer`, `certificate.title`, `skill.name`, `experience.role`, `experience.organization` — rather than worked around, which is what spec §4.1 anticipated. The length ceilings still apply; only the 90%-of-limit floor came off, and only for names owned by someone else. If a sixth field turns out to be a proper noun, delete that clause too.
- **Nothing animates while Windows has animation effects off**, and that setting is easy to forget. It makes every Chromium browser on the machine report `prefers-reduced-motion: reduce`, which correctly disables the starfield, per-character headings, the rotating role, the counters, the tilt, the grain, and Lenis smooth scroll all at once. The switch is **Settings → Accessibility → Visual effects → Animation effects**. The low-end heuristic is not involved on this machine — `deviceMemory` is 16 and `hardwareConcurrency` is 20.

  With the setting on, verified in a browser: `prefers-reduced-motion` reads false, Lenis mounts (`html.lenis`), `SplitText` splits the h1, the Galaxy chunk is fetched on demand, and there is **exactly one WebGL 2.0 context** at hero width with the gradient fallback gone.

  Do not relax the gate to make the effects visible during development. The preference is an explicit request, and honouring it completely is the thing this architecture was built around.

  The owner confirmed in a real browser that both canvases leave the DOM once the hero is scrolled past, so the unmount works end to end. The film grain is gated the same way through `useOnScreen` — it repainted every third frame regardless of visibility until that was fixed.

  **Still unverified:** that the hero entrance reads as a staggered sequence finishing inside ~1.2s. Needs a compositing browser; the in-app pane advances no transitions and delivers no IntersectionObserver callbacks.
- **Active-section tracking has never been watched in a real browser.** Its logic is covered by unit tests driving the observer directly, including fast scroll and document-order tie-breaks, but nobody has seen the indicator follow a real scroll. Worth a look in `npm run dev`.
- **The profile photo had to be cut out of its background, and it now is.** `ProfileCard` anchors the image to the bottom of the card and lets the gradient show around it, so an opaque square renders as a pasted block with a visible seam — measured at 388×388 covering 72% of a 540px card, with 153px of bare gradient above it. Spec §5 carries the requirement, the owner supplied a cut-out, and `npm run avatar` frames it from a single `ZOOM` constant. `mix-blend-mode: luminosity` was removed from the vendored component early, because it tinted the portrait into the card's hue and would have rendered a real face in blue-violet; the glare and shine were turned down later for the same class of reason. See [the portrait dial](#the-hero-portrait-has-a-dial-and-it-is-the-only-thing-to-turn).

- **~~All content is placeholder.~~ It landed on 2026-08-21/22** and touched only `src/data/`, `public/`, `index.html` and tests, exactly as promised. What is still unfilled is in [Still the owner's to fill](#still-the-owners-to-fill); how it went is in [The real content](#the-real-content-and-what-pasting-it-actually-took).

  **`npm run placeholders` is now a destructive command.** It writes unconditionally — no existence check anywhere in `scripts/generate-placeholders.mjs` — over every asset the data references. Running it today replaces the real avatar, all fourteen certificate scans, four project thumbnails, the education logo, the OG cover **and the real CV PDF** with generated stand-ins, and prints a cheerful count of files written. Git would recover them; nothing else would. It was the right tool while the content was fixtures and it is a footgun now.
- **The dialogs are fully verified as of 2026-08-18.** The owner confirmed in a real browser that Tab cannot escape an open dialog and that Escape closes it, for both the project modal and the certificate lightbox, with the arrow keys stepping through certificates. Together with what was already measured — focus moves in on open, returns to the trigger on close, the body locks and Lenis genuinely stops — the native `<dialog>` bet is settled. Nothing here is outstanding.
- **Lighthouse no longer passes Performance, and that is a known, priced decision rather than a regression to hunt.** The last mobile run reads **80** against spec §12.3's threshold of 85, down from 85 before the Spline robot, which costs about 28 points wherever it runs. Accessibility, Best Practices and SEO are 100/100/100 (a dip to 97 was found and fixed — it was `opacity`, not colour). Desktop last read 79, dragged down by a CLS of 0.245 that has since been fixed and not re-measured. The full journey, every number and every lesson, is in [the performance pass](#the-performance-pass).

  Two commits landed after the last run and should raise it. **Re-measure before deciding anything**, and re-measure on the content that is actually shipping — every score above predates it.

  The 2026-08-18 baseline, for comparison: Performance 85, Accessibility 100, Best Practices 100, SEO 100, FCP 2.7s, LCP 3.1s, TBT 220ms, CLS 0.001.

  **Run it against `preview`, never `dev`.** The first two runs scored 27 and 34 against the Vite dev server, which serves hundreds of unbundled ES modules — Lighthouse reported a 7,951 KB payload and offered to save 6,091 KB by minifying. The real initial payload is 179 KB gzip (170 JS, 8 CSS) plus about 109 KB of latin font subsets, with the Galaxy chunk a further 15 KB loaded only on demand. A run against `dev` is measuring the wrong artefact by a factor of ten.

  Chrome extensions cost 8 accessibility points in the very first run. In incognito it is 100.

  **Performance sits exactly on the threshold, so it has nowhere to fall.** Real content is the risk: fourteen certificate scans at up to 250 KB each and eight project thumbnails replace placeholders that are currently a few KB of flat colour. If the score drops after the paste, Lighthouse already names the targets — render-blocking requests (750ms), main-thread work (7.6s), JavaScript execution (4.2s), and 18 non-composited animations. All four are GSAP and WebGL, not file size.

- **The reduced-motion pass is confirmed too.** With Windows animation effects off, the owner verified no canvas remains on the page. The keyboard pass through the whole page is likewise done.

- **The `Galaxy` resize is confirmed** in the owner's browser. Nothing from the contact-and-launch sweep is outstanding.

- **Seven motion effects landed; one was declined and three were replaced after being built.** `StarBorder` on the CV and Send buttons, `TextType` on the contact opening line, `ClickSpark` in Contact, and `PulseDot` marking the current role. `CircularText` was a badge and is **deleted** — the Spline robot took its slot, and its `CircularBadge` wrapper went with it, following what already happened to `ElectricBorder` and `CurvedLoop`. The footer marquee began as `CurvedLoop` and is `ScrollVelocity` now: the curve locked the element to `aspect-[100/12]`, so it took 152px of a 281px footer with no way to ask for less, and its replacement is 32px and moves with the scroll rather than on its own. It reads `© {year} {profile.name} · Built with React`, composed in `App.tsx` from the data and the real clock, so the year cannot go stale. `ScrollFloat` was deleted rather than wired, because `SplitText` already carries `scrollTrigger: { once: true }` and running both would put two heading languages on one page.

  `ElectricBorder` was built and then removed: the owner found it too loud beside prose, and it cost a render loop for as long as Experience was on screen. What replaced it is cheaper in every direction — a tinted card plus a three-second ring on the 10px timeline dot, animating only transform and opacity so it composites.

  `GlassIcons` was declined. It imposes its own grid and a six-colour 90%-saturation palette, needs `React.ReactElement` icons the data does not have and no installed library provides, and on Skills it would have cost the working skill-to-project cross-highlight. Same objection that rejected `MagicBento` and `GlareHover`.

  **Cost: about 10 KB gzip.** Initial payload went from 179 KB to 189 KB (179.62 JS + 9.42 CSS) against a 250 KB budget. Width sweep on the production build at 320, 753 and 1425, each on a fresh load: no page overflow and no header overflow at any of them.

  **Not yet measured: Lighthouse after these effects.** The last recorded run is 85/100/100/100, taken before any of them. Three render loops now exist — the starfield, the footer marquee and the click sparks — all gated on visibility, and the sparks idle when no spark is alive.

- **`SplashCursor` was built, shipped and reverted on 2026-08-19, and the reason is the sharpest warning in this file.** A full-screen WebGL fluid cursor, vendored with six real fixes — upstream has *no effect cleanup at all* (discarded rAF handle, five inline-arrow window listeners that `removeEventListener` can never match, and `BACK_COLOR` in the dependency array so a re-render stacks a second simulation on the first), and it *throws* `Unable to initialize WebGL` from inside its effect, making its own `if (!gl || !ext) return;` unreachable. All of that was fixed and tested. It still had to be reverted, because none of it was the problem.

  The problem: a full-screen canvas at `z-30` covers every piece of page content, and the pane cannot render it to show that. Everything below `z-40` vanished behind an opaque canvas — the owner's screenshot showed a white page with only the navbar and the node rail, both of which sit at `z-40`, still visible. Every check that *was* possible here passed: the canvas mounted with a live `webgl2` context, `z-index` computed to 30 against the navigation's 40, and `elementFromPoint` at three places hit page content rather than the canvas. The display shader even emits alpha correctly (`vec4(c, max(c.r,c.g,c.b))`), so reading the source predicts transparency. It was not transparent in a real browser.

  Two lessons. **`TRANSPARENT` is a dead prop** — it is declared, defaulted, threaded into `config` and listed in the dependency array, and never read anywhere in the render path, which is the kind of thing only a browser tells you. And more generally: **the pane can verify that a canvas exists, not what it paints.** For anything whose whole purpose is pixels on a full-screen surface, no amount of DOM measurement here substitutes for one look in a real browser.

  **It was brought back the same day at `-z-10`, with a second fault fixed that the first attempt had introduced.** The cleanup called `gl.getExtension('WEBGL_lose_context').loseContext()`, which is the tidy-looking thing to do and is wrong here: `main.tsx` renders under `StrictMode`, so effects run mount → cleanup → mount on the *same* canvas element, and a lost context is never restored automatically. The second mount called `getContext` on that canvas, got the dead one back, and every shader compile and draw failed silently for the life of the page. That alone would explain a canvas painting nothing useful in `npm run dev` while every static check passed. Dropping the reference is enough; the browser reclaims the context with the canvas.

  The placement is now the safety property rather than a judgement call: at `-z-10` the body's background paints beneath it — `html` carries no background, so body's propagates to the viewport canvas — the content paints above it, and nothing it draws can obscure a word even if it paints fully opaque. Verified there is no transformed, isolated or non-opaque ancestor to trap it in a stacking context. If it ever needs removing again, the effect is one component: delete `<SplashCursor />` from `App.tsx`.

- **GSAP-driven animation cannot be measured in the pane at all**, and the failure mode is silent. GSAP runs entirely on `requestAnimationFrame`, which never fires there, so it never applies its `from` state — every element reads `opacity: 1, transform: none` whether the animation already finished or never started. A reading like that looks like evidence and is not. Anything scheduled with `setInterval` or `setTimeout` **is** measurable there; that is why the `TextType` check worked and the `SplitText` one did not. The owner confirmed in a real browser that section headings animate per character on arrival and that the contact line types on arrival.

  What **was** measured on the production build, at 320, 375, 753, 985, 1085, 1265 and 1425: `documentElement.scrollWidth` never exceeds `clientWidth`, and the header's inner container never exceeds its own client width either — checked separately because a fixed element does not grow the document's scroll width. On a fresh load at 320 the grain canvas matches the viewport exactly.

- **Raising `testTimeout` does not raise the hook timeout, and the failure names a number you never configured.** Vitest times `beforeEach`/`afterEach` separately at a 10s default, and Testing Library registers its cleanup — which unmounts the whole App tree — as an `afterEach`. So App.test.tsx failed with `Hook timed out in 10000ms` while `testTimeout` sat at 45s looking innocent, and the test that "failed" had already finished its assertions. Unmounting this page costs about what mounting it does. `hookTimeout` is set alongside `testTimeout` now; keep them together.

- **A `:focus` style cannot be verified in the pane at all**, which is the focus gap below showing up in CSS rather than in JavaScript. `:focus` only matches while the document itself is focused, and `document.hasFocus()` is permanently false there — so a `focus:z-50` utility computes as `z-index: auto` no matter what `.focus()` did to `document.activeElement`. To check what a focus variant resolves to, apply the same utilities to a throwaway element and read *that*: `document.createElement('a')` with `className = 'absolute z-50'` reports 50, which is the fact the assertion actually needed.

- **The pane never gives the document real focus, so `.focus()` is exactly as unreliable there as `requestAnimationFrame` — same root cause, one more symptom.** Measured: `element.focus()` moves `document.activeElement` (that part is real bookkeeping, not faked), but `document.hasFocus()` reads `false` and neither a native `focus` nor `focusin` listener — attached directly, bypassing React entirely — ever fires. A React `onFocus` handler that depends on that event therefore never runs, which looked exactly like a bug in a freshly-added active-chip style before a plain `addEventListener('focusin', …)` check showed the event itself never arrives. Mouse events dispatched for real (`userEvent.hover`) still work fine in a real browser; this is specific to focus. Trust jsdom via `@testing-library/react`'s `act()` for anything focus-triggered — it has no such gap — and treat the pane the way this file already treats GSAP: fine for layout and DOM shape, blind to anything that starts with an event the pane cannot actually deliver.
- **`main` has nothing on it.** **160 commits** now sit on one branch with no merge. Nothing is broken by that, but the longer it runs the more there is to unpick if something needs reverting. The deploy task merges it.

- **The contact form has never sent a message.** `VITE_WEB3FORMS_KEY` is unset, so submitting reaches the error state and offers the `mailto:` fallback — which is the designed behaviour, not a bug, but it means the success path has only ever been seen in tests. Sending one real message is a step in the deploy task.

- **One test was wrongly called a flake, twice.** The `Sparks` frame clock flushed at an absolute timestamp of `10_000` while `ClickSpark` stamps sparks with `performance.now()`, so once the test process had been alive that long the flush stopped being past the 400ms duration. It is relative now. The lesson is the general one: a test that fails only in full-suite runs is usually reading a clock it does not own.

## How this project verifies things

The short version, because it is what makes the rest trustworthy:

- **Prove the guard fails.** Nearly every guard here was checked by breaking what it watches — the import boundary, the asset invariant, the honeypot, the band clamp, the metadata drift, the navigation seam, the render loop, the section outline, the CSS-variable-on-canvas bug. A guard nobody has seen fail is a guess.
- **Measure in a browser, then say the number.** Four visual defects shipped with a green suite before this became habit. Every layout claim in this file has a measurement behind it.
- **Distrust a measurement that is impossible.** A `fixed` header claiming to be 1128px wide inside a 320px viewport, a page overflow that appears only without a reload, an element at `opacity: 1` that GSAP never touched — each looked like a bug and was not.
