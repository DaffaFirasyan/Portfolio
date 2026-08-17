# Foundation & Content Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, readable, deployable one-page portfolio whose every string comes from typed data files, guarded by a test suite that fails loudly when content violates its layout contract.

**Architecture:** Content lives in `src/data/*.ts` behind types in `src/types/index.ts`. Section components read that data and render semantic HTML — no animation, no React Bits, no hardcoded copy. A single Vitest suite enforces eleven invariants over the data, including a *stress* rule that fails if the skeleton content is too short to exercise the layout. An ESLint boundary rule makes the React Bits isolation from spec §3.2 a CI failure rather than a matter of memory.

**Tech Stack:** Vite 8.2.1, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, Vitest 4.1.10, Testing Library 16.3.2, Fontsource variable fonts 5.3.0. Every version below was resolved from the registry on 2026-08-17; if `npm i` reports a newer one, prefer the newer and note it.

**Covers:** Spec phases 0–1. Navigation, motion primitives, and WebGL are out of scope here — they arrive in plans 2 and 3.

**Reference:** `docs/superpowers/specs/2026-08-17-portfolio-onepage-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | Build and type configuration |
| `eslint.config.js` | Lint rules, including the `src/sections/**` → React Bits import ban |
| `src/index.css` | Tailwind import, design tokens as `@theme` variables, base styles |
| `src/main.tsx` | React root, font imports |
| `src/App.tsx` | Assembles the seven sections in order |
| `src/types/index.ts` | Every content interface plus `SectionMeta` and `SectionNavProps` |
| `src/data/constraints.ts` | The `LIMITS` table — single source of truth for content bounds |
| `src/data/sections.ts` | `SECTIONS` metadata, consumed by `App` now and navigation later |
| `src/data/profile.ts` | Name, roles, bio, socials, stats |
| `src/data/projects.ts` | Eight projects |
| `src/data/skills.ts` | Four categories, with `relatedProjectIds` pointing into projects |
| `src/data/experiences.ts` | Five entries |
| `src/data/education.ts` | One degree |
| `src/data/certificates.ts` | Fourteen certificates |
| `src/data/invariants.test.ts` | All eleven data invariants |
| `src/components/layout/SectionShell.tsx` | Shared eyebrow / number / title / spacing wrapper |
| `src/sections/*.tsx` | Seven section components, static |
| `src/test/setup.ts` | Testing Library matchers |

Data files are split per collection rather than lumped into one module: they change independently, and the engineer replacing skeleton content with real content should open exactly one file per content type.

---

## Task 1: Scaffold the project

The repository already contains `.git`, `.gitignore`, and `docs/`. `npm create vite` prompts interactively when the directory is not empty, so every file is written explicitly instead.

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "portfolio-react",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install runtime and build dependencies**

```bash
npm i react@19.2.8 react-dom@19.2.8 && npm i -D vite@8.2.1 @vitejs/plugin-react@6.0.5 typescript@6.0.3 @types/react@19.2.18 @types/react-dom@19.2.4 @types/node@22.20.1
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

**TypeScript is pinned to 6.0.3, not the 7.0.2 that `npm view` reports as `latest`.** typescript-eslint 8.67.0 refuses to load under TS 7 — it carries an explicit guard and a peer range of `>=4.8.4 <6.1.0` — and ESLint alone cannot parse TypeScript, so under TS 7 the import boundary in Task 3 would match nothing at all while still exiting 0. TS 7 buys a static portfolio site nothing that would justify that. Revisit when typescript-eslint ships TS 7 support.

`baseUrl` is absent on purpose. TS 7 removes it outright (`TS5102`) and 6.x already deprecates it; omitting it works in both, at the cost of `paths` values needing to be relative — hence `./src/*` rather than `src/*`.

`@types/node` is in the dev dependencies above because `vite.config.ts` sits in `include` and imports `node:url`. Nothing else provides those types, not even transitively through Vite.

- [ ] **Step 4: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daffa Firasyan — AI/ML Engineer</title>
    <meta
      name="description"
      content="Portfolio of Daffa Firasyan. Retrieval systems, knowledge graphs, and web engineering. Projects, certificates, and experience."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 8: Write a temporary `src/App.tsx`**

Replaced in Task 16. It exists now only so the dev server boots.

```tsx
export default function App() {
  return <main>Portfolio</main>;
}
```

- [ ] **Step 9: Verify the build compiles**

Run: `npm run build`
Expected: exits 0, creates `dist/`.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/ && git commit -m "chore: scaffold vite + react 19 + typescript"
```

---

## Task 2: Design tokens and typography

Tailwind v4 is configured in CSS, not in a JS config file. `@theme` variables named `--color-*` and `--font-*` generate utilities automatically: `--color-accent` yields `bg-accent`, `text-accent`, `border-accent`.

**Files:**
- Create: `src/index.css`
- Modify: `vite.config.ts`, `src/main.tsx`

- [ ] **Step 1: Install Tailwind and fonts**

```bash
npm i -D tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 && npm i @fontsource-variable/bricolage-grotesque@5.3.0 @fontsource-variable/geist@5.3.0 @fontsource-variable/jetbrains-mono@5.3.0
```

- [ ] **Step 2: Add the Tailwind plugin to `vite.config.ts`**

Replace the whole file:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 3: Write `src/index.css`**

Colors are spec §2 / PRD §3.1 verbatim. The three custom text sizes fill gaps in Tailwind's default scale (PRD §3.2 asks for 2rem, 3rem, 4.5rem, 7rem; Tailwind has no 2rem step).

The `@source not` line is load-bearing. Tailwind v4 scans the whole repository by default, and this plan and the spec both name utility classes in prose — without the exclusion, `docs/` generates real CSS, and "this class is in the bundle" stops proving that any component uses it.

```css
@import 'tailwindcss';

/* Tailwind v4 scans the whole repository by default. The plan and spec name
   utility classes in prose, which would otherwise generate real CSS and make
   "this class is in the bundle" useless as proof that a component uses it. */
@source not '../docs';

@theme {
  --color-void: #0a0c10;
  --color-surface: #12161d;
  --color-elevated: #1a2029;
  --color-edge: #232c38;
  --color-primary: #e8edf2;
  --color-muted: #8a97a6;
  --color-accent: #f0a32e;
  --color-accent-2: #5ec8d8;

  --font-display: 'Bricolage Grotesque Variable', system-ui, sans-serif;
  --font-sans: 'Geist Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;

  --text-h2: 2rem;
  --text-display-sm: 3rem;
  --text-display: 4.5rem;
  --text-display-lg: 7rem;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-void);
    color: var(--color-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible {
    outline: 2px solid var(--color-accent-2);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 4: Import fonts and stylesheet in `src/main.tsx`**

Add these four lines directly above `import App from './App';`:

```tsx
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/geist';
import '@fontsource-variable/jetbrains-mono';
import './index.css';
```

- [ ] **Step 5: Verify the tokens render**

Run: `npm run dev`
Open the printed URL. Expected: page background is the near-black `#0A0C10`, not white.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/index.css src/main.tsx && git commit -m "feat: add design tokens and variable fonts"
```

---

## Task 3: ESLint with the React Bits import boundary

Spec §11 criterion 2 requires that no file in `src/sections/` imports React Bits. This task makes that a lint failure and then proves the rule actually fires.

**Files:**
- Create: `eslint.config.js`

- [ ] **Step 1: Install ESLint**

```bash
npm i -D eslint@10.8.1 @eslint/js@10.0.1 typescript-eslint@8.67.0 eslint-plugin-react-hooks@7.1.1 globals@17.11.0
```

- [ ] **Step 2: Write `eslint.config.js`**

```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['src/sections/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // The bare forms (no trailing segment) cover a barrel import such
              // as `@/components/reactbits`, which the `/**` globs alone miss.
              group: [
                '**/components/reactbits',
                '**/components/reactbits/**',
                '@/components/reactbits',
                '@/components/reactbits/**',
              ],
              message:
                'Sections must not import React Bits directly. Use a primitive from src/motion/ instead (spec §3.2).',
            },
          ],
        },
      ],
    },
  },
);
```

- [ ] **Step 3: Verify lint passes on the current tree**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 4: Prove the boundary rule fires**

Create a throwaway violation:

```bash
mkdir -p src/sections src/components/reactbits && printf "export const X = 1;\n" > src/components/reactbits/Probe.ts && printf "import { X } from '../components/reactbits/Probe';\nexport const Y = X;\n" > src/sections/Probe.ts && npm run lint; echo "exit=$?"
```

Expected: lint reports the message `Sections must not import React Bits directly…` and `exit=1`.

- [ ] **Step 5: Delete the probe files**

```bash
rm src/sections/Probe.ts src/components/reactbits/Probe.ts && npm run lint && echo "clean"
```

Expected: prints `clean`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json eslint.config.js && git commit -m "chore: add eslint with react bits import boundary for sections"
```

