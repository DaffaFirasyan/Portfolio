# Contact & Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the page a working contact form, replace the pill navigation with the section-node rail the spec always intended, and get the site deployed with the metadata a recruiter's link preview and a crawler both need.

**Architecture:** Three independent pieces that happen to be last. The form keeps its logic outside React — validation and submission are pure functions over values, so the component holds only state and markup. The rail is the second implementation of the existing `SectionNavProps` contract, and swapping it in touches one file. Metadata gets one source of truth in `src/data/site.ts`, with tests that fail when `index.html`, `robots.txt` or `sitemap.xml` drift from it.

**Tech Stack:** Existing, plus the Web3Forms HTTP API. No new npm dependencies.

**Covers:** Spec phases 8, 9 and 10 — the whole remainder of the build.

**Reference:** `docs/superpowers/HANDOFF.md`, the design spec, and the five completed plans.

---

## What Already Exists

- **192 tests pass across 25 files.** `npm run lint`, `npx tsc --noEmit` and `npm run build` all exit 0.
- `src/types/index.ts` defines `SectionNavProps`; `src/nav/PillNavAdapter.tsx` is its only implementation, and `src/nav/Navbar.tsx` is the only non-test file that names it.
- `src/hooks/useActiveSection.ts` already produces `activeId` and `progress`. The rail needs no scroll code of its own.
- `src/sections/Contact.tsx` is 35 lines: a paragraph, a `mailto:` link, and the social links.
- `index.html` carries a `<title>` and a description and nothing else.
- `scripts/generate-placeholders.mjs` derives its file list from `src/data/`, so an asset added to the data is generated and asserted automatically.
- `src/data/invariants.test.ts` already asserts every referenced asset exists in `public/`.

---

## Decisions this plan makes, and what they cost

**The rail is CSS, not SVG, and not GSAP ScrollTrigger.** Spec §3.1 sketched `NodeRailNav` as "SVG kustom + GSAP ScrollTrigger". Both were written before `useActiveSection` existed. The hook already publishes `activeId` and `progress` from one IntersectionObserver; a ScrollTrigger would be a second subscription computing the same two numbers, free to disagree with the first. And the rail is a vertical line with seven dots on it — a 1px `div` and absolutely positioned children need no path math, no `viewBox` scaling, and no second animation engine. **Cost:** the rail cannot do anything a path can, such as a curved or branching track. Nothing in the spec asks for one.

**The fill is clamped to the active node's band.** Page progress and node position disagree, because sections differ in height — raw progress routinely runs the filled line past a dot the reader has not reached, which reads as a bug. `railGeometry` clamps the fill between the active node's offset and the next one's, so it moves smoothly but never overshoots. The alternative, deriving the active node from the fill instead, would put `aria-current` on whichever dot the line happened to pass — a worse answer for a screen reader.

**`PillNavAdapter` stays in the tree.** Deleting it would leave `SectionNavProps` with one implementation, which is an interface nobody has proved is an interface. It costs nothing in the bundle: `Navbar.tsx` stops importing it, so Vite never includes it. Its tests keep running.

**The form renders whether or not an access key is configured.** Web3Forms needs an account the owner has to create. Hiding the form until then would mean the form is never seen during development and the error state is never exercised. Instead a missing key resolves to the error state, which is exactly where the `mailto:` fallback already lives — one code path, and it starts working the moment the key lands in `.env`.

**A filled honeypot reports success and sends nothing.** Telling a bot it failed is how it learns which field gave it away.

**The swap happens in `Navbar.tsx`, not `App.tsx`.** Spec §11 criterion 1 says changing the navigation should be "one import line in `App.tsx`". `Navbar` was introduced in the navigation plan to own the scroll hooks, so `App` renders `<Navbar />` and never names an implementation at all. The criterion's substance — one file, one import — holds; the file is just one level down. Task 7 adds a test that proves it.

**Playwright is not installed.** Spec §8 asks for two Playwright runs. Task 9 covers the same ground as a written checklist run in a real browser, which is how the previous five plans were verified. **Cost, stated plainly:** the keyboard flow and the reduced-motion pass stay manual forever, and nothing catches a regression in them later. This was chosen deliberately, not overlooked.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/types/index.ts` | Add the `Site` interface |
| `src/data/site.ts` | Canonical URL, title, description, OG image — the one source for every copy of them |
| `src/data/site.test.ts` | Guards: `index.html`, `robots.txt`, `sitemap.xml` and the JSON-LD all agree with `site.ts` |
| `src/lib/validate.ts` | Pure contact-field validation |
| `src/lib/web3forms.ts` | The submission call and its result shape |
| `src/components/ui/ContactForm.tsx` | Form state, three states, honeypot, `mailto:` fallback |
| `src/sections/Contact.tsx` | Layout only — copy on one side, the form on the other |
| `src/lib/rail.ts` | Pure node geometry: offsets, states, fill |
| `src/nav/NodeRailNav.tsx` | The rail, second implementation of `SectionNavProps` |
| `src/nav/Navbar.tsx` | Swaps one import and moves the nav outside `<header>` |
| `index.html` | Canonical, OG, Twitter, theme colour, favicon, JSON-LD |
| `public/robots.txt`, `public/sitemap.xml`, `public/favicon.svg` | Crawler and tab-icon files |
| `scripts/generate-placeholders.mjs` | Generates the 1200x630 OG placeholder |
| `src/app-a11y.test.tsx` | Reduced-motion and accessible-name sweep over the whole page |
| `vercel.json`, `.env.example` | Deploy configuration |

---

## Task 1: One source of truth for site metadata

Six values are about to be written into four files. Put them in one place first, so the guards in Task 8 have something to compare against.

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/data/site.ts`
- Create: `src/data/site.test.ts`
- Modify: `src/data/invariants.test.ts`
- Modify: `scripts/generate-placeholders.mjs`

- [ ] **Step 1: Add the `Site` interface**

Append to `src/types/index.ts`. It must live here, not in `src/data/site.ts` — `scripts/generate-placeholders.mjs` imports data files by stripping `import type` lines and the type annotation on the exported const, and an `interface` declared in the data file would survive that strip and crash Node.

```ts
export interface Site {
  /** Origin only, no trailing slash. Every absolute URL is built from this. */
  url: string;
  title: string;
  description: string;
  /** Absolute path under public/. JPEG, because several scrapers still refuse WebP. */
  ogImage: string;
  ogImageAlt: string;
}
```

- [ ] **Step 2: Write the failing test**

Create `src/data/site.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { site } from './site';

describe('site', () => {
  it('has an https origin with no trailing slash', () => {
    expect(() => new URL(site.url)).not.toThrow();
    expect(new URL(site.url).protocol).toBe('https:');
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('keeps the title short enough to survive a search result', () => {
    expect(site.title.length).toBeLessThanOrEqual(60);
  });

  it('keeps the description inside the range search engines show', () => {
    expect(site.description.length).toBeGreaterThanOrEqual(110);
    expect(site.description.length).toBeLessThanOrEqual(160);
  });

  it('points the og image at a real file under public/', () => {
    expect(site.ogImage.startsWith('/')).toBe(true);
    expect(site.ogImage.endsWith('.jpg')).toBe(true);
    expect(existsSync(join(process.cwd(), 'public', site.ogImage.replace(/^\//, '')))).toBe(true);
  });

  it('describes the og image for a reader who cannot see it', () => {
    expect(site.ogImageAlt.trim().length).toBeGreaterThan(20);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/data/site.test.ts
```

