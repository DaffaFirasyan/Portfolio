# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: recruiters and HR screeners, who scan many candidates and give each a few seconds. Also: hiring managers and engineers, who read projects, stack and metrics closely; and freelance clients, who need a website or system built (the village portal is the model case). Confirmed by the owner 2026-11-11; no single action outranks the others, so the page serves all three readers and all three actions (contact, download CV, assess projects) equally.

## Product Purpose
A one-page personal portfolio for Daffa Firasyan, a fresh Information Systems graduate (Telkom University, 2026) looking for work as a full-stack / AI-ML engineer. It exists to turn a CV into evidence: shipped systems, a first-authored IEEE paper, and certificates a reader can open and check. Success is a visitor who contacts him, downloads the CV, or judges the projects, in any order.

## Positioning
Few graduates can show an IEEE-published first-author paper (RAG vs KG-RAG for explainable asset maintenance), a knowledge-graph decision-support system with an evaluation (AssetMind, 4.73/5, 92.9% procedure match, 39/39 tests), and a production platform used by people who are not him (the Banjarsari village portal, live since 2025, 7,682 residents) in one page.

## Operating Context
Read on phones and laptops, often from a recruiter's ATS link or a LinkedIn profile. Deployed on Vercel at https://daffafirasyan.vercel.app from `main` on a public GitHub repo; a push is a deploy. Bilingual (EN/ID) with a CV per language.

## Capabilities and Constraints
- Seven sections stay: Home, About, Skills, Experience, Projects, Education (with certificate wall), Contact. Order may change.
- EN/ID toggle and both CVs stay.
- All copy lives in `src/data/` (English) and `src/data/i18n/id.ts` (Indonesian) and is not rewritten by a redesign.
- Project category filter and skill-to-project highlighting keep working.
- Must stay light: the owner asked explicitly for a non-heavy site. Lighthouse Accessibility, Best Practices and SEO are 100 on the live site and must not regress; Performance is noisy on the development machine (68–86 desktop, median ~75), so judge it by repeated runs.
- Reduced motion is honoured through `useMotionAllowed()` only.
- Stack is fixed: Vite 8, React 19, TypeScript 6, Tailwind 4; vendored UI components are copied by hand, never installed through a CLI.
- The owner's portrait `public/profile/avatar.webp` is not to be touched.
- The repository is public. Nothing from `Konten_Asli/` may be committed, and certificate scans are redacted by eye by the owner.

## Brand Commitments
Name: Daffa Firasyan (legal name Raden Daffa Firasyan Adikusumah). Voice is plain and first-person, never inflated. The owner's own portrait and the Indonesian/English copy are binding.

## Evidence on Hand
Real content throughout: four projects, three roles, fourteen certificate scans, an IEEE paper with DOI 10.1109/ICADEIS71120.2026.11644554, two CVs. Absent and not to be invented: testimonials, customer logos, public repo or demo links for most projects, download or visitor numbers.

## Product Principles
1. Evidence over decoration: every visual choice should help a reader verify a claim faster.
2. Serve the three-second reader and the ten-minute reader from the same page.
3. Light by default: nothing ships that a mid-range phone must pay for before it can read.
4. Both languages are first-class; layout must survive Indonesian copy lengths.
5. Never claim more than the CV and the scans show.

## Accessibility & Inclusion
Lighthouse accessibility 100 is the floor. Contrast of small text, target size of at least 24px, and keyboard operation are checked, and `prefers-reduced-motion` removes motion.