---

## Task 4: Vitest and Testing Library

**Files:**
- Create: `src/test/setup.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm i -D vitest@4.1.10 jsdom@29.0.0 @testing-library/react@16.3.2 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.4
```

- [ ] **Step 2: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Add the test block to `vite.config.ts`**

Replace the whole file:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 4: Add vitest globals to `tsconfig.json`**

Add `"types": ["vitest/globals", "node"]` inside `compilerOptions`, directly after the `"paths"` entry.

`"node"` is defensive rather than strictly required. An explicit `types` array does switch off automatic inclusion of every `@types` package, but Vite's own `dist/node/index.d.ts` opens with `/// <reference types="node" />`, and a direct reference inside an imported declaration file loads regardless of the `types` array. So `node:url` resolves either way today. Keep the entry anyway — depending on a transitive reference inside a dependency's type file to survive minor upgrades is not a bet worth taking.

`/// <reference types="vitest/config" />` at the top of `vite.config.ts` *is* strictly required: without it, `tsc` rejects the `test` block with `TS2769`.

jsdom is pinned one major behind its latest. jsdom 30 requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`; if the local Node is older, npm installs it anyway with only an `EBADENGINE` warning, leaving an unsupported combination that works until it suddenly does not — most likely during the DOM-heavy work in Tasks 13–16. jsdom 29 accepts `^22.13.0`. If the local Node satisfies jsdom 30's range, use 30 instead.

- [ ] **Step 5: Write a throwaway test to prove the runner works**

Create `src/test/smoke.test.ts`:

```ts
describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run it**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Delete the throwaway test**

```bash
rm src/test/smoke.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json src/test/setup.ts && git commit -m "chore: add vitest and testing library"
```

---

## Task 5: Content types

Interfaces follow spec §4 (PRD §5) exactly, plus the two navigation types from spec §3.1. No test — correctness here is enforced by `tsc` in every later task.

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
export interface SectionMeta {
  id: string;
  label: string;
  index: number;
}

