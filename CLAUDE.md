# PORTFOLIO-REACT

One-page portfolio site. Vite 8 + React 19 + TypeScript 6 + Tailwind 4, tested with Vitest.

## Start here

**Read `docs/superpowers/HANDOFF.md` before doing anything else.** It carries current state, the next plan to execute, the spec decisions that were revised after approval, and the environment traps that each cost real time to discover.

Work is sequenced as plans in `docs/superpowers/plans/`, executed one task at a time. `docs/superpowers/specs/` is the authority on design decisions.

Active branch is `feat/foundation-and-content-layer`. Nothing is merged to `main`.

## Rules that are enforced, not just preferred

- **No file under `src/sections/` may import `src/components/reactbits/`.** ESLint fails the build. The fix for a violation is a wrapper in `src/motion/`, never an exception in the config.
- **All copy comes from `src/data/`.** Replacing placeholder content must touch only `src/data/` and `public/` — never a component.
- **Reduced motion is honoured through `useMotionAllowed()` only.** Do not test media queries inside a component; gating spread around is gating that gets forgotten somewhere.
- **`src/index.css` contains `@source not '../docs'`.** Tailwind scans the whole repo and the plan documents name utility classes in prose. Removing that line makes "this class is in the bundle" stop proving anything.

## Before pinning a package version

Query the registry — `npm view <pkg> version`. Versions recalled from memory were wrong every time in this project, including three majors. TypeScript is deliberately held at 6.x: typescript-eslint refuses to load under 7 and the section import boundary silently matches nothing.

## Commands

```bash
npm run dev        # dev server
npm test           # vitest, currently 119 tests
npm run lint       # eslint, includes the import boundary
npm run build      # tsc --noEmit && vite build
npm run placeholders  # regenerate placeholder assets from src/data
```