Expected: FAIL — `Failed to resolve import "./site"`.

- [ ] **Step 4: Write the data**

Create `src/data/site.ts`. The URL is the Vercel default; Task 10 replaces it if a domain is bought, and this is the only file that has to change.

```ts
import type { Site } from '@/types';

export const site: Site = {
  url: 'https://daffa-firasyan.vercel.app',
  title: 'Daffa Firasyan — AI/ML Engineer',
  description:
    'Retrieval systems, knowledge graphs and web engineering. Selected projects, certificates and experience from an Information Systems student in Bandung.',
  ogImage: '/og/og-cover.jpg',
  ogImageAlt:
    'Daffa Firasyan, AI/ML Engineer — portfolio cover showing the name and role on a dark background.',
};
```

- [ ] **Step 5: Teach the placeholder generator to write a JPEG**

In `scripts/generate-placeholders.mjs` the encoder is hardcoded to WebP. Add this helper just below `const defined = ...`:

```js
/** OG images are JPEG; everything else is WebP. Chosen by extension, not by group. */
const encode = (pipeline, url) =>
  extname(url) === '.jpg' ? pipeline.jpeg({ quality: QUALITY }) : pipeline.webp({ quality: QUALITY });
```

Add `site.ts` to the parallel load at the top of `main()`:

```js
  const [{ profile }, { projects }, { certificates }, { education }, { experiences }, { site }] =
    await Promise.all([
      loadData('profile.ts'),
      loadData('projects.ts'),
      loadData('certificates.ts'),
      loadData('education.ts'),
      loadData('experiences.ts'),
      loadData('site.ts'),
    ]);
```

Add the group as the last entry of the `groups` array, after `experience logo`:

```js
    {
      name: 'og image',
      width: 1200,
      height: 630,
      urls: [site.ogImage],
      label: site.title,
    },
```

And in the write loop, replace the four lines that currently run `mkdir` and the hardcoded `.webp(...)` pipeline with these two:

```js
      await mkdir(dirname(out), { recursive: true });
      await encode(sharp(svg(group.width, group.height, group.label ?? slugOf(url))), url).toFile(out);
```

- [ ] **Step 6: Generate the asset**

```bash
npm run placeholders
```

Expected: the existing lines, plus a `1200x630` line for `/og/og-cover.jpg` near the end, and a file count one higher than before.

- [ ] **Step 7: Add the OG image to the existing asset invariant**

In `src/data/invariants.test.ts`, add the import beside the others:

```ts
import { site } from './site';
```

and add one entry to the `referenced` array inside the `assets` describe, after `profile.cvUrl`:

```ts
      site.ogImage,
```

- [ ] **Step 8: Run the suite**

```bash
npm test
```

Expected: PASS, five new tests.

- [ ] **Step 9: Commit**

```bash
git add src/types/index.ts src/data/site.ts src/data/site.test.ts src/data/invariants.test.ts scripts/generate-placeholders.mjs public/og
git commit -m "feat: add site metadata as a single source of truth"
```

---

## Task 2: Contact field validation

Validation is pure, so it is worth writing before anything that renders. No DOM, no state, no network.

**Files:**
- Create: `src/lib/validate.ts`
- Create: `src/lib/validate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/validate.test.ts`:

```ts
import { MESSAGE_MIN, validateContact } from './validate';

const valid = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work on knowledge graphs and would like to talk about a role.',
};

describe('validateContact', () => {
  it('accepts a filled-in form', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('rejects a blank name, including one that is only whitespace', () => {
    expect(validateContact({ ...valid, name: '' }).name).toBeTruthy();
    expect(validateContact({ ...valid, name: '   ' }).name).toBeTruthy();
  });

  it('rejects a blank email and a malformed one, with different messages', () => {
    const blank = validateContact({ ...valid, email: '' }).email;
    const malformed = validateContact({ ...valid, email: 'rita@example' }).email;
    expect(blank).toBeTruthy();
    expect(malformed).toBeTruthy();
    expect(blank).not.toBe(malformed);
  });

  it('rejects a message shorter than the minimum but accepts one at it', () => {
    expect(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MIN - 1) }).message).toBeTruthy();
    expect(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).message).toBeUndefined();
  });

  it('does not count surrounding whitespace towards the minimum', () => {
    const padded = `  ${'a'.repeat(MESSAGE_MIN - 1)}  `;
    expect(validateContact({ ...valid, message: padded }).message).toBeTruthy();
  });

  it('reports every bad field at once rather than the first', () => {
    expect(Object.keys(validateContact({ name: '', email: '', message: '' })).sort()).toEqual([
      'email',
      'message',
      'name',
    ]);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/lib/validate.test.ts
```

Expected: FAIL — `Failed to resolve import "./validate"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/validate.ts`:

```ts
export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

/** Short enough not to nag, long enough that "hi" does not reach the inbox. */
export const MESSAGE_MIN = 20;

/**
 * The same shape the profile invariant uses. It is deliberately loose: the only
 * address that can be proved deliverable is one that has received mail, and a
 * stricter pattern rejects real addresses.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Every problem with the form, not the first one.
 *
 * Returning them all at once is what lets the component decide when to show
 * each — on blur for a field the reader has left, on submit for all of them.
 */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name === '') errors.name = 'Please tell me who you are.';

  if (email === '') errors.email = 'An email address is needed for a reply.';
  else if (!EMAIL.test(email)) errors.email = 'That does not look like an email address.';

  if (message === '') errors.message = 'The message is empty.';
  else if (message.length < MESSAGE_MIN) {
    errors.message = `A little more detail would help — ${MESSAGE_MIN} characters or more.`;
  }

  return errors;
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run src/lib/validate.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validate.ts src/lib/validate.test.ts
git commit -m "feat: add contact field validation"
```

---

## Task 3: The Web3Forms submission

**Files:**
- Modify: `src/vite-env.d.ts`
- Create: `src/lib/web3forms.ts`
- Create: `src/lib/web3forms.test.ts`

The API, confirmed against the Web3Forms documentation rather than recalled: a JSON `POST` to `https://api.web3forms.com/submit` with `Content-Type` and `Accept` both `application/json`. The body carries `access_key` plus whatever fields should appear in the email. The honeypot field is named `botcheck`. The documented response is `{ "success": true, "body": { "message": "…" } }`, while the JavaScript examples in the same documentation read `json.message` at the top level — so the code accepts both shapes and never lets the message decide whether the send succeeded.

- [ ] **Step 1: Type the environment variable**

Replace `src/vite-env.d.ts` entirely:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Web3Forms access key. Public by design — it identifies a form, not an
   * account, and Web3Forms expects it in client-side code.
   */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/web3forms.test.ts`:

```ts
import { ENDPOINT, sendContact } from './web3forms';

const values = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work and would like to talk about a role.',
};