export interface SectionNavProps {
  sections: SectionMeta[];
  activeId: string;
  progress: number;
  onNavigate: (id: string) => void;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export interface Profile {
  name: string;
  shortName: string;
  roles: string[];
  tagline: string;
  bio: string[];
  location: string;
  email: string;
  cvUrl: string;
  avatarUrl: string;
  openToWork: boolean;
  socials: SocialLink[];
  stats: Stat[];
}

export type SkillLevel = 'basic' | 'intermediate' | 'advanced';

export interface Skill {
  name: string;
  icon: string;
  level?: SkillLevel;
  relatedProjectIds?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export type ExperienceType =
  | 'work'
  | 'internship'
  | 'organization'
  | 'freelance'
  | 'volunteer'
  | 'research';

export interface Experience {
  id: string;
  role: string;
  organization: string;
  type: ExperienceType;
  location?: string;
  startDate: string;
  endDate: string | 'present';
  summary: string;
  highlights: string[];
  stack?: string[];
  logoUrl?: string;
}

export interface ProjectLinks {
  demo?: string;
  repo?: string;
  paper?: string;
  video?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  role: string;
  problem: string;
  solution: string;
  outcome?: string;
  stack: string[];
  thumbnail: string;
  images?: string[];
  links: ProjectLinks;
  featured: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | 'present';
  gpa?: string;
  highlights?: string[];
  logoUrl?: string;
}

export type CertificateCategory =
  | 'course'
  | 'competition'
  | 'workshop'
  | 'professional'
  | 'bootcamp';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: CertificateCategory;
  skills: string[];
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: add content types"
```

---

## Task 6: The LIMITS table and its stress rule

`LIMITS` is the numeric contract from spec §4.1. The *stress* helper written here is what makes skeleton-first safe: it fails when sample content is too short to exercise the layout, which is the exact failure mode spec §4.1 exists to prevent.

**Files:**
- Create: `src/data/constraints.ts`, `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/invariants.test.ts`:

```ts
import { LIMITS, longest, STRESS_RATIO } from './constraints';

describe('constraints', () => {
  it('exposes the documented limits', () => {
    expect(LIMITS.profile.tagline).toBe(120);
    expect(LIMITS.project.title).toBe(48);
    expect(LIMITS.counts.projectsMax).toBe(9);
  });

  it('longest() returns the length of the longest string', () => {
    expect(longest(['ab', 'abcd', 'a'])).toBe(4);
    expect(longest([])).toBe(0);
  });

  it('stress ratio requires samples to reach 90% of a limit', () => {
    expect(STRESS_RATIO).toBe(0.9);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./constraints"`.

- [ ] **Step 3: Write `src/data/constraints.ts`**

```ts
export const STRESS_RATIO = 0.9;

export const LIMITS = {
  profile: { tagline: 120, role: 28, bioParagraph: 420, roles: 4, bio: 3 },
  project: { title: 48, problem: 180, solution: 180, outcome: 140, role: 40, stack: 6 },
  experience: { role: 48, organization: 40, summary: 140, highlight: 160, highlights: 4 },
  certificate: { title: 72, issuer: 40, skills: 4 },
  education: { highlight: 160, highlights: 3 },
  skill: { name: 24 },
  counts: { projectsMin: 4, projectsMax: 9, featuredMax: 3 },
} as const;

export function longest(values: string[]): number {
  return values.reduce((max, value) => Math.max(max, value.length), 0);
}
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/data/constraints.ts src/data/invariants.test.ts && git commit -m "feat: add content constraint limits"
```

---

## Task 7: Projects data

Eight projects, spec §4.1. Content is placeholder to be replaced later — but written near the limits so the grid is stress-tested now rather than after the real content arrives.

**Files:**
- Create: `src/data/projects.ts`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { projects } from './projects';

describe('projects', () => {
  it('has a count inside the documented range', () => {
    expect(projects.length).toBeGreaterThanOrEqual(LIMITS.counts.projectsMin);
    expect(projects.length).toBeLessThanOrEqual(LIMITS.counts.projectsMax);
  });

  it('has unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every project a problem and an outcome', () => {
    for (const p of projects) {
      expect(p.problem.trim(), `${p.id}.problem`).not.toBe('');
      expect(p.outcome?.trim() ?? '', `${p.id}.outcome`).not.toBe('');
    }
  });

  it('marks at most three projects as featured', () => {
    expect(projects.filter((p) => p.featured).length).toBeLessThanOrEqual(
      LIMITS.counts.featuredMax,
    );
  });

  it('keeps text fields inside their limits', () => {
    for (const p of projects) {
      expect(p.title.length, `${p.id}.title`).toBeLessThanOrEqual(LIMITS.project.title);
      expect(p.problem.length, `${p.id}.problem`).toBeLessThanOrEqual(LIMITS.project.problem);
      expect(p.solution.length, `${p.id}.solution`).toBeLessThanOrEqual(LIMITS.project.solution);
      expect(p.outcome?.length ?? 0, `${p.id}.outcome`).toBeLessThanOrEqual(LIMITS.project.outcome);
      expect(p.role.length, `${p.id}.role`).toBeLessThanOrEqual(LIMITS.project.role);
      expect(p.stack.length, `${p.id}.stack`).toBeLessThanOrEqual(LIMITS.project.stack);
    }
  });

  it('stresses the layout — some project reaches 90% of each text limit', () => {
    expect(longest(projects.map((p) => p.title))).toBeGreaterThanOrEqual(
      LIMITS.project.title * STRESS_RATIO,
    );
    expect(longest(projects.map((p) => p.problem))).toBeGreaterThanOrEqual(
      LIMITS.project.problem * STRESS_RATIO,
    );
    expect(Math.max(...projects.map((p) => p.stack.length))).toBeGreaterThanOrEqual(
      LIMITS.project.stack * STRESS_RATIO,
    );
  });

  it('never carries an empty link value', () => {
    for (const p of projects) {
      for (const [key, value] of Object.entries(p.links)) {
        expect(value, `${p.id}.links.${key}`).toBeTruthy();
        expect(() => new URL(value as string)).not.toThrow();
      }
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./projects"`.

- [ ] **Step 3: Write `src/data/projects.ts`**

```ts
import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'kg-maintenance-assistant',
    title: 'Predictive Maintenance Knowledge Graph Assistant',
    category: 'AI/ML',
    year: 2026,
    role: 'Solo — AI Engineer and system designer',
    problem:
      'Maintenance teams across three plantation sites recorded equipment faults as free-form text in separate spreadsheets, so the same recurring failure was never recognised as recurring.',
    solution:
      'Built a retrieval pipeline that extracts entities from work orders into a Neo4j graph, then answers natural-language questions by walking the graph before prompting the language model.',
    outcome:
      'Cut the time to trace a repeat fault from roughly forty minutes of manual search to under two minutes.',
    stack: ['Python', 'Neo4j', 'FastAPI', 'LangChain', 'Groq', 'Docker'],
    thumbnail: '/projects/kg-maintenance-assistant.webp',
    links: { repo: 'https://github.com/example/kg-maintenance-assistant' },
    featured: true,
  },
  {
    id: 'sentiment-dashboard',
    title: 'Indonesian Product Review Sentiment Dashboard',
    category: 'Data',
    year: 2025,
    role: 'Team of 3 — data pipeline',
    problem:
      'A small seller had thousands of marketplace reviews in Bahasa Indonesia and no way to tell which product complaints were growing month over month.',
    solution:
      'Fine-tuned a multilingual transformer for three-class sentiment, then surfaced weekly aspect trends in a dashboard the seller could read without training.',
    outcome: 'Reached 87% macro F1 on a held-out set of 2,400 hand-labelled reviews.',
    stack: ['Python', 'Transformers', 'Streamlit', 'Pandas'],
    thumbnail: '/projects/sentiment-dashboard.webp',
    links: { repo: 'https://github.com/example/sentiment-dashboard' },
    featured: true,
  },
  {
    id: 'campus-room-booking',
    title: 'Campus Room Booking System',
    category: 'Web',
    year: 2025,
    role: 'Team of 4 — backend lead',
    problem:
      'Room bookings ran through a group chat, so double bookings were discovered only when two classes arrived at the same room.',
    solution:
      'Built a booking service with conflict detection at the database level and a calendar view that shows availability before a request is submitted.',
    outcome: 'Used by 59 students and staff across one semester with no double booking reported.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma'],
    thumbnail: '/projects/campus-room-booking.webp',
    links: {
      demo: 'https://example.com/room-booking',
      repo: 'https://github.com/example/campus-room-booking',
    },
    featured: true,
  },
  {
    id: 'ocr-invoice-parser',
    title: 'Invoice Field Extractor',
    category: 'AI/ML',
    year: 2025,
    role: 'Solo',
    problem:
      'A finance team retyped totals and dates from scanned supplier invoices, which meant slow entry and frequent transcription errors.',
    solution:
      'Combined layout-aware OCR with a rule pass that validates extracted totals against line items before anything is written.',
    outcome: 'Extracted the four key fields correctly on 92% of a 300-invoice sample.',
    stack: ['Python', 'PaddleOCR', 'FastAPI'],
    thumbnail: '/projects/ocr-invoice-parser.webp',
    links: { repo: 'https://github.com/example/ocr-invoice-parser' },
    featured: false,
  },
  {
    id: 'thesis-corpus-explorer',
    title: 'Thesis Corpus Explorer',
    category: 'Data',
    year: 2024,
    role: 'Solo',
    problem:
      'Students searching past theses could only match exact titles, so closely related work in another department stayed invisible.',
    solution:
      'Embedded every abstract and exposed nearest-neighbour search with a topic map, so related work surfaces even when the wording differs.',
    outcome: 'Indexed 1,850 abstracts with sub-second search on commodity hardware.',
    stack: ['Python', 'FAISS', 'Flask'],
    thumbnail: '/projects/thesis-corpus-explorer.webp',
    links: { repo: 'https://github.com/example/thesis-corpus-explorer' },
    featured: false,
  },
  {
    id: 'attendance-vision',
    title: 'Attendance by Face Recognition',
    category: 'AI/ML',
    year: 2024,
    role: 'Team of 3 — model training',
    problem:
      'Paper attendance sheets for a 120-student lecture took ten minutes per session and were easy to sign on behalf of someone else.',
    solution:
      'Trained a face embedding model on enrolled students and matched against a gallery at the door, with a manual fallback for failed matches.',
    outcome: 'Recorded a full lecture in under 90 seconds at 96% top-1 match accuracy.',
    stack: ['Python', 'PyTorch', 'OpenCV'],
    thumbnail: '/projects/attendance-vision.webp',
    links: { repo: 'https://github.com/example/attendance-vision' },
    featured: false,
  },
  {
    id: 'kos-finder',
    title: 'Student Housing Finder',
    category: 'Web',
    year: 2024,
    role: 'Solo',
    problem:
      'Listings for student housing near campus were scattered across social media posts with no consistent price or distance information.',
    solution:
      'Scraped and normalised listings into one searchable map with filters for price, distance to campus, and facilities.',
    outcome: 'Normalised 340 listings and reduced a typical search from hours to minutes.',
    stack: ['TypeScript', 'React', 'Leaflet'],
    thumbnail: '/projects/kos-finder.webp',
    links: { demo: 'https://example.com/kos-finder' },
    featured: false,
  },
  {
    id: 'rainfall-forecast',
    title: 'Regional Rainfall Forecast Baseline',
    category: 'Data',
    year: 2023,
    role: 'Solo',
    problem:
      'Plantation scheduling relied on a single national forecast that was too coarse to be useful at the level of an individual estate.',
    solution:
      'Trained a gradient-boosted baseline on ten years of station data and compared it honestly against the naive persistence forecast.',
    outcome: 'Beat the persistence baseline by 14% RMSE on next-day rainfall.',
    stack: ['Python', 'scikit-learn', 'Matplotlib'],
    thumbnail: '/projects/rainfall-forecast.webp',
    links: { repo: 'https://github.com/example/rainfall-forecast' },
    featured: false,
  },
];
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass. If the stress test fails, lengthen the longest `title`, `problem`, or `stack` until it reaches 90% of its limit — do not lower the limit.

- [ ] **Step 5: Commit**

```bash
git add src/data/projects.ts src/data/invariants.test.ts && git commit -m "feat: add projects data with invariants"
```

---

## Task 8: Skills data and referential integrity

Rule 2 of spec §4.2. Without it, the skill-to-project cross-highlight in PRD §7.3 fails silently — the hover simply highlights nothing and no error is ever raised.

**Files:**
- Create: `src/data/skills.ts`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { skillCategories } from './skills';

describe('skills', () => {
  const allSkills = skillCategories.flatMap((c) => c.skills);

  it('has three or four categories with unique ids', () => {
    expect(skillCategories.length).toBeGreaterThanOrEqual(3);
    expect(skillCategories.length).toBeLessThanOrEqual(4);
    const ids = skillCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps skill names inside the limit', () => {
    for (const s of allSkills) {
      expect(s.name.length, s.name).toBeLessThanOrEqual(LIMITS.skill.name);
    }
  });

  it('stresses the layout — some skill name reaches 90% of the limit', () => {
    expect(longest(allSkills.map((s) => s.name))).toBeGreaterThanOrEqual(
      LIMITS.skill.name * STRESS_RATIO,
    );
  });

  it('only references project ids that exist', () => {
    const projectIds = new Set(projects.map((p) => p.id));
    for (const s of allSkills) {
      for (const id of s.relatedProjectIds ?? []) {
        expect(projectIds.has(id), `${s.name} references missing project "${id}"`).toBe(true);
      }
    }
  });

  it('links at least one skill to a project so cross-highlight has something to show', () => {
    expect(allSkills.some((s) => (s.relatedProjectIds?.length ?? 0) > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./skills"`.

- [ ] **Step 3: Write `src/data/skills.ts`**

Every `relatedProjectIds` value below matches an `id` in `src/data/projects.ts`.

```ts
import type { SkillCategory } from '@/types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    name: 'Languages & Frameworks',
    skills: [
      { name: 'Python', icon: 'code', level: 'advanced', relatedProjectIds: ['kg-maintenance-assistant', 'sentiment-dashboard', 'ocr-invoice-parser'] },
      { name: 'TypeScript', icon: 'code', level: 'intermediate', relatedProjectIds: ['campus-room-booking', 'kos-finder'] },
      { name: 'React', icon: 'component', level: 'intermediate', relatedProjectIds: ['kos-finder'] },
      { name: 'Next.js', icon: 'layers', level: 'intermediate', relatedProjectIds: ['campus-room-booking'] },
      { name: 'FastAPI', icon: 'server', level: 'intermediate', relatedProjectIds: ['kg-maintenance-assistant', 'ocr-invoice-parser'] },
      { name: 'SQL', icon: 'database', level: 'intermediate', relatedProjectIds: ['campus-room-booking'] },
    ],
  },
  {
    id: 'data-ai',
    name: 'Data & AI',
    skills: [
      { name: 'PyTorch', icon: 'brain', level: 'intermediate', relatedProjectIds: ['attendance-vision'] },
      { name: 'Transformers', icon: 'brain', level: 'intermediate', relatedProjectIds: ['sentiment-dashboard'] },
      { name: 'Retrieval-Augmented Gen', icon: 'search', level: 'advanced', relatedProjectIds: ['kg-maintenance-assistant'] },
      { name: 'Knowledge Graphs', icon: 'share-2', level: 'intermediate', relatedProjectIds: ['kg-maintenance-assistant'] },
      { name: 'scikit-learn', icon: 'chart', level: 'intermediate', relatedProjectIds: ['rainfall-forecast'] },
      { name: 'Computer Vision', icon: 'eye', level: 'basic', relatedProjectIds: ['attendance-vision', 'ocr-invoice-parser'] },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Platforms',
    skills: [
      { name: 'Neo4j', icon: 'database', level: 'intermediate', relatedProjectIds: ['kg-maintenance-assistant'] },
      { name: 'PostgreSQL', icon: 'database', level: 'intermediate', relatedProjectIds: ['campus-room-booking'] },
      { name: 'Docker', icon: 'box', level: 'intermediate', relatedProjectIds: ['kg-maintenance-assistant'] },
      { name: 'Git', icon: 'git-branch', level: 'advanced' },
      { name: 'Vercel', icon: 'triangle', level: 'intermediate' },
    ],
  },
  {
    id: 'domain',
    name: 'Domain',
    skills: [
      { name: 'Technical Writing', icon: 'pen', level: 'intermediate' },
      { name: 'Asset Management', icon: 'wrench', level: 'basic', relatedProjectIds: ['kg-maintenance-assistant'] },
      { name: 'Research Methods', icon: 'flask', level: 'intermediate' },
    ],
  },
];
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/skills.ts src/data/invariants.test.ts && git commit -m "feat: add skills data with referential integrity checks"
```

---

## Task 9: Profile data

**Files:**
- Create: `src/data/profile.ts`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { profile } from './profile';

describe('profile', () => {
  it('keeps the tagline inside the limit and near it', () => {
    expect(profile.tagline.length).toBeLessThanOrEqual(LIMITS.profile.tagline);
    expect(profile.tagline.length).toBeGreaterThanOrEqual(
      LIMITS.profile.tagline * STRESS_RATIO,
    );
  });

  it('has three or four roles inside the length limit', () => {
    expect(profile.roles.length).toBeGreaterThanOrEqual(3);
    expect(profile.roles.length).toBeLessThanOrEqual(LIMITS.profile.roles);
    for (const role of profile.roles) {
      expect(role.length, role).toBeLessThanOrEqual(LIMITS.profile.role);
    }
    expect(longest(profile.roles)).toBeGreaterThanOrEqual(
      LIMITS.profile.role * STRESS_RATIO,
    );
  });

  it('has two or three bio paragraphs inside the length limit', () => {
    expect(profile.bio.length).toBeGreaterThanOrEqual(2);
    expect(profile.bio.length).toBeLessThanOrEqual(LIMITS.profile.bio);
    for (const paragraph of profile.bio) {
      expect(paragraph.length).toBeLessThanOrEqual(LIMITS.profile.bioParagraph);
    }
    expect(longest(profile.bio)).toBeGreaterThanOrEqual(
      LIMITS.profile.bioParagraph * STRESS_RATIO,
    );
  });

  it('has a valid email and social urls', () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    for (const social of profile.socials) {
      expect(() => new URL(social.url), social.label).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./profile"`.

- [ ] **Step 3: Write `src/data/profile.ts`**

Placeholder content, to be replaced with real details later.

```ts
import type { Profile } from '@/types';

export const profile: Profile = {
  name: 'Daffa Firasyan',
  shortName: 'Daffa',
  roles: [
    'AI/ML Engineer',
    'Knowledge Graph Engineer',
    'Full-Stack Developer',
    'Information Systems',
  ],
  tagline:
    'I build retrieval systems that turn scattered maintenance records into answers engineers can act on in the field.',
  bio: [
    'I am an Information Systems student finishing a thesis on decision support for industrial asset maintenance, where a language model answers questions by walking a knowledge graph built from years of unstructured work orders instead of guessing from raw text.',
    'Most of my work sits between data and the people who have to use it. I have built retrieval pipelines, trained classifiers on Indonesian text, and shipped web applications that small teams actually keep using after the demo is over, which is the part that usually decides whether a project mattered.',
    'I am looking for work where the hard part is the domain rather than the framework — messy operational data, unclear requirements, and users who will tell you plainly when the output is wrong.',
  ],
  location: 'Bandung, Indonesia',
  email: 'hello@example.com',
  cvUrl: '/cv/daffa-firasyan-cv.pdf',
  avatarUrl: '/profile/avatar.webp',
  openToWork: true,
  socials: [
    { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/example', icon: 'linkedin' },
  ],
  stats: [
    { label: 'Projects', value: 8 },
    { label: 'Certificates', value: 14 },
    { label: 'Years coding', value: 4, suffix: '+' },
  ],
};
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass. If a stress assertion fails, lengthen that string rather than lowering its limit.

- [ ] **Step 5: Commit**

```bash
git add src/data/profile.ts src/data/invariants.test.ts && git commit -m "feat: add profile data with invariants"
```

---

## Task 10: Experience data

**Files:**
- Create: `src/data/experiences.ts`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { experiences } from './experiences';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe('experiences', () => {
  it('has unique ids', () => {
    const ids = experiences.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps text fields inside their limits', () => {
    for (const e of experiences) {
      expect(e.role.length, `${e.id}.role`).toBeLessThanOrEqual(LIMITS.experience.role);
      expect(e.organization.length, `${e.id}.organization`).toBeLessThanOrEqual(
        LIMITS.experience.organization,
      );
      expect(e.summary.length, `${e.id}.summary`).toBeLessThanOrEqual(LIMITS.experience.summary);
      expect(e.highlights.length, `${e.id}.highlights`).toBeGreaterThanOrEqual(2);
      expect(e.highlights.length, `${e.id}.highlights`).toBeLessThanOrEqual(
        LIMITS.experience.highlights,
      );
      for (const h of e.highlights) {
        expect(h.length, `${e.id} highlight`).toBeLessThanOrEqual(LIMITS.experience.highlight);
      }
    }
  });

  it('stresses the layout on role, organization and highlights', () => {
    expect(longest(experiences.map((e) => e.role))).toBeGreaterThanOrEqual(
      LIMITS.experience.role * STRESS_RATIO,
    );
    expect(longest(experiences.map((e) => e.organization))).toBeGreaterThanOrEqual(
      LIMITS.experience.organization * STRESS_RATIO,
    );
    expect(Math.max(...experiences.map((e) => e.highlights.length))).toBe(
      LIMITS.experience.highlights,
    );
  });

  it('uses YYYY-MM dates that do not run backwards', () => {
    for (const e of experiences) {
      expect(e.startDate, `${e.id}.startDate`).toMatch(MONTH);
      if (e.endDate !== 'present') {
        expect(e.endDate, `${e.id}.endDate`).toMatch(MONTH);
        expect(e.endDate >= e.startDate, `${e.id} ends before it starts`).toBe(true);
      }
    }
  });

  it('has at most one entry still marked present', () => {
    expect(experiences.filter((e) => e.endDate === 'present').length).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./experiences"`.

- [ ] **Step 3: Write `src/data/experiences.ts`**

```ts
import type { Experience } from '@/types';

export const experiences: Experience[] = [
  {
    id: 'thesis-research',
    role: 'Undergraduate Researcher, Decision Support',
    organization: 'Information Systems Laboratory',
    type: 'research',
    location: 'Bandung, Indonesia',
    startDate: '2026-02',
    endDate: 'present',
    summary:
      'Designing and evaluating a graph-grounded assistant for industrial asset maintenance decisions.',
    highlights: [
      'Modelled 6 years of unstructured work orders into a Neo4j schema covering assets, faults, and interventions.',
      'Built the retrieval layer that walks the graph before prompting, which removed most fabricated part numbers.',
      'Ran a blind evaluation with 12 maintenance staff comparing graph-grounded answers against plain retrieval.',
      'Wrote the full methodology chapter and defended the design in two supervisory reviews.',
    ],
    stack: ['Python', 'Neo4j', 'FastAPI', 'Groq'],
  },
  {
    id: 'data-intern',
    role: 'Data Engineering Intern',
    organization: 'Nusantara Agritech Solutions',
    type: 'internship',
    location: 'Jakarta, Indonesia',
    startDate: '2025-06',
    endDate: '2025-08',
    summary:
      'Consolidated three regional reporting spreadsheets into one warehouse table used by weekly operations.',
    highlights: [
      'Replaced a manual weekly export with a scheduled pipeline, saving roughly 6 hours of analyst time per week.',
      'Added row-level validation that caught 400 malformed records in the first month of running.',
      'Documented the schema so two other interns could extend it without asking.',
    ],
    stack: ['Python', 'Airflow', 'PostgreSQL'],
  },
  {
    id: 'lab-assistant',
    role: 'Teaching Assistant, Database Systems',
    organization: 'Faculty of Industrial Engineering',
    type: 'work',
    location: 'Bandung, Indonesia',
    startDate: '2025-02',
    endDate: '2025-12',
    summary: 'Ran weekly lab sessions and graded coursework for two cohorts of database students.',
    highlights: [
      'Taught 3 lab sections covering normalisation, indexing, and query planning to about 90 students.',
      'Rewrote the indexing lab after noticing most submissions passed without understanding the plan output.',
      'Reduced grading turnaround from two weeks to four days with a scripted correctness check.',
    ],
    stack: ['PostgreSQL', 'SQL'],
  },
  {
    id: 'student-org-tech',
    role: 'Head of Technology Division',
    organization: 'Student Association of Info Systems',
    type: 'organization',
    location: 'Bandung, Indonesia',
    startDate: '2024-09',
    endDate: '2025-08',
    summary: 'Led a team of six maintaining the association website and event registration tooling.',
    highlights: [
      'Shipped a registration system that handled 480 sign-ups across four events without manual spreadsheets.',
      'Introduced code review for the division, which cut post-deploy hotfixes noticeably over the year.',
    ],
    stack: ['TypeScript', 'Next.js', 'Supabase'],
  },
  {
    id: 'freelance-web',
    role: 'Freelance Web Developer',
    organization: 'Independent',
    type: 'freelance',
    location: 'Remote',
    startDate: '2024-01',
    endDate: '2024-08',
    summary: 'Built and handed over small business sites for three local clients.',
    highlights: [
      'Delivered three sites end to end, including hosting setup and a written handover guide for each owner.',
      'Kept every build under a 2 second load on 4G, which mattered because most visitors arrived on phones.',
    ],
    stack: ['React', 'Tailwind CSS'],
  },
];
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/experiences.ts src/data/invariants.test.ts && git commit -m "feat: add experience data with invariants"
```

---

## Task 11: Education and certificates data

Fourteen certificates, per spec §4.1 — eight are shown initially and the rest sit behind "View all", so the grid must be proven against the full set now.

**Files:**
- Create: `src/data/education.ts`, `src/data/certificates.ts`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { education } from './education';
import { certificates } from './certificates';

describe('education', () => {
  it('keeps highlights inside their limits', () => {
    for (const e of education) {
      expect(e.highlights?.length ?? 0).toBeLessThanOrEqual(LIMITS.education.highlights);
      for (const h of e.highlights ?? []) {
        expect(h.length, h).toBeLessThanOrEqual(LIMITS.education.highlight);
      }
    }
  });

  it('does not end before it starts', () => {
    for (const e of education) {
      if (e.endYear !== 'present') {
        expect(e.endYear, e.id).toBeGreaterThanOrEqual(e.startYear);
      }
    }
  });
});

describe('certificates', () => {
  it('has unique ids and at least fourteen entries', () => {
    const ids = certificates.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(certificates.length).toBeGreaterThanOrEqual(14);
  });

  it('keeps text fields inside their limits', () => {
    for (const c of certificates) {
      expect(c.title.length, `${c.id}.title`).toBeLessThanOrEqual(LIMITS.certificate.title);
      expect(c.issuer.length, `${c.id}.issuer`).toBeLessThanOrEqual(LIMITS.certificate.issuer);
      expect(c.skills.length, `${c.id}.skills`).toBeLessThanOrEqual(LIMITS.certificate.skills);
    }
  });

  it('stresses the layout on title, issuer and skill count', () => {
    expect(longest(certificates.map((c) => c.title))).toBeGreaterThanOrEqual(
      LIMITS.certificate.title * STRESS_RATIO,
    );
    expect(longest(certificates.map((c) => c.issuer))).toBeGreaterThanOrEqual(
      LIMITS.certificate.issuer * STRESS_RATIO,
    );
    expect(Math.max(...certificates.map((c) => c.skills.length))).toBe(LIMITS.certificate.skills);
  });

  it('uses YYYY-MM dates', () => {
    for (const c of certificates) {
      expect(c.issueDate, `${c.id}.issueDate`).toMatch(MONTH);
      if (c.expiryDate) expect(c.expiryDate, `${c.id}.expiryDate`).toMatch(MONTH);
    }
  });

  it('never carries a present-but-invalid credential url', () => {
    for (const c of certificates) {
      if (c.credentialUrl === undefined) continue;
      expect(c.credentialUrl, `${c.id}.credentialUrl`).not.toBe('');
      expect(() => new URL(c.credentialUrl as string), c.id).not.toThrow();
    }
  });

  it('includes at least one certificate without a credential url', () => {
    expect(certificates.some((c) => c.credentialUrl === undefined)).toBe(true);
  });
});
```

The last assertion guarantees the "render no button rather than a dead button" path from spec §7 has a case to exercise.

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./education"`.

- [ ] **Step 3: Write `src/data/education.ts`**

```ts
import type { Education } from '@/types';

export const education: Education[] = [
  {
    id: 'bachelor-is',
    institution: 'Telkom University',
    degree: 'Bachelor of Information Systems',
    field: 'Information Systems',
    startYear: 2022,
    endYear: 'present',
    gpa: '3.62 / 4.00',
    highlights: [
      'Thesis: an LLM-based decision support system for industrial plantation asset maintenance using KG-RAG.',
      'Teaching assistant for Database Systems across two cohorts, covering roughly ninety students in total.',
      'Head of Technology Division in the student association, leading a team of six for one full term.',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];
```

- [ ] **Step 4: Write `src/data/certificates.ts`**

```ts
import type { Certificate } from '@/types';

export const certificates: Certificate[] = [
  {
    id: 'deeplearning-nlp',
    title: 'Natural Language Processing with Sequence Models and Attention',
    issuer: 'DeepLearning.AI on Coursera',
    issueDate: '2025-11',
    credentialId: 'ABCD1234EFGH',
    credentialUrl: 'https://coursera.org/verify/example-nlp',
    imageUrl: '/certificates/deeplearning-nlp.webp',
    thumbnailUrl: '/certificates/thumb-deeplearning-nlp.webp',
    category: 'course',
    skills: ['NLP', 'Transformers', 'PyTorch', 'Attention'],
  },
  {
    id: 'neo4j-graph-academy',
    title: 'Neo4j Certified Professional',
    issuer: 'Neo4j GraphAcademy',
    issueDate: '2025-09',
    credentialId: 'NEO4J-2025-0912',
    credentialUrl: 'https://graphacademy.neo4j.com/verify/example',
    imageUrl: '/certificates/neo4j-graph-academy.webp',
    thumbnailUrl: '/certificates/thumb-neo4j-graph-academy.webp',
    category: 'professional',
    skills: ['Neo4j', 'Cypher', 'Graph Modelling'],
  },
  {
    id: 'aws-cloud-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issueDate: '2025-07',
    expiryDate: '2028-07',
    credentialId: 'AWS-CP-556677',
    credentialUrl: 'https://aws.amazon.com/verification/example',
    imageUrl: '/certificates/aws-cloud-practitioner.webp',
    thumbnailUrl: '/certificates/thumb-aws-cloud-practitioner.webp',
    category: 'professional',
    skills: ['AWS', 'Cloud', 'Security'],
  },
  {
    id: 'tensorflow-developer',
    title: 'TensorFlow Developer Professional Certificate',
    issuer: 'DeepLearning.AI on Coursera',
    issueDate: '2025-05',
    credentialUrl: 'https://coursera.org/verify/example-tf',
    imageUrl: '/certificates/tensorflow-developer.webp',
    thumbnailUrl: '/certificates/thumb-tensorflow-developer.webp',
    category: 'course',
    skills: ['TensorFlow', 'Deep Learning', 'Computer Vision'],
  },
  {
    id: 'bangkit-ml',
    title: 'Bangkit Academy Machine Learning Path Graduate',
    issuer: 'Bangkit Academy',
    issueDate: '2025-01',
    credentialUrl: 'https://bangkit.academy/verify/example',
    imageUrl: '/certificates/bangkit-ml.webp',
    thumbnailUrl: '/certificates/thumb-bangkit-ml.webp',
    category: 'bootcamp',
    skills: ['Machine Learning', 'Python', 'Team Project'],
  },
  {
    id: 'dicoding-backend',
    title: 'Backend Application Development Expert',
    issuer: 'Dicoding Indonesia',
    issueDate: '2024-11',
    credentialId: 'DCD-BE-90211',
    credentialUrl: 'https://dicoding.com/certificates/example-be',
    imageUrl: '/certificates/dicoding-backend.webp',
    thumbnailUrl: '/certificates/thumb-dicoding-backend.webp',
    category: 'course',
    skills: ['Node.js', 'REST API', 'PostgreSQL', 'Testing'],
  },
  {
    id: 'hackathon-winner',
    title: 'First Place, National Agritech Data Hackathon',
    issuer: 'Ministry of Agriculture',
    issueDate: '2024-10',
    imageUrl: '/certificates/hackathon-winner.webp',
    thumbnailUrl: '/certificates/thumb-hackathon-winner.webp',
    category: 'competition',
    skills: ['Data Analysis', 'Presentation'],
  },
  {
    id: 'google-data-analytics',
    title: 'Google Data Analytics Professional Certificate',
    issuer: 'Google on Coursera',
    issueDate: '2024-08',
    credentialUrl: 'https://coursera.org/verify/example-gda',
    imageUrl: '/certificates/google-data-analytics.webp',
    thumbnailUrl: '/certificates/thumb-google-data-analytics.webp',
    category: 'course',
    skills: ['SQL', 'Tableau', 'R', 'Spreadsheets'],
  },
  {
    id: 'docker-fundamentals',
    title: 'Docker Fundamentals',
    issuer: 'Docker Inc.',
    issueDate: '2024-06',
    credentialUrl: 'https://docker.com/verify/example',
    imageUrl: '/certificates/docker-fundamentals.webp',
    thumbnailUrl: '/certificates/thumb-docker-fundamentals.webp',
    category: 'course',
    skills: ['Docker', 'Containers'],
  },
  {
    id: 'ui-ux-workshop',
    title: 'Design Thinking and UI/UX Foundations Workshop',
    issuer: 'Telkom University',
    issueDate: '2024-04',
    imageUrl: '/certificates/ui-ux-workshop.webp',
    thumbnailUrl: '/certificates/thumb-ui-ux-workshop.webp',
    category: 'workshop',
    skills: ['UI/UX', 'Figma'],
  },
  {
    id: 'sql-advanced',
    title: 'Advanced SQL for Data Analysis',
    issuer: 'HackerRank',
    issueDate: '2024-02',
    credentialUrl: 'https://hackerrank.com/certificates/example-sql',
    imageUrl: '/certificates/sql-advanced.webp',
    thumbnailUrl: '/certificates/thumb-sql-advanced.webp',
    category: 'course',
    skills: ['SQL', 'Query Optimisation'],
  },
  {
    id: 'git-collaboration',
    title: 'Version Control and Team Collaboration with Git',
    issuer: 'Dicoding Indonesia',
    issueDate: '2023-12',
    credentialUrl: 'https://dicoding.com/certificates/example-git',
    imageUrl: '/certificates/git-collaboration.webp',
    thumbnailUrl: '/certificates/thumb-git-collaboration.webp',
    category: 'course',
    skills: ['Git', 'Code Review'],
  },
  {
    id: 'english-toefl',
    title: 'TOEFL ITP Score 587',
    issuer: 'ETS',
    issueDate: '2023-09',
    expiryDate: '2025-09',
    imageUrl: '/certificates/english-toefl.webp',
    thumbnailUrl: '/certificates/thumb-english-toefl.webp',
    category: 'professional',
    skills: ['English'],
  },
  {
    id: 'python-fundamentals',
    title: 'Python Programming Fundamentals',
    issuer: 'Dicoding Indonesia',
    issueDate: '2023-05',
    credentialUrl: 'https://dicoding.com/certificates/example-py',
    imageUrl: '/certificates/python-fundamentals.webp',
    thumbnailUrl: '/certificates/thumb-python-fundamentals.webp',
    category: 'course',
    skills: ['Python'],
  },
];
```

- [ ] **Step 5: Run the test**

Run: `npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/data/education.ts src/data/certificates.ts src/data/invariants.test.ts && git commit -m "feat: add education and certificate data with invariants"
```

---

## Task 12: Placeholder assets and the asset-existence invariant

Rule 10 of spec §4.2. Every image path referenced by data must resolve to a real file, so a typo fails the suite instead of rendering a broken image in production. Placeholders use the exact dimensions from spec §5, so CLS behaviour measured now is the behaviour that ships.

**Files:**
- Create: `public/projects/*.webp`, `public/certificates/*.webp`, `public/education/*.webp`, `public/profile/avatar.webp`, `public/cv/daffa-firasyan-cv.pdf`
- Modify: `src/data/invariants.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/data/invariants.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const publicPath = (url: string) => join(process.cwd(), 'public', url.replace(/^\//, ''));

describe('assets', () => {
  it('resolves every referenced file in public/', () => {
    const referenced = [
      profile.avatarUrl,
      profile.cvUrl,
      ...projects.map((p) => p.thumbnail),
      ...projects.flatMap((p) => p.images ?? []),
      ...certificates.map((c) => c.imageUrl),
      ...certificates.map((c) => c.thumbnailUrl),
      ...education.map((e) => e.logoUrl).filter((u): u is string => Boolean(u)),
      ...experiences.map((e) => e.logoUrl).filter((u): u is string => Boolean(u)),
    ];

    for (const url of referenced) {
      expect(existsSync(publicPath(url)), `missing asset: ${url}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `missing asset: /profile/avatar.webp`.

- [ ] **Step 3: Install the image tool**

```bash
npm i -D sharp@0.35.3
```

**Do not use ImageMagick.** It is not installed here, and on Windows the `convert` that sits on `PATH` at `C:\WINDOWS\system32\convert` is the FAT-to-NTFS disk utility — a command that silently means something entirely different from what an image script intends. `sharp` is dev-only, needs no external binary, and rasterises SVG, which is what gives the placeholders their labels.

- [ ] **Step 4: Write `scripts/generate-placeholders.mjs`**

The script derives the asset list **from the data files themselves** rather than from a hardcoded array, so it cannot drift from what the invariant checks. The data files are TypeScript, so it strips the type-only import and the type annotation and imports the remainder from a `data:` URL.

Dimensions come from spec §5: project thumbnails 800×500, certificate thumbnails 600×420, certificate full images 1400×1000, avatar 800×800, logos 256×256. Images are WebP quality 80 on `#12161D` with the slug drawn in `#8A97A6`.

The CV placeholder is a hand-written minimal single-page PDF with a correct cross-reference table, so no second dependency is needed. See the committed script for the full source.

- [ ] **Step 5: Add an npm script**

Add to `package.json` scripts: `"placeholders": "node scripts/generate-placeholders.mjs"`.

- [ ] **Step 6: Generate and verify**

```bash
npm run placeholders
```

Verify by reading the files back rather than trusting that they appeared — assert with sharp's `metadata()` that each group has exactly its expected dimensions, and check the RIFF/WEBP magic bytes rather than the extension. For the PDF, confirm it starts with `%PDF-`, ends with `%%EOF`, and that its `startxref` offset points at the literal string `xref`.

Expected: 38 images, 0 mismatches, and a ~570-byte PDF.

- [ ] **Step 7: Run the test**

Run: `npm test`
Expected: all pass — 32 existing plus 1 new.

- [ ] **Step 8: Prove the invariant is not vacuous**

```bash
mv public/certificates/thumb-sql-advanced.webp /tmp/held.webp && npm test; mv /tmp/held.webp public/certificates/thumb-sql-advanced.webp
```

Expected: the run without the file fails with `missing asset: /certificates/thumb-sql-advanced.webp`, and the run after restoring passes.

- [ ] **Step 9: Commit**

```bash
git add public/ scripts/ package.json package-lock.json src/data/invariants.test.ts && git commit -m "feat: add placeholder assets and asset existence invariant"
```

---

## Task 13: SectionShell

The wrapper that makes every section share one eyebrow, one number format, one title treatment, and one vertical rhythm. Spec §3.3.

**Files:**
- Create: `src/data/sections.ts`, `src/components/layout/SectionShell.tsx`, `src/components/layout/SectionShell.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/SectionShell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import SectionShell from './SectionShell';

describe('SectionShell', () => {
  it('renders the anchor id, zero-padded number, label and title', () => {
    render(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
    );

    const section = document.getElementById('about');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('01 / About')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Who I am' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./SectionShell"`.

- [ ] **Step 3: Write `src/components/layout/SectionShell.tsx`**

```tsx
import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
  children: ReactNode;
}

export default function SectionShell({ id, index, label, title, children }: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {String(index).padStart(2, '0')} / {label}
        </p>
        <h2 className="mt-3 font-display text-h2 font-bold tracking-[-0.02em] text-primary">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Write `src/data/sections.ts`**

Consumed by `App` now and by navigation in plan 2.

```ts
import type { SectionMeta } from '@/types';

export const SECTIONS: SectionMeta[] = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1 },
  { id: 'skills', label: 'Skills', index: 2 },
  { id: 'experience', label: 'Experience', index: 3 },
  { id: 'projects', label: 'Projects', index: 4 },
  { id: 'education', label: 'Education', index: 5 },
  { id: 'contact', label: 'Contact', index: 6 },
];
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/data/sections.ts && git commit -m "feat: add SectionShell and section metadata"
```

---

## Task 14: Hero, About and Skills sections

Static markup only. No animation, no React Bits — those arrive in plan 3 behind the motion primitives.

**Files:**
- Create: `src/sections/Hero.tsx`, `src/sections/About.tsx`, `src/sections/Skills.tsx`, `src/sections/sections.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/sections/sections.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import { profile } from '@/data/profile';
import { skillCategories } from '@/data/skills';

describe('Hero', () => {
  it('renders the name as the only h1, plus tagline and both calls to action', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument();
    expect(screen.getByText(profile.tagline)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: /download cv/i })).toHaveAttribute('href', profile.cvUrl);
  });
});

describe('About', () => {
  it('renders every bio paragraph and the avatar with descriptive alt text', () => {
    render(<About />);
    for (const paragraph of profile.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByRole('img', { name: new RegExp(profile.name, 'i') })).toBeInTheDocument();
  });
});

describe('Skills', () => {
  it('renders every category name and every skill name', () => {
    render(<Skills />);
    for (const category of skillCategories) {
      expect(screen.getByRole('heading', { level: 3, name: category.name })).toBeInTheDocument();
      for (const skill of category.skills) {
        expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./Hero"`.

- [ ] **Step 3: Write `src/sections/Hero.tsx`**

`100svh` rather than `100vh` per spec, so the mobile address bar does not clip the section.

```tsx
import { profile } from '@/data/profile';

export default function Hero() {
  return (
    <section id="home" className="flex min-h-[100svh] items-center py-24">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {profile.location}
              {profile.openToWork ? ' — Open to work' : ''}
            </p>

            <h1 className="mt-4 font-display text-display-sm font-extrabold leading-none tracking-[-0.02em] text-primary md:text-display">
              {profile.name}
            </h1>

            <p className="mt-4 text-xl font-semibold text-accent-2">{profile.roles[0]}</p>
            <p className="mt-4 max-w-[52ch] text-muted">{profile.tagline}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-void"
              >
                View projects
              </a>
              <a
                href={profile.cvUrl}
                download
                className="rounded-full border border-edge px-5 py-2.5 text-sm font-semibold text-muted"
              >
                Download CV
              </a>
            </div>

            <dl className="mt-10 flex flex-wrap gap-8">
              {profile.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-primary">
                    {stat.value}
                    {stat.suffix ?? ''}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-5">
            <img
              src={profile.avatarUrl}
              alt={`${profile.name}, ${profile.roles[0]}`}
              width={800}
              height={800}
              className="w-full max-w-sm rounded-xl border border-edge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `src/sections/About.tsx`**

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { profile } from '@/data/profile';

export default function About() {
  return (
    <SectionShell id="about" index={1} label="About" title="Who I am">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <img
            src={profile.avatarUrl}
            alt={`${profile.name} at work`}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl border border-edge"
          />
        </div>

        <div className="md:col-span-7">
          {profile.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mb-4 max-w-[68ch] text-muted">
              {paragraph}
            </p>
          ))}

          <dl className="mt-8 grid gap-4 rounded-xl border border-edge bg-surface p-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Location</dt>
              <dd className="mt-1 text-primary">{profile.location}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Status</dt>
              <dd className="mt-1 text-primary">
                {profile.openToWork ? 'Open to work' : 'Not looking right now'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 5: Write `src/sections/Skills.tsx`**

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { skillCategories } from '@/data/skills';

export default function Skills() {
  return (
    <SectionShell id="skills" index={2} label="Skills" title="What I work with">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((category) => (
          <div key={category.id} className="rounded-xl border border-edge bg-surface p-6">
            <h3 className="font-display text-lg font-bold text-primary">{category.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="rounded-full border border-edge px-3 py-1 text-sm text-muted"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Verify the import boundary still holds**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/sections/ && git commit -m "feat: add static hero, about and skills sections"
```

---

## Task 15: Experience, Projects, Education and Contact sections

The timeline is one-sided at every breakpoint, per spec §6. Optional links render nothing at all when absent rather than rendering a dead control, per spec §7.

**Files:**
- Create: `src/sections/Experience.tsx`, `src/sections/Projects.tsx`, `src/sections/Education.tsx`, `src/sections/Contact.tsx`, `src/sections/sections-lower.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/sections/sections-lower.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import Experience from './Experience';
import Projects from './Projects';
import Education from './Education';
import Contact from './Contact';
import { experiences } from '@/data/experiences';
import { projects } from '@/data/projects';
import { certificates } from '@/data/certificates';
import { profile } from '@/data/profile';

describe('Experience', () => {
  it('renders every role with its organisation and marks the current one', () => {
    render(<Experience />);
    for (const e of experiences) {
      expect(screen.getByRole('heading', { level: 3, name: e.role })).toBeInTheDocument();
      expect(screen.getAllByText(e.organization).length).toBeGreaterThan(0);
    }
    // The date line renders as "Feb 2026 — Present" in a single element,
    // so match the tail rather than the bare word.
    expect(screen.getAllByText(/— Present$/).length).toBe(
      experiences.filter((e) => e.endDate === 'present').length,
    );
  });
});

describe('Projects', () => {
  it('renders every project title and problem statement', () => {
    render(<Projects />);
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
      expect(screen.getByText(p.problem)).toBeInTheDocument();
    }
  });

  it('renders a repo link only for projects that have one', () => {
    render(<Projects />);
    const withRepo = projects.filter((p) => p.links.repo);
    expect(screen.getAllByRole('link', { name: /repository/i })).toHaveLength(withRepo.length);
  });

  it('opens external links safely', () => {
    render(<Projects />);
    for (const link of screen.getAllByRole('link', { name: /repository|live demo/i })) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });
});

describe('Education', () => {
  it('renders the degree and every certificate title', () => {
    render(<Education />);
    expect(screen.getByText('Bachelor of Information Systems')).toBeInTheDocument();
    for (const c of certificates) {
      expect(screen.getByText(c.title)).toBeInTheDocument();
    }
  });

  it('renders a verify link only for certificates that carry one', () => {
    render(<Education />);
    const verifiable = certificates.filter((c) => c.credentialUrl);
    expect(screen.getAllByRole('link', { name: /verify/i })).toHaveLength(verifiable.length);
  });
});

describe('Contact', () => {
  it('renders a mailto link and every social link', () => {
    render(<Contact />);
    const mail = screen.getByRole('link', { name: profile.email });
    expect(mail).toHaveAttribute('href', `mailto:${profile.email}`);

    const list = screen.getByRole('list', { name: /social/i });
    expect(within(list).getAllByRole('link')).toHaveLength(profile.socials.length);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./Experience"`.

- [ ] **Step 3: Write `src/sections/Experience.tsx`**

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { experiences } from '@/data/experiences';

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  const name = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${name} ${year}`;
}

export default function Experience() {
  return (
    <SectionShell id="experience" index={3} label="Experience" title="Where I have worked">
      <ol className="relative border-l border-edge pl-6">
        {experiences.map((e) => (
          <li key={e.id} className="mb-10 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] mt-2 block h-2.5 w-2.5 rounded-full bg-edge"
            />
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {formatMonth(e.startDate)} — {e.endDate === 'present' ? 'Present' : formatMonth(e.endDate)}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-primary">{e.role}</h3>
            <p className="text-accent-2">{e.organization}</p>
            <p className="mt-2 max-w-[68ch] text-muted">{e.summary}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              {e.highlights.map((h) => (
                <li key={h.slice(0, 32)}>{h}</li>
              ))}
            </ul>
            {e.stack && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {e.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-xs text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
```

- [ ] **Step 4: Write `src/sections/Projects.tsx`**

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { projects } from '@/data/projects';

export default function Projects() {
  return (
    <SectionShell id="projects" index={4} label="Projects" title="Selected work">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <article key={p.id} className="rounded-xl border border-edge bg-surface p-5">
            <img
              src={p.thumbnail}
              alt={`${p.title} preview`}
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              className="mb-4 w-full rounded-lg border border-edge"
            />
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {p.category} · {p.year}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-primary">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.problem}</p>
            {p.outcome && <p className="mt-2 text-sm text-accent-2">{p.outcome}</p>}

            <ul className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-xs text-muted"
                >
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-4 text-sm">
              {p.links.repo && (
                <a
                  href={p.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Repository
                </a>
              )}
              {p.links.demo && (
                <a
                  href={p.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Live demo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 5: Write `src/sections/Education.tsx`**

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { education } from '@/data/education';
import { certificates } from '@/data/certificates';

export default function Education() {
  return (
    <SectionShell id="education" index={5} label="Education" title="Study and certification">
      {education.map((e) => (
        <div key={e.id} className="rounded-xl border border-edge bg-surface p-6">
          <h3 className="font-display text-lg font-bold text-primary">{e.degree}</h3>
          <p className="text-accent-2">{e.institution}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {e.startYear} — {e.endYear === 'present' ? 'Present' : e.endYear}
            {e.gpa ? ` · GPA ${e.gpa}` : ''}
          </p>
          {e.highlights && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
              {e.highlights.map((h) => (
                <li key={h.slice(0, 32)}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <h3 className="mt-12 font-display text-lg font-bold text-primary">
        Certificates ({certificates.length})
      </h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c) => (
          <article key={c.id} className="rounded-xl border border-edge bg-surface p-4">
            <img
              src={c.thumbnailUrl}
              alt={`${c.title} certificate issued by ${c.issuer}`}
              width={600}
              height={420}
              loading="lazy"
              decoding="async"
              className="mb-3 w-full rounded-lg border border-edge"
            />
            <p className="text-sm font-semibold text-primary">{c.title}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {c.issuer} · {c.issueDate}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <li key={s} className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">
                  {s}
                </li>
              ))}
            </ul>
            {c.credentialUrl && (
              <a
                href={c.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-accent"
              >
                Verify credential
              </a>
            )}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 6: Write `src/sections/Contact.tsx`**

The form arrives in plan 4. This section ships the contact paths that need no backend.

```tsx
import SectionShell from '@/components/layout/SectionShell';
import { profile } from '@/data/profile';

export default function Contact() {
  return (
    <SectionShell id="contact" index={6} label="Contact" title="Let us talk">
      <p className="max-w-[60ch] text-muted">
        The fastest way to reach me is email. I read everything and reply to anything specific.
      </p>

      <a
        href={`mailto:${profile.email}`}
        className="mt-6 inline-block font-display text-2xl font-bold text-accent"
      >
        {profile.email}
      </a>

      <ul aria-label="Social links" className="mt-8 flex flex-wrap gap-4">
        {profile.socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-edge px-4 py-2 text-sm text-muted"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
```

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/sections/ && git commit -m "feat: add static experience, projects, education and contact sections"
```

---

## Task 16: Assemble the page

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';
import { SECTIONS } from '@/data/sections';

describe('App', () => {
  it('renders every section anchor in the documented order', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section')).map((s) => s.id);
    expect(ids).toEqual(SECTIONS.map((s) => s.id));
  });

  it('has exactly one h1', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('exposes a skip link as the first focusable element', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#home',
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — the current `App` renders no sections.

- [ ] **Step 3: Write `src/App.tsx`**

```tsx
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Education from '@/sections/Education';
import Contact from '@/sections/Contact';
import { profile } from '@/data/profile';

export default function App() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>

      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>

      <footer className="border-t border-edge py-10">
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            © {new Date().getFullYear()} {profile.name} · Built with React
          </p>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Verify lint, types and build together**

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: all three exit 0.

- [ ] **Step 6: Check the page in a browser**

Run: `npm run dev`

Verify by eye:
- Scrolling top to bottom reaches all seven sections with no horizontal scrollbar.
- Section numbering reads `01 / About` through `06 / Contact`.
- Narrowing the window to 320px produces no horizontal overflow.
- Pressing Tab from the top reveals the skip link before anything else.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx && git commit -m "feat: assemble the one-page layout"
```

---

## Done When

- `npm test` passes, covering eleven data invariants plus section rendering.
- `npm run lint` passes, and the boundary rule was demonstrated to fail on a violation in Task 3.
- `npm run build` succeeds.
- The page renders all seven sections with every string sourced from `src/data/`.
- No file under `src/sections/` imports from `src/components/reactbits/`.
- Replacing skeleton content with real content requires editing only `src/data/` and `public/`.

## Not In This Plan

Navigation and active-section tracking (plan 2). Motion primitives, React Bits, and the Galaxy backdrop (plan 3). Contact form, project modal, certificate lightbox, node-rail navigation, and deployment (plan 4).
