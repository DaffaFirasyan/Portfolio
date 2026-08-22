# PORTFOLIO-REACT

One-page portfolio site. Vite 8 + React 19 + TypeScript 6 + Tailwind 4, tested with Vitest.

## Start here

**Read `docs/superpowers/HANDOFF.md` before doing anything else.** It carries current state, the next plan to execute, the spec decisions that were revised after approval, and the environment traps that each cost real time to discover.

Work is sequenced as plans in `docs/superpowers/plans/`, executed one task at a time. `docs/superpowers/specs/` is the authority on design decisions.

**The site is live at https://daffafirasyan-portfolio.vercel.app** as of 2026-08-22, deploying from `main` on `https://github.com/DaffaFirasyan/Portfolio.git` — a **public** repo. A push to `main` triggers a Vercel rebuild.

The repository being public matters when adding files: anything committed is permanent in history even if deleted later.

## Rules that are enforced, not just preferred

- **All copy comes from `src/data/`.** Replacing content must touch only `src/data/` and `public/` — never a component. The real content landed on 2026-08-22 and held to this exactly.
- **Nothing in `Konten_Asli/` may be committed**, except its `README.md`. It holds unredacted certificate scans and a real CV; `.gitignore` covers it, and a file committed once stays in history after it is deleted. Never `git add -f` out of it. `docs/KONTEN_ASLI.md` is the safe, committed spec of what belongs there.
- **Never `git add -A`.** The owner edits files while a session is running, and a blanket stage absorbs his work into a commit that does not mention it. Stage the paths the task touched. He has replaced assets mid-session more than once — check `git status` before staging.
- **Sections may not import any vendored UI directory.** ESLint blocks `components/reactbits/`, `components/aceternity/` and `components/lightswind/` from `src/sections/`. The fix is a wrapper in `src/motion/`, never an exception in the config.
- **Vendor third-party components by hand; never run their CLI.** `npx shadcn add`, `npx lightswind add` and friends assume a `components.json`, a `components/ui/` path, a `cn` helper in `@/lib/utils`, and a JS Tailwind config. This project has none of those. Copy the source in, read it, own it — and expect to edit it: every component vendored so far has needed fixes before it could ship.
- **An asset the owner supplies is not the format its extension claims.** Three in a row arrived as PNG named `.webp`, one of them 5 MB in the LCP slot. Browsers sniff content so nothing fails; check format and pixel dimensions with `sharp` before trusting any new file in `public/`.
- **Reduced motion is honoured through `useMotionAllowed()` only.** Do not test media queries inside a component; gating spread around is gating that gets forgotten somewhere.
- **`src/index.css` contains `@source not '../docs'`.** Tailwind scans the whole repo and the plan documents name utility classes in prose. Removing that line makes "this class is in the bundle" stop proving anything.

## Before pinning a package version

Query the registry — `npm view <pkg> version`. Versions recalled from memory were wrong every time in this project, including three majors. TypeScript is deliberately held at 6.x: typescript-eslint refuses to load under 7 and the section import boundary silently matches nothing.

## Commands

```bash
npm run dev        # dev server
npm test           # vitest, currently 330 tests across 45 files
npm run lint       # eslint, includes the import boundary
npm run build      # tsc --noEmit && vite build
npm run avatar     # REFUSES without --force. The hero portrait is the owner's own file.
```

**`public/profile/avatar.webp` is the owner's, not the project's.** He replaced the generated crop with his own photo on 2026-08-22 and asked that it not be touched; `npm run avatar` refuses without `--force` for that reason. `src/sections/hero-avatar.test.ts` fails if `Hero.tsx`'s declared width/height stop matching the file's aspect ratio, which is what silently broke twice before that guard existed.

`npm run placeholders` also exists and is **destructive now**: it overwrites every asset the data references — the real avatar, all fourteen certificate scans, the thumbnails, the OG cover and the real CV PDF — with generated stand-ins, unconditionally. It was the right tool while the content was fixtures. Do not run it without meaning to.
