# PORTFOLIO-REACT

One-page portfolio site. Vite 8 + React 19 + TypeScript 6 + Tailwind 4, tested with Vitest.

## Start here

**Read `docs/superpowers/HANDOFF.md` before doing anything else.** It carries current state, the next plan to execute, the spec decisions that were revised after approval, and the environment traps that each cost real time to discover.

Work is sequenced as plans in `docs/superpowers/plans/`, executed one task at a time. `docs/superpowers/specs/` is the authority on design decisions.

**The site is live at https://daffafirasyan.vercel.app** as of 2026-08-22, deploying from `main` on `https://github.com/DaffaFirasyan/Portfolio.git` — a **public** repo. A push to `main` triggers a Vercel rebuild.

The repository being public matters when adding files: anything committed is permanent in history even if deleted later.

## Rules that are enforced, not just preferred

- **All copy comes from `src/data/`.** Replacing content must touch only `src/data/` and `public/` — never a component. The real content landed on 2026-08-22 and held to this exactly.
- **Nothing in `Konten_Asli/` may be committed**, except its `README.md`. It holds unredacted certificate scans and a real CV; `.gitignore` covers it, and a file committed once stays in history after it is deleted. Never `git add -f` out of it. `docs/KONTEN_ASLI.md` is the safe, committed spec of what belongs there.
- **Never `git add -A`.** The owner edits files while a session is running, and a blanket stage absorbs his work into a commit that does not mention it. Stage the paths the task touched. He has replaced assets mid-session more than once — check `git status` before staging.
- **No animation libraries, and no vendored UI kits.** The 2026-11-11 redesign deleted `reactbits/`, `aceternity/` and `lightswind/` and uninstalled `gsap`, `motion`, `lenis`, `ogl` and `cobe`. Motion is CSS plus one hand-written canvas 2D sky (`src/sky/`); no WebGL. If a component is ever vendored again, copy the source in by hand and never run its CLI (`npx shadcn add` and friends assume a `components.json`, a `cn` helper and a JS Tailwind config this project does not have), and expect to edit it.
- **An asset the owner supplies is not the format its extension claims.** Three in a row arrived as PNG named `.webp`, one of them 5 MB in the LCP slot. Browsers sniff content so nothing fails; check format and pixel dimensions with `sharp` before trusting any new file in `public/`.
- **The sky looks after the device.** `src/sky/SkyCanvas.tsx` times its first sixty frames and steps down from full to lite to still, starts still under `prefers-reduced-motion`, stops in a hidden tab and never steps back up. Any new effect must be droppable by the lite and still tiers. CSS animation (the stamp press, the hairline that draws in above each section, colour and underline transitions) stays inside `@media (prefers-reduced-motion: no-preference)` or carries `motion-reduce:`.
- **The page is a star map by default, and the plain page is one switch away.** `src/map/` turns the sky into a map you drag, zoom and click (a camera mode inside `SkyCanvas`); the open region lives in the URL hash and its section opens in a panel. Reading mode is the full linear page and must stay complete: every word and the contact path exist there, and in Map mode every section stays mounted and is only `hidden`. The map needs a 2D canvas and falls back to Reading mode without one. Keep the sky's camera work in the one rAF loop: no second loop.
- **Nothing is locked behind a stamp.** The passport (`src/passport/`) rewards reading; it never gates a word of content or the contact path. A section is stamped after five seconds near the middle of the screen and a scroll past it. Progress is a list of stamp ids in `localStorage`, nothing else.
- **Do not copy another site's concept, characters, copy or assets.** A friend's portfolio (rilga.vercel.app, a museum with a guard character, rooms you walk between, a flashlight and per-room speech bubbles) was the reference for "interactive" on 2026-11-20. Common patterns are free to use: skip-intro, arrow-key navigation, deep links, a language toggle, aria-live announcements. The following are not ours to build: a guide character with speech bubbles, rooms you slide between, a flashlight or cursor spotlight, per-page narration, or any file or sentence from that site.
- **Colour is semantic and follows the device.** Components use `bg-void` (the night sky, or the chart paper by day), `text-primary` (the starlight, or the ink), `text-muted`, `border-edge` (the hairline), `bg-surface`, `text-accent` (the single amber) and `text-on-accent`; `src/index.css` swaps the values behind them with `prefers-color-scheme`. Never write a hex colour or a `dark:` class in a component, and never add a second accent. `src/lib/contrast.test.ts` reads `index.css` and fails if any text pair drops under 4.5:1 in either mode.
- **`src/index.css` contains `@source not '../docs'`.** Tailwind scans the whole repo and the plan documents name utility classes in prose. Removing that line makes "this class is in the bundle" stop proving anything.

## Before pinning a package version

Query the registry — `npm view <pkg> version`. Versions recalled from memory were wrong every time in this project, including three majors. TypeScript is deliberately held at 6.x: typescript-eslint refuses to load under 7 and the section import boundary silently matches nothing.

## Commands

```bash
npm run dev        # dev server
npm test           # vitest, currently 415 tests across 44 files
npm run lint       # eslint, includes the import boundary
npm run build      # tsc --noEmit && vite build
npm run avatar     # REFUSES without --force. The hero portrait is the owner's own file.
```

**`public/profile/avatar.webp` is the owner's, not the project's.** He replaced the generated crop with his own photo on 2026-08-22 and asked that it not be touched; `npm run avatar` refuses without `--force` for that reason. `src/sections/hero-avatar.test.ts` fails if `Hero.tsx`'s declared width/height stop matching the file's aspect ratio, which is what silently broke twice before that guard existed.

`npm run placeholders` also exists and is **destructive now**: it overwrites every asset the data references — the real avatar, all fourteen certificate scans, the thumbnails, the OG cover and the real CV PDF — with generated stand-ins, unconditionally. It was the right tool while the content was fixtures. Do not run it without meaning to.
