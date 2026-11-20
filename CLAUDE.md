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
- **No animation libraries, and no vendored UI kits.** The 2026-11-11 redesign deleted `reactbits/`, `aceternity/` and `lightswind/` and uninstalled `gsap`, `motion`, `lenis`, `ogl` and `cobe`. Motion is CSS only: colour and width transitions, always with `motion-reduce:` where something moves. If a component is ever vendored again, copy the source in by hand and never run its CLI (`npx shadcn add` and friends assume a `components.json`, a `cn` helper and a JS Tailwind config this project does not have), and expect to edit it.
- **An asset the owner supplies is not the format its extension claims.** Three in a row arrived as PNG named `.webp`, one of them 5 MB in the LCP slot. Browsers sniff content so nothing fails; check format and pixel dimensions with `sharp` before trusting any new file in `public/`.
- **Motion is CSS, and honours reduced motion in CSS.** The only moving things are the letterpress stamp, the hairline that draws in above each section, and colour and underline transitions. Each sits inside `@media (prefers-reduced-motion: no-preference)` or carries `motion-reduce:`. There is no JavaScript that reads the setting and no animation library; do not add either without asking.
- **Colour is semantic and follows the device.** Components use `bg-void` (the paper), `text-primary` (the ink), `text-muted`, `border-edge` (the hairline), `bg-surface`, `text-accent` (the single seal colour) and `text-on-accent`; `src/index.css` swaps the values behind them with `prefers-color-scheme`. Never write a hex colour or a `dark:` class in a component, and never add a second accent. Every text pair was computed to clear 4.5:1 in both modes; check a new one before using it.
- **`src/index.css` contains `@source not '../docs'`.** Tailwind scans the whole repo and the plan documents name utility classes in prose. Removing that line makes "this class is in the bundle" stop proving anything.

## Before pinning a package version

Query the registry — `npm view <pkg> version`. Versions recalled from memory were wrong every time in this project, including three majors. TypeScript is deliberately held at 6.x: typescript-eslint refuses to load under 7 and the section import boundary silently matches nothing.

## Commands

```bash
npm run dev        # dev server
npm test           # vitest, currently 221 tests across 30 files
npm run lint       # eslint, includes the import boundary
npm run build      # tsc --noEmit && vite build
npm run avatar     # REFUSES without --force. The hero portrait is the owner's own file.
```

**`public/profile/avatar.webp` is the owner's, not the project's.** He replaced the generated crop with his own photo on 2026-08-22 and asked that it not be touched; `npm run avatar` refuses without `--force` for that reason. `src/sections/hero-avatar.test.ts` fails if `Hero.tsx`'s declared width/height stop matching the file's aspect ratio, which is what silently broke twice before that guard existed.

`npm run placeholders` also exists and is **destructive now**: it overwrites every asset the data references — the real avatar, all fourteen certificate scans, the thumbnails, the OG cover and the real CV PDF — with generated stand-ins, unconditionally. It was the right tool while the content was fixtures. Do not run it without meaning to.