function mockFetch(response: { status: number; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: () => Promise.resolve(response.body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendContact', () => {
  it('posts json to the documented endpoint with the access key and the values', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    await sendContact(values, { accessKey: 'key-123' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(init.body);
    expect(body.access_key).toBe('key-123');
    expect(body.name).toBe(values.name);
    expect(body.email).toBe(values.email);
    expect(body.message).toBe(values.message);
    expect(body.botcheck).toBe('');
  });

  it('reports success when the service says so', async () => {
    mockFetch({ status: 200, body: { success: true } });
    expect(await sendContact(values, { accessKey: 'key-123' })).toEqual({ ok: true });
  });

  it('reads the failure message from either documented shape', async () => {
    mockFetch({ status: 400, body: { success: false, message: 'Invalid access key' } });
    expect(await sendContact(values, { accessKey: 'bad' })).toEqual({
      ok: false,
      message: 'Invalid access key',
    });

    mockFetch({ status: 400, body: { success: false, body: { message: 'Nested shape' } } });
    expect(await sendContact(values, { accessKey: 'bad' })).toEqual({
      ok: false,
      message: 'Nested shape',
    });
  });

  it('fails rather than succeeding when the body is not json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('not json')),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendContact(values, { accessKey: 'key-123' });
    expect(result.ok).toBe(false);
  });

  it('fails with a readable message when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const result = await sendContact(values, { accessKey: 'key-123' });
    expect(result.ok).toBe(false);
    expect(result).toHaveProperty('message');
  });

  it('sends nothing and fails when no access key is configured', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    const result = await sendContact(values, { accessKey: '' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it('reports success and sends nothing when the honeypot was filled', async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true } });

    const result = await sendContact(values, { accessKey: 'key-123', honeypot: 'http://spam' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/lib/web3forms.test.ts
```

Expected: FAIL — `Failed to resolve import "./web3forms"`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/web3forms.ts`:

```ts
import type { ContactValues } from './validate';

/** Web3Forms has one endpoint and no SDK. */
export const ENDPOINT = 'https://api.web3forms.com/submit';

export type SendResult = { ok: true } | { ok: false; message: string };

export interface SendOptions {
  accessKey: string;
  /** The honeypot field's value. Anything non-empty means a bot filled it. */
  honeypot?: string;
  signal?: AbortSignal;
}

const NO_KEY =
  'The form is not connected to its mail service yet. Email me directly and it reaches me the same way.';

const UNREACHABLE =
  'The message could not be sent. The service may be down, or the connection dropped on the way.';

/**
 * The API reference documents `body.message`; the JavaScript examples in the
 * same documentation read `message` at the top level. Accept either, and never
 * let the message decide whether the send succeeded.
 */
function readMessage(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const shape = payload as { message?: unknown; body?: { message?: unknown } };
  if (typeof shape.message === 'string') return shape.message;
  if (typeof shape.body?.message === 'string') return shape.body.message;
  return undefined;
}

function succeeded(response: Response, payload: unknown): boolean {
  if (!response.ok) return false;
  if (typeof payload !== 'object' || payload === null) return false;
  return (payload as { success?: unknown }).success === true;
}

export async function sendContact(
  values: ContactValues,
  options: SendOptions,
): Promise<SendResult> {
  // A filled honeypot is a bot. Report success and send nothing — telling it
  // that it failed is how it learns which field gave it away.
  if ((options.honeypot ?? '') !== '') return { ok: true };

  if (options.accessKey === '') return { ok: false, message: NO_KEY };

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: options.signal,
      body: JSON.stringify({
        access_key: options.accessKey,
        subject: `Portfolio message from ${values.name}`,
        from_name: 'Portfolio site',
        replyto: values.email,
        name: values.name,
        email: values.email,
        message: values.message,
        botcheck: '',
      }),
    });
  } catch {
    return { ok: false, message: UNREACHABLE };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (succeeded(response, payload)) return { ok: true };
  return { ok: false, message: readMessage(payload) ?? UNREACHABLE };
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run src/lib/web3forms.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/web3forms.ts src/lib/web3forms.test.ts src/vite-env.d.ts
git commit -m "feat: add the Web3Forms submission call"
```

---

## Task 4: The contact form

**Files:**
- Modify: `src/index.css`
- Create: `src/components/ui/ContactForm.tsx`
- Create: `src/components/ui/ContactForm.test.tsx`

- [ ] **Step 1: Add an error colour token**

The palette has no red. Errors would otherwise reuse `--color-accent`, which is also the link and active-navigation colour — one colour saying two different things. Add to the `@theme` block in `src/index.css`, after `--color-accent-2`:

```css
  --color-danger: #ff6b6b;
```

`#ff6b6b` on `#0a0c10` is about 6.5:1, above the 4.5:1 WCAG AA asks of body text.

- [ ] **Step 2: Write the failing test**

Create `src/components/ui/ContactForm.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { profile } from '@/data/profile';
import ContactForm from './ContactForm';

const valid = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work and would like to talk about an internship this year.',
};

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), valid.name);
  await user.type(screen.getByLabelText(/email/i), valid.email);
  await user.type(screen.getByLabelText(/message/i), valid.message);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('labels every field a reader has to fill in', () => {
    render(<ContactForm accessKey="key-123" />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('says nothing about a field the reader has not left yet', async () => {
    const user = userEvent.setup();
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByLabelText(/email/i));
    expect(screen.queryByText(/email address is needed/i)).not.toBeInTheDocument();
  });

  it('shows the error on blur and marks the field invalid', async () => {
    const user = userEvent.setup();
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByLabelText(/email/i));
    await user.tab();

    expect(await screen.findByText(/email address is needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('refuses to submit an invalid form and sends nothing', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/who you are/i)).toBeInTheDocument();
  });

  it('sends the filled-in values and shows the success state', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.email).toBe(valid.email);

    expect(await screen.findByText(/on its way/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/message/i)).not.toBeInTheDocument();
  });

  it('offers a way back to the form after a successful send', async () => {
    const user = userEvent.setup();
    mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));
    await user.click(await screen.findByRole('button', { name: /send another/i }));

    expect(screen.getByLabelText(/message/i)).toHaveValue('');
  });

  it('falls back to a mailto link carrying the message when the send fails', async () => {
    const user = userEvent.setup();
    mockFetch({ success: false, message: 'Invalid access key' }, 400);
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    const link = await screen.findByRole('link', { name: /email me directly/i });
    expect(link.getAttribute('href')).toContain(`mailto:${profile.email}`);
    expect(link.getAttribute('href')).toContain(encodeURIComponent(valid.message));
  });

  it('reaches the error state without a network call when no key is configured', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByRole('link', { name: /email me directly/i })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the honeypot out of the tab order and out of the accessibility tree', () => {
    const { container } = render(<ContactForm accessKey="key-123" />);
    const honeypot = container.querySelector('input[name="botcheck"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces the outcome in a live region', async () => {
    const user = userEvent.setup();
    mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    // waitFor rather than findByRole: the live region is in the DOM from the
    // first render, empty, so finding it proves nothing about the message.
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/on its way/i),
    );
  });
});
```

Note the `accessKey` prop. The section reads `import.meta.env` and passes it down; taking it as a prop is what makes the unconfigured case testable without rewriting the environment.

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run src/components/ui/ContactForm.test.tsx
```

Expected: FAIL — `Failed to resolve import "./ContactForm"`.

- [ ] **Step 4: Write the component**

Create `src/components/ui/ContactForm.tsx`:

```tsx
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

import { profile } from '@/data/profile';
import { validateContact, type ContactErrors, type ContactValues } from '@/lib/validate';
import { sendContact } from '@/lib/web3forms';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldName = keyof ContactValues;

const EMPTY: ContactValues = { name: '', email: '', message: '' };

const CONTROL =
  'mt-2 block min-h-11 w-full rounded-lg border border-edge bg-surface px-4 py-3 text-primary placeholder:text-muted';

function mailtoHref(values: ContactValues): string {
  const subject = encodeURIComponent(`Portfolio message from ${values.name || 'a visitor'}`);
  const body = encodeURIComponent(values.message);
  return `mailto:${profile.email}?subject=${subject}&body=${body}`;
}

function Field({
  htmlFor,
  label,
  error,
  errorId,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The contact form, in three states.
 *
 * Validation and submission are pure functions elsewhere, so what is left here
 * is state and markup. `accessKey` arrives as a prop rather than a direct read
 * of import.meta.env, so the unconfigured case can be tested.
 */
export default function ContactForm({ accessKey }: { accessKey: string }) {
  const id = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');
  const honeypot = useRef<HTMLInputElement>(null);
  const announcement = useRef<HTMLDivElement>(null);

  const fieldId = (name: FieldName) => `${id}-${name}`;
  const errorId = (name: FieldName) => `${id}-${name}-error`;
  const shown = (name: FieldName) => (touched[name] ? errors[name] : undefined);

  // Focus after the render that shows the outcome, not before it. React batches
  // the state updates across the await, so the panel does not exist yet at the
  // moment the send resolves.
  useEffect(() => {
    if (status === 'sent' || status === 'error') announcement.current?.focus();
  }, [status]);

  const change = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // Only re-validate a field the reader has already left. Correcting an error
    // should clear it as you type; a field still being filled in should not
    // start complaining mid-word.
    if (touched[name]) setErrors(validateContact(next));
  };

  const blur = (name: FieldName) => {
    setTouched((was) => ({ ...was, [name]: true }));
    setErrors(validateContact(values));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setFailure('');
    setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    const result = await sendContact(values, {
      accessKey,
      honeypot: honeypot.current?.value ?? '',
    });

    if (result.ok) {
      setStatus('sent');
      return;
    }

    setFailure(result.message);
    setStatus('error');
  };

  return (
    <div>
      <div
        ref={announcement}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={
          status === 'sent' || status === 'error'
            ? 'mb-6 rounded-xl border border-edge bg-surface p-5'
            : undefined
        }
      >
        {status === 'sent' && (
          <p className="text-primary">
            Thanks — your message is on its way. I reply to anything specific, usually within a
            couple of days.
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="text-danger">{failure}</p>
            <a href={mailtoHref(values)} className="mt-2 inline-block text-sm text-accent">
              Email me directly instead
            </a>
          </>
        )}
      </div>

      {status === 'sent' ? (
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
        >
          Send another message
        </button>
      ) : (
        <form noValidate onSubmit={submit} aria-busy={status === 'sending'} className="space-y-5">
          <Field
            htmlFor={fieldId('name')}
            label="Name"
            error={shown('name')}
            errorId={errorId('name')}
          >
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => change('name', event.target.value)}
              onBlur={() => blur('name')}
              aria-invalid={shown('name') ? true : undefined}
              aria-describedby={shown('name') ? errorId('name') : undefined}
              className={CONTROL}
            />
          </Field>

          <Field
            htmlFor={fieldId('email')}
            label="Email"
            error={shown('email')}
            errorId={errorId('email')}
          >
            <input
              id={fieldId('email')}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => change('email', event.target.value)}
              onBlur={() => blur('email')}
              aria-invalid={shown('email') ? true : undefined}
              aria-describedby={shown('email') ? errorId('email') : undefined}
              className={CONTROL}
            />
          </Field>

          <Field
            htmlFor={fieldId('message')}
            label="Message"
            error={shown('message')}
            errorId={errorId('message')}
          >
            <textarea
              id={fieldId('message')}
              name="message"
              rows={6}
              value={values.message}
              onChange={(event) => change('message', event.target.value)}
              onBlur={() => blur('message')}
              aria-invalid={shown('message') ? true : undefined}
              aria-describedby={shown('message') ? errorId('message') : undefined}
              className={CONTROL}
            />
          </Field>

          {/* Bait. Hidden from sight, from the tab order and from the
              accessibility tree, so only a bot filling every input finds it. */}
          <input
            ref={honeypot}
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-void disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run src/components/ui/ContactForm.test.tsx
```

Expected: PASS, 10 tests.

- [ ] **Step 6: Prove the honeypot guard fails when the bait is removed**

This project checks guards by breaking what they watch. Temporarily delete `tabIndex={-1}` from the honeypot input and re-run:

```bash
npx vitest run src/components/ui/ContactForm.test.tsx
```

Expected: FAIL on `keeps the honeypot out of the tab order`. Put the attribute back and confirm green.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/ContactForm.tsx src/components/ui/ContactForm.test.tsx src/index.css
git commit -m "feat: add the contact form"
```

---

## Task 5: Wire the form into the Contact section

**Files:**
- Modify: `src/sections/Contact.tsx`
- Create: `src/sections/contact.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/sections/contact.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { profile } from '@/data/profile';
import Contact from './Contact';

describe('Contact', () => {
  it('renders the form inside the section', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('keeps the direct email address reachable without using the form', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  it('still lists every social link', () => {
    render(<Contact />);
    for (const social of profile.socials) {
      expect(screen.getByRole('link', { name: social.label })).toHaveAttribute('href', social.url);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/sections/contact.test.tsx
```

Expected: FAIL — `Unable to find a label with the text of: /message/i`.

- [ ] **Step 3: Rewrite the section**

Replace `src/sections/Contact.tsx` entirely:

```tsx
import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';

/**
 * Public by design — a Web3Forms access key identifies a form, not an account,
 * and the service expects it in client-side code. Absent, the form resolves to
 * its error state, which is where the mailto: fallback already lives.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

export default function Contact() {
  return (
    <SectionShell {...shellProps('contact')}>
      {/* No `fill` on either Reveal. They are grid items, but each holds a
          column of stacked content rather than a card that must match a
          sibling's height, and h-full on stacked Reveals is what broke the
          hero in the motion plan. */}
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="max-w-[48ch] text-muted">
              The fastest way to reach me is email. I read everything and reply to anything
              specific. If you would rather not use the form, the address is right here.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="mt-6 inline-block font-display text-2xl font-bold break-words text-accent"
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
                    className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 text-sm text-muted"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ContactForm accessKey={ACCESS_KEY} />
        </Reveal>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 4: Run the whole suite**

```bash
npm test
```

Expected: PASS. Watch `src/sections/sections-lower.test.tsx`, which already renders `Contact` — if it asserted on the old single-column markup, update the assertion rather than the section.

- [ ] **Step 5: Check the import boundary still holds**

```bash
npm run lint
```

Expected: exit 0. `src/components/ui/` is not React Bits so the rule is not involved, but the section now imports across a new directory boundary and it is worth seeing green before moving on.

- [ ] **Step 6: Look at it in a browser**

```bash
npm run dev
```

Open `http://localhost:5173/#contact` and check, at 1280 and again at 375:

- The form sits beside the copy at 1280 and below it at 375.
- No horizontal scrollbar at 375 — the textarea is the usual culprit and must not exceed its column.
- Tabbing from the email link reaches Name, Email, Message, Send, and never lands on the honeypot.
- Submitting empty shows three errors.
- Submitting a filled form reaches the error state with the "Email me directly instead" link, because no access key is configured yet. That is the correct behaviour today, not a bug.

- [ ] **Step 7: Commit**

```bash
git add src/sections/Contact.tsx src/sections/contact.test.tsx
git commit -m "feat: put the contact form in the contact section"
```

---

## Task 6: Rail geometry

Where each dot sits, what state it is in, and how far the line is filled — all derivable from `sections`, `activeId` and `progress`, none of it needing a DOM. jsdom measures nothing, so this is the only layer of the rail that can be tested at all.

**Files:**
- Create: `src/lib/rail.ts`
- Create: `src/lib/rail.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/rail.test.ts`:

```ts
import type { SectionMeta } from '@/types';
import { railGeometry } from './rail';

const sections: SectionMeta[] = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1 },
  { id: 'skills', label: 'Skills', index: 2 },
  { id: 'contact', label: 'Contact', index: 3 },
];

describe('railGeometry', () => {
  it('spreads the nodes evenly from the top of the rail to the bottom', () => {
    const { nodes } = railGeometry(sections, 'home', 0);
    expect(nodes.map((n) => n.offset)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });

  it('carries the label through so the rail needs no data of its own', () => {
    const { nodes } = railGeometry(sections, 'home', 0);
    expect(nodes.map((n) => n.label)).toEqual(['Home', 'About', 'Skills', 'Contact']);
  });

  it('marks what is behind the reader done, what is ahead todo', () => {
    const { nodes } = railGeometry(sections, 'skills', 0.6);
    expect(nodes.map((n) => n.state)).toEqual(['done', 'done', 'active', 'todo']);
  });

  it('leaves every node todo when the active id is not in the list', () => {
    const { nodes } = railGeometry(sections, 'nowhere', 0.5);
    expect(nodes.every((n) => n.state === 'todo')).toBe(true);
  });

  it('holds the fill inside the band between the active node and the next', () => {
    // Raw progress of 0.9 in the second of four sections would run the line
    // past two dots the reader has not reached.
    expect(railGeometry(sections, 'about', 0.9).fill).toBeCloseTo(2 / 3);
    expect(railGeometry(sections, 'about', 0).fill).toBeCloseTo(1 / 3);
    expect(railGeometry(sections, 'about', 0.5).fill).toBeCloseTo(0.5);
  });

  it('fills the rail completely in the last section', () => {
    expect(railGeometry(sections, 'contact', 0.95).fill).toBe(1);
  });

  it('clamps progress that arrives outside 0..1', () => {
    expect(railGeometry(sections, 'nowhere', 1.4).fill).toBe(1);
    expect(railGeometry(sections, 'nowhere', -0.2).fill).toBe(0);
    expect(railGeometry(sections, 'nowhere', Number.NaN).fill).toBe(0);
  });

  it('survives one section and no sections at all', () => {
    expect(railGeometry([sections[0]], 'home', 0.5)).toEqual({
      nodes: [{ id: 'home', label: 'Home', offset: 0, state: 'active' }],
      fill: 0.5,
    });
    expect(railGeometry([], 'home', 0.5)).toEqual({ nodes: [], fill: 0.5 });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/lib/rail.test.ts
```

Expected: FAIL — `Failed to resolve import "./rail"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/rail.ts`:

```ts
import type { SectionMeta } from '@/types';

export type NodeState = 'done' | 'active' | 'todo';

export interface RailNode {
  id: string;
  label: string;
  /** 0..1 down the rail. */
  offset: number;
  state: NodeState;
}

export interface RailGeometry {
  nodes: RailNode[];
  /** 0..1 length of the filled part of the rail. */
  fill: number;
}

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/**
 * Where the rail's dots sit and how far the line is filled.
 *
 * The fill is page progress, clamped between the active node and the next one.
 * Sections differ in height, so raw progress routinely overshoots a dot the
 * reader has not reached — a filled line running past a hollow dot reads as a
 * bug rather than as a subtlety. The clamp keeps the line moving smoothly while
 * it and the active dot never contradict each other.
 */
export function railGeometry(
  sections: SectionMeta[],
  activeId: string,
  progress: number,
): RailGeometry {
  const last = sections.length - 1;
  const offsetOf = (index: number) => (last <= 0 ? 0 : index / last);
  const activeIndex = sections.findIndex((section) => section.id === activeId);

  const nodes: RailNode[] = sections.map((section, index) => ({
    id: section.id,
    label: section.label,
    offset: offsetOf(index),
    state:
      activeIndex < 0 || index > activeIndex ? 'todo' : index === activeIndex ? 'active' : 'done',
  }));

  const safe = Number.isFinite(progress) ? progress : 0;
  if (activeIndex < 0) return { nodes, fill: clamp(safe, 0, 1) };

  const low = offsetOf(activeIndex);
  const high = activeIndex >= last ? 1 : offsetOf(activeIndex + 1);
  return { nodes, fill: clamp(safe, low, high) };
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run src/lib/rail.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rail.ts src/lib/rail.test.ts
git commit -m "feat: add rail node geometry"
```

---

## Task 7: The node rail, and the navigation swap

**Files:**
- Create: `src/nav/NodeRailNav.tsx`
- Create: `src/nav/NodeRailNav.test.tsx`
- Modify: `src/nav/Navbar.tsx`
- Modify: `src/nav/Navbar.test.tsx`

**Read this before writing a line of it.** `backdrop-filter` makes an element the containing block for any `position: fixed` descendant — the same rule `transform` follows, and the same rule that already forced the timeline dots outside their `Reveal`. `Navbar` applies `backdrop-blur` to `<header>` only once the page has scrolled past 80px. A rail rendered inside that header would be positioned against the viewport at the top of the page and against the header everywhere else, so it would jump on the first scroll and then sit wrong. **The rail renders as a sibling of `<header>`, never a child.**

- [ ] **Step 1: Write the failing test**

Create `src/nav/NodeRailNav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SECTIONS } from '@/data/sections';
import NodeRailNav from './NodeRailNav';

const props = {
  sections: SECTIONS,
  activeId: 'projects',
  progress: 0.62,
  onNavigate: () => {},
};

describe('NodeRailNav', () => {
  it('gives every section a link with its label as the accessible name', () => {
    render(<NodeRailNav {...props} />);
    for (const section of SECTIONS) {
      expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        `#${section.id}`,
      );
    }
  });

  it('marks only the active section as current', () => {
    render(<NodeRailNav {...props} />);
    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Projects');
  });

  it('reports reading progress as a percentage', () => {
    render(<NodeRailNav {...props} />);
    expect(screen.getByRole('progressbar', { name: /reading progress/i })).toHaveAttribute(
      'aria-valuenow',
      '62',
    );
  });

  it('navigates on a plain click instead of jumping', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NodeRailNav {...props} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(onNavigate).toHaveBeenCalledWith('about');
  });

  it('leaves modified clicks to the browser, so open-in-new-tab still works', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NodeRailNav {...props} onNavigate={onNavigate} />);

    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('link', { name: 'About' }));
    await user.keyboard('{/Control}');

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('keeps a real anchor for every section so the page works without javascript', () => {
    render(<NodeRailNav {...props} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(SECTIONS.map((section) => `#${section.id}`));
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/nav/NodeRailNav.test.tsx
```

Expected: FAIL — `Failed to resolve import "./NodeRailNav"`.

- [ ] **Step 3: Write the component**

Create `src/nav/NodeRailNav.tsx`:

```tsx
import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { railGeometry, type NodeState } from '@/lib/rail';
import type { SectionNavProps } from '@/types';

/** Tailwind cannot build a class name from a variable, so the states are literal. */
const DOT: Record<NodeState, string> = {
  done: 'h-2 w-2 bg-accent',
  active: 'h-3.5 w-3.5 bg-accent',
  todo: 'h-2 w-2 border border-edge bg-surface',
};

const RAIL_HEIGHT = 280;

/**
 * The section-node rail — the second implementation of SectionNavProps, and the
 * navigation spec D6 intended from the start.
 *
 * It owns no scroll state: activeId and progress arrive as props from the same
 * hook the pill navigation used, so the two implementations cannot disagree
 * about where the reader is.
 *
 * It renders as a sibling of the header, never inside it. backdrop-filter makes
 * an element the containing block for fixed descendants, and the header gains
 * backdrop-blur once the page scrolls — a rail nested inside it would be
 * positioned against the viewport at the top of the page and against the header
 * everywhere else.
 *
 * Desktop only. A fixed vertical rail at tablet width sits on top of the
 * content; below lg the header's disclosure menu carries navigation instead.
 */
export default function NodeRailNav({ sections, activeId, progress, onNavigate }: SectionNavProps) {
  const { animate } = useMotionAllowed();
  const { nodes, fill } = railGeometry(sections, activeId, progress);
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <nav
      aria-label="Sections"
      className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative w-3" style={{ height: RAIL_HEIGHT }}>
        <div
          role="progressbar"
          aria-label="Reading progress"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-edge"
        >
          <div
            className="w-full bg-accent"
            style={{
              height: `${fill * 100}%`,
              transition: animate ? 'height 180ms linear' : undefined,
            }}
          />
        </div>

        <ul>
          {nodes.map((node) => (
            <li
              key={node.id}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${node.offset * 100}%` }}
            >
              <a
                href={`#${node.id}`}
                aria-current={node.state === 'active' ? 'page' : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onNavigate(node.id);
                }}
                className="group relative flex h-11 w-11 items-center justify-center"
              >
                <span className="sr-only">{node.label}</span>

                <span
                  aria-hidden="true"
                  className={`rounded-full ${DOT[node.state]} ${
                    animate ? 'transition-all duration-200' : ''
                  }`}
                />

                {/* Decorative duplicate of the label above. The accessible name
                    comes from the sr-only span, so this must stay hidden. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full mr-1 whitespace-nowrap rounded-full border border-edge bg-surface px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {node.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run src/nav/NodeRailNav.test.tsx
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Swap it into the Navbar**

In `src/nav/Navbar.tsx`, change the import on line 8:

```tsx
import NodeRailNav from './NodeRailNav';
```

Wrap the return in a fragment, delete the `<nav aria-label="Sections" className="hidden lg:block">` block that held `PillNavAdapter` — the whole element including the `lg, not md` comment above it — and render the rail after the closing `</header>`:

```tsx
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          scrolled ? 'border-b border-edge bg-void/80 backdrop-blur' : 'bg-transparent'
        }`}
      >
        {/* … brand link, CV link, Menu button and the mobile disclosure nav,
            all unchanged … */}
      </header>

      {/* Outside the header on purpose: backdrop-blur would become the
          containing block for this fixed element the moment the page scrolls. */}
      <NodeRailNav
        sections={SECTIONS}
        activeId={activeId}
        progress={progress}
        onNavigate={navigate}
      />
    </>
  );
```

Leave the mobile disclosure `<nav aria-label="Sections, mobile">` where it is, inside the header. It is not fixed, so the containing-block problem does not touch it.

- [ ] **Step 6: Add the seam guard**

Append inside the existing `describe('Navbar')` in `src/nav/Navbar.test.tsx`:

```ts
  it('is the only file that names the navigation implementation', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });

    const naming = walk(join(process.cwd(), 'src'))
      .filter((file) => /\.tsx?$/.test(file) && !file.includes('.test.'))
      .filter((file) => readFileSync(file, 'utf8').includes('NodeRailNav'))
      .map((file) => file.replace(/\\/g, '/').split('/src/')[1])
      .sort();

    // The component names itself; nothing else may, or swapping the navigation
    // stops being a one-line change.
    expect(naming).toEqual(['nav/NodeRailNav.tsx', 'nav/Navbar.tsx']);
  });
```

Add the imports at the top of that file:

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
```

- [ ] **Step 7: Prove the seam guard fails**

Add `// NodeRailNav` as a comment at the top of `src/App.tsx`, then:

```bash
npx vitest run src/nav/Navbar.test.tsx
```

Expected: FAIL, listing `App.tsx` among the files. Remove the comment and re-run; expected PASS.

- [ ] **Step 8: Run everything**

```bash
npm test && npm run lint && npm run build
```

Expected: all three exit 0. `PillNavAdapter.test.tsx` still passes — the adapter stays in the tree as the second implementation that proves the contract is a contract, and Vite drops it from the bundle now that nothing imports it.

- [ ] **Step 9: See the rail in a browser — this step cannot be skipped**

```bash
npm run dev
```

At 1280 wide:

- The rail sits centred vertically against the right edge, seven dots on a thin line.
- **Scroll past 80px and watch the rail.** If it shifts at the moment the header gains its blurred background, the rail is still inside the header — that is the containing-block trap. Move it out.
- The filled part grows as you scroll, and its end always sits between the active dot and the next one, never past a hollow dot.
- The active dot is visibly larger.
- Hovering a dot reveals its label to the left; tabbing to a dot reveals it too.
- Clicking a dot scrolls smoothly to that section, and the dot states follow.
- No horizontal scrollbar. The 44px hit areas overhang the 12px rail by 16px a side and should still clear the viewport edge.

At 1024 and below the rail is gone and the Menu button is back. Check 768 in particular — that width has already broken this header once.

- [ ] **Step 10: Commit**

```bash
git add src/nav/NodeRailNav.tsx src/nav/NodeRailNav.test.tsx src/nav/Navbar.tsx src/nav/Navbar.test.tsx
git commit -m "feat: replace the pill navigation with the section node rail"
```

---

## Task 8: Head metadata, JSON-LD, robots and sitemap

Everything here is duplicated text — the title lands in four places, the URL in five. The guards are the point of the task, not an extra.

**Files:**
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Modify: `index.html`
- Modify: `src/data/site.test.ts`

- [ ] **Step 1: Write the failing guards**

Add these imports at the top of `src/data/site.test.ts`, beside the existing ones:

```ts
import { readFileSync } from 'node:fs';

import { profile } from './profile';
```

Then append the new block:

```ts
const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');

describe('published metadata', () => {
  const html = read('index.html');

  it('gives index.html the title and description from site.ts', () => {
    expect(html).toContain(`<title>${site.title}</title>`);
    expect(html).toContain(site.description);
  });

  it('points canonical, og:url and og:image at the site url', () => {
    expect(html).toContain(`<link rel="canonical" href="${site.url}/" />`);
    expect(html).toContain(`content="${site.url}/"`);
    expect(html).toContain(`content="${site.url}${site.ogImage}"`);
    expect(html).toContain(`content="${site.ogImageAlt}"`);
  });

  it('declares the og image dimensions, so the preview reserves the right box', () => {
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
  });

  it('describes the same person the profile data describes', () => {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!match) throw new Error('index.html carries no JSON-LD block');

    const data = JSON.parse(match[1]);
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe(profile.name);
    expect(data.jobTitle).toBe(profile.roles[0]);
    expect(data.url).toBe(`${site.url}/`);
    expect(data.email).toBe(`mailto:${profile.email}`);
    expect(data.image).toBe(`${site.url}${profile.avatarUrl}`);
    expect(data.sameAs).toEqual(profile.socials.map((social) => social.url));
  });

  it('gives crawlers a robots.txt and a sitemap that agree on the origin', () => {
    expect(read('public', 'robots.txt')).toContain(`Sitemap: ${site.url}/sitemap.xml`);
    expect(read('public', 'sitemap.xml')).toContain(`<loc>${site.url}/</loc>`);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/data/site.test.ts
```

Expected: FAIL on all five — `index.html` carries no canonical tag and `public/robots.txt` does not exist.

- [ ] **Step 3: Write the favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#f0a32e" />
  <text x="16" y="23" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="21" font-weight="700" fill="#0a0c10">D</text>
</svg>
```

- [ ] **Step 4: Write robots.txt and sitemap.xml**

Create `public/robots.txt`. The origin must match `site.url` exactly:

```
User-agent: *
Allow: /

Sitemap: https://daffa-firasyan.vercel.app/sitemap.xml
```

Create `public/sitemap.xml`. One page, one entry:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://daffa-firasyan.vercel.app/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Rewrite the head**

Replace the `<head>` of `index.html` entirely. Every value must match `src/data/site.ts` character for character; the tests in Step 1 compare them literally, and the description must stay on one line.

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0c10" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <title>Daffa Firasyan — AI/ML Engineer</title>
    <meta name="description" content="Retrieval systems, knowledge graphs and web engineering. Selected projects, certificates and experience from an Information Systems student in Bandung." />
    <link rel="canonical" href="https://daffa-firasyan.vercel.app/" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Daffa Firasyan" />
    <meta property="og:url" content="https://daffa-firasyan.vercel.app/" />
    <meta property="og:title" content="Daffa Firasyan — AI/ML Engineer" />
    <meta property="og:description" content="Retrieval systems, knowledge graphs and web engineering. Selected projects, certificates and experience from an Information Systems student in Bandung." />
    <meta property="og:image" content="https://daffa-firasyan.vercel.app/og/og-cover.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Daffa Firasyan, AI/ML Engineer — portfolio cover showing the name and role on a dark background." />
    <meta name="twitter:card" content="summary_large_image" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Daffa Firasyan",
        "jobTitle": "AI/ML Engineer",
        "url": "https://daffa-firasyan.vercel.app/",
        "email": "mailto:hello@example.com",
        "image": "https://daffa-firasyan.vercel.app/profile/avatar.webp",
        "sameAs": ["https://github.com/example", "https://linkedin.com/in/example"]
      }
    </script>
  </head>
```

- [ ] **Step 6: Run the guards and watch them pass**

```bash
npx vitest run src/data/site.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 7: Prove the drift guard fails**

Change `site.url` in `src/data/site.ts` to `https://elsewhere.example` and re-run:

```bash
npx vitest run src/data/site.test.ts
```

Expected: FAIL on the canonical, JSON-LD and robots assertions — which is exactly the failure that will fire when a real domain is bought and only half the files get updated. Change it back and confirm green.

- [ ] **Step 8: Check the built output actually carries it**

```bash
npm run build
```

Then confirm the tags survived Vite's HTML processing and the static files were copied:

```bash
grep -c "og:image" dist/index.html && ls dist/robots.txt dist/sitemap.xml dist/favicon.svg dist/og/og-cover.jpg
```

Expected: a count of at least 1, then all four paths listed.

- [ ] **Step 9: Commit**

```bash
git add index.html public/favicon.svg public/robots.txt public/sitemap.xml src/data/site.test.ts
git commit -m "feat: add canonical, open graph, structured data and crawler files"
```

---

## Task 9: The reduced-motion and keyboard sweep

Two halves. The automated half catches what jsdom can see — that nothing renders without an accessible name, and that reduced motion really does reach every corner. The manual half is everything jsdom cannot see, which on this project is where every visual defect has lived.

**Files:**
- Create: `src/app-a11y.test.tsx`
- Modify: `docs/superpowers/HANDOFF.md`

- [ ] **Step 1: Write the test**

Create `src/app-a11y.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import App from './App';

const realMatchMedia = window.matchMedia;

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('the page under reduced motion', () => {
  it('puts no canvas on the page at all', () => {
    setReducedMotion(true);
    const { container } = render(<App />);
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('still renders every section heading, so nothing was hidden by a dead animation', () => {
    setReducedMotion(true);
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(6);
  });
});

describe('accessible names', () => {
  it('gives every button one', () => {
    setReducedMotion(true);
    render(<App />);
    for (const button of screen.getAllByRole('button')) {
      expect(button, button.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every link one', () => {
    setReducedMotion(true);
    render(<App />);
    for (const link of screen.getAllByRole('link')) {
      expect(link, link.outerHTML).toHaveAccessibleName();
    }
  });

  it('gives every navigation landmark a distinct name', async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    render(<App />);

    // The disclosure nav only exists while the menu is open, and it is the one
    // that could collide with the rail. Testing the closed page proves nothing.
    await user.click(screen.getByRole('button', { name: /menu/i }));

    const names = screen.getAllByRole('navigation').map((nav) => nav.getAttribute('aria-label'));
    expect(names.length).toBeGreaterThanOrEqual(2);
    expect(names.every(Boolean)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
  });
});
```

Add `import userEvent from '@testing-library/user-event';` at the top of the file for that last test.

It earns its keep: the rail and the header's mobile disclosure would both be `aria-label="Sections"` if the rail were copied carelessly, and two landmarks sharing a name are indistinguishable in a screen reader's landmark list. If it fails, rename the disclosure — it is already `"Sections, mobile"`, so a failure means the rail overwrote it.

- [ ] **Step 2: Run it**

```bash
npx vitest run src/app-a11y.test.tsx
```

Expected: PASS if the previous tasks were done right. If the canvas test fails, `Backdrop` or `Grain` is not reading `useMotionAllowed`. If a link has no name, it is almost certainly an icon-only control added since.

- [ ] **Step 3: Run the whole suite once more**

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

Expected: all four exit 0.

- [ ] **Step 4: Build and serve the real thing**

```bash
npm run build && npm run preview
```

Use the preview build, not the dev server. It is what gets deployed, and the only place lazy chunks, minification and real asset paths are exercised together.

- [ ] **Step 5: The keyboard pass, in a real browser**

From a fresh page load, keyboard only. Two of these have been open since the interactive-surfaces plan and cannot be checked anywhere else — the in-app browser pane holds no document focus, so keypresses never arrive there.

- [ ] Tab once: the skip link appears and is visible, not merely present.
- [ ] Enter on the skip link jumps to the content.
- [ ] Tab reaches the rail's dots at 1280, and each shows its label when focused.
- [ ] Enter on a dot scrolls to that section.
- [ ] Tab reaches a project card; Enter opens the modal.
- [ ] **Tab repeatedly inside the open modal — focus must cycle inside it and never reach the page behind.**
- [ ] **Escape closes the modal, and focus returns to the card that opened it.**
- [ ] Both of those again for the certificate lightbox, plus Left and Right stepping through certificates.
- [ ] Tab through the contact form: Name, Email, Message, Send. The honeypot is never focused.
- [ ] Submit an empty form: three errors appear and the live region announces something.
- [ ] Every focused element has a visible focus ring against its own background.

- [ ] **Step 6: The reduced-motion pass**

Turn animation effects off in **Settings → Accessibility → Visual effects → Animation effects**, reload, and confirm:

- [ ] No starfield and no film grain; the hero shows the static gradient.
- [ ] `document.querySelectorAll('canvas').length` is `0` in the console.
- [ ] Every heading, counter and rotating role is fully readable and stationary.
- [ ] The rail's fill jumps rather than sliding, and still lands in the right place.
- [ ] Scrolling is native, not smoothed.

Turn animation effects back on before continuing.

- [ ] **Step 7: The width pass**

At 320, 375, 768, 1024, 1280 and 1440, check `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Then check the header separately, because a fixed element does not grow `scrollWidth` and an overflow sweep will report clean while a control sits off screen:

```js
const bar = document.querySelector('header > div');
console.log(bar.scrollWidth, bar.clientWidth);
```

Expected: the first number is never larger than the second.

- [ ] **Step 8: Lighthouse against the spec thresholds**

Chrome DevTools → Lighthouse → Mobile, against the **preview** build. Spec §12.3 asks for Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

Record the four numbers. If Accessibility or SEO falls short, fix it here — those are almost always a missing label, a contrast failure or a missing meta tag, and all three are cheap. If Performance falls short, note what Lighthouse blames and decide then; the WebGL backdrop and the three variable fonts are the likely candidates, and neither is worth gutting for a few points before knowing the cause.

- [ ] **Step 9: Write down what was measured**

Record the four Lighthouse scores and the outcome of the two dialog checks in `docs/superpowers/HANDOFF.md`, under "Things known to be imperfect". Delete the "Two dialog behaviours are unverified" bullet if they passed. A check nobody wrote down is a check that gets run again.

- [ ] **Step 10: Commit**

```bash
git add src/app-a11y.test.tsx docs/superpowers/HANDOFF.md
git commit -m "test: sweep reduced motion and accessible names, and record the browser pass"
```

---

## Task 10: Deploy

The owner runs every step that needs an account. Nothing here creates an account, enters a credential, or publishes anything on their behalf.

**Files:**
- Create: `.env.example`
- Create: `vercel.json`
- Modify: `.gitignore`
- Modify: `docs/superpowers/HANDOFF.md`

- [ ] **Step 1: Keep real keys out of git**

Confirm `.gitignore` contains `.env` and `.env.local`; add either if missing. Then create `.env.example`:

```
# Web3Forms access key, from https://web3forms.com — enter an email address and
# the key arrives in that inbox. It is public by design: it identifies a form,
# not an account, and Web3Forms expects it in client-side code.
#
# Copy this file to .env.local and fill it in. Without it the contact form shows
# its error state and offers the mailto: fallback, which still works.
VITE_WEB3FORMS_KEY=
```

- [ ] **Step 2: Add the Vercel configuration**

Create `vercel.json`. Vite emits content-hashed files under `/assets/`, which can be cached forever; nothing else can.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}
```

- [ ] **Step 3: Commit the configuration**

```bash
git add vercel.json .env.example .gitignore
git commit -m "chore: add deploy configuration"
```

- [ ] **Step 4: Merge to main**

Eighty-odd commits have been sitting on one branch. Deploy from `main`.

```bash
git checkout main
git merge --no-ff feat/foundation-and-content-layer
```

Then push. If `origin` does not exist yet, create the repository on GitHub first and add the remote.

```bash
git push -u origin main
```

- [ ] **Step 5: Get a Web3Forms key — owner only**

Go to https://web3forms.com, enter the address that should receive messages, and collect the key from that inbox. Put it in `.env.local` locally, and add it in Vercel under **Settings → Environment Variables** as `VITE_WEB3FORMS_KEY` for Production and Preview. Vite inlines it at build time, so a deployment made before the variable exists will not pick it up — redeploy after adding it.

- [ ] **Step 6: Deploy — owner only**

Import the repository at https://vercel.com/new. Vercel detects Vite; the build command is `npm run build` and the output directory is `dist`, both defaults.

- [ ] **Step 7: Reconcile the URL**

Vercel assigns the project a `.vercel.app` domain. If it is not `daffa-firasyan.vercel.app`, or a custom domain gets attached later, change `url` in `src/data/site.ts` to match and run:

```bash
npx vitest run src/data/site.test.ts
```

Expected: FAIL, naming `index.html`, `robots.txt` and `sitemap.xml`. Update all three to the new origin, re-run until green, then rebuild, commit and push.

- [ ] **Step 8: Check the deployed site, not the local one**

- [ ] Send a real message through the form and confirm it arrives in the inbox.
- [ ] Paste the URL into a link preview — a WhatsApp draft is the quickest — and confirm the OG image, title and description appear.
- [ ] Open `/robots.txt`, `/sitemap.xml` and `/favicon.svg` directly; all three should load.
- [ ] Open it on a phone, on mobile data. Check the hero, the rail's absence, the project modal and the form.
- [ ] Hand it to two people and watch where they stop. Spec phase 10 asks for exactly this, and it is the only test in this project that measures the thing the site is for.

- [ ] **Step 9: The privacy check no test can do**

Spec §5 requires it before anything real is published, and it is checked by eye, once, on every certificate scan: **identity numbers, dates of birth, wet signatures, and QR codes carrying personal data must be covered before upload.** Placeholder images carry none of this, so the check belongs to the moment real scans replace them — not to this deploy. Record it as outstanding wherever the real-content work is tracked.

- [ ] **Step 10: Close the handoff**

Update `docs/superpowers/HANDOFF.md`: mark this plan built, record the live URL, and replace "What to do next" with what is genuinely left — pasting real content into `src/data/` and `public/`, and the privacy check above.

```bash
git add docs/superpowers/HANDOFF.md
git commit -m "docs: record the deployment and what remains"
```

---

## What this plan proves, and what it does not

| Claim | How it is proved |
|---|---|
| The contact form works | A real message arrives in a real inbox (Task 10, Step 8) |
| Its three states are right | Unit tests for two of them, and the success state seen in a browser |
| A failed send is not a dead end | The `mailto:` fallback carries the typed message (tested) |
| Navigation swapped without touching a section | The seam guard, proved to fail (Task 7, Step 7) |
| Reduced motion is honoured everywhere | No canvas under reduced motion (tested), plus the browser pass |
| Metadata cannot drift | The metadata guard, proved to fail (Task 8, Step 7) |
| The page is reachable by keyboard alone | The manual pass (Task 9, Step 5) |
| It meets the spec's Lighthouse thresholds | Four recorded numbers (Task 9, Step 8) |

Two things this plan does **not** prove, stated so nobody assumes otherwise. There is no automated regression guard on the keyboard flow, and none on reduced motion in a real browser, because Playwright was deliberately left out. Both are checklists, and checklists rot — if either area changes later, it is re-checked by hand or not at all.
