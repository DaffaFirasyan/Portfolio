/**
 * Generates the placeholder assets referenced by src/data/*.ts.
 *
 * The asset list is derived from the data files themselves, so it cannot drift
 * from what `src/data/invariants.test.ts` checks. The dimensions here are the
 * real dimensions the final assets will use — components set explicit
 * width/height on every <img>, so a placeholder that differs would invalidate
 * the layout measured against it.
 *
 * Run with: npm run placeholders
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const dataDir = join(root, 'src', 'data');
const publicDir = join(root, 'public');

const BACKGROUND = '#12161D';
const FOREGROUND = '#8A97A6';
const QUALITY = 80;

/**
 * The data files are TypeScript: a type-only `@/types` import plus a type
 * annotation on the exported const. Strip both and the rest is plain ES module
 * source that Node can import directly from a data: URL.
 */
async function loadData(fileName) {
  const source = await readFile(join(dataDir, fileName), 'utf8');
  const js = source
    .replace(/^\s*import\s+type\s[^;]*;\s*$/gm, '')
    .replace(/^(\s*export\s+const\s+\w+)\s*:\s*[^=]+=/gm, '$1 =');
  const url = `data:text/javascript;charset=utf-8;base64,${Buffer.from(js, 'utf8').toString(
    'base64',
  )}`;
  return import(url);
}

const escapeXml = (value) =>
  value.replace(
    /[<>&'"]/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char],
  );

const svg = (w, h, label) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
     <rect width="100%" height="100%" fill="${BACKGROUND}"/>
     <text x="50%" y="50%" fill="${FOREGROUND}" font-family="sans-serif" font-size="${Math.round(
       Math.min(w, h) / 14,
     )}"
           text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
   </svg>`,
  );

/**
 * A minimal but valid single-page PDF with a correct cross-reference table,
 * written by hand so the generator needs no extra dependency.
 */
function minimalPdf(text) {
  const stream = `BT /F1 24 Tf 72 760 Td (${text}) Tj ET`;
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

/** `/certificates/thumb-sql-advanced.webp` -> `thumb-sql-advanced` */
const slugOf = (url) => basename(url, extname(url));

/** `/projects/a.webp` -> `<repo>/public/projects/a.webp` */
const publicPath = (url) => join(publicDir, url.replace(/^\//, ''));

const defined = (values) => values.filter((value) => Boolean(value));

/**
 * The avatar is the one placeholder that cannot be a filled rectangle.
 *
 * ProfileCard anchors it to the bottom of the card and lets the holographic
 * gradient show around it, so it expects a portrait with the background
 * removed. An opaque square renders as a pasted block with a hard seam across
 * the card — which is exactly how it looked before this existed.
 *
 * A head-and-shoulders silhouette on transparency is the cheapest thing that
 * has the right shape, so the layout is honest during development instead of
 * only once a real cut-out is dropped in.
 */
const silhouette = (w, h) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <circle cx="${w / 2}" cy="${h * 0.34}" r="${w * 0.17}" fill="${FOREGROUND}"/>
       <path d="M ${w / 2} ${h * 0.58}
                C ${w * 0.24} ${h * 0.58} ${w * 0.15} ${h * 0.78} ${w * 0.13} ${h}
                L ${w * 0.87} ${h}
                C ${w * 0.85} ${h * 0.78} ${w * 0.76} ${h * 0.58} ${w / 2} ${h * 0.58} Z"
             fill="${FOREGROUND}"/>
     </svg>`,
  );

/** OG images are JPEG; everything else is WebP. Chosen by extension, not by group. */
const encode = (pipeline, url) =>
  extname(url) === '.jpg' ? pipeline.jpeg({ quality: QUALITY }) : pipeline.webp({ quality: QUALITY });

async function main() {
  const [{ profile }, { projects }, { certificates }, { education }, { experiences }, { site }] =
    await Promise.all([
      loadData('profile.ts'),
      loadData('projects.ts'),
      loadData('certificates.ts'),
      loadData('education.ts'),
      loadData('experiences.ts'),
      loadData('site.ts'),
    ]);

  const groups = [
    // 368x513, the card's own 0.718 aspect. A square placeholder would
    // regenerate the mistake the real portrait had: boxed into a square, the
    // subject fills under half the card's width and reads as small in it.
    { name: 'avatar', width: 368, height: 513, urls: [profile.avatarUrl], cutout: true },
    {
      name: 'project thumbnail',
      width: 800,
      height: 500,
      urls: projects.map((p) => p.thumbnail),
    },
    {
      name: 'project image',
      width: 1600,
      height: 1000,
      urls: projects.flatMap((p) => p.images ?? []),
    },
    {
      name: 'certificate image',
      width: 1400,
      height: 1000,
      urls: certificates.map((c) => c.imageUrl),
    },
    {
      name: 'certificate thumbnail',
      width: 600,
      height: 420,
      urls: certificates.map((c) => c.thumbnailUrl),
    },
    {
      name: 'education logo',
      width: 256,
      height: 256,
      urls: defined(education.map((e) => e.logoUrl)),
    },
    {
      name: 'experience logo',
      width: 256,
      height: 256,
      urls: defined(experiences.map((e) => e.logoUrl)),
    },
    {
      name: 'og image',
      width: 1200,
      height: 630,
      urls: [site.ogImage],
      label: site.title,
    },
  ];

  const seen = new Set();
  let written = 0;

  for (const group of groups) {
    for (const url of group.urls) {
      const out = publicPath(url);
      if (seen.has(out)) continue;
      seen.add(out);

      await mkdir(dirname(out), { recursive: true });
      const source = group.cutout
        ? silhouette(group.width, group.height)
        : svg(group.width, group.height, group.label ?? slugOf(url));
      await encode(sharp(source), url).toFile(out);
      written += 1;
      const { size } = await stat(out);
      console.log(`${group.width}x${group.height}  ${String(size).padStart(7)}b  ${url}`);
    }
    if (group.urls.length === 0) console.log(`(no ${group.name} referenced by the data)`);
  }

  const cvOut = publicPath(profile.cvUrl);
  await mkdir(dirname(cvOut), { recursive: true });
  const label = `${profile.name} - CV placeholder`.replace(/[^\x20-\x7e]/g, '-');
  await writeFile(cvOut, minimalPdf(label.replace(/([\\()])/g, '\\$1')));
  written += 1;
  const { size: cvSize } = await stat(cvOut);
  console.log(`PDF        ${String(cvSize).padStart(7)}b  ${profile.cvUrl}`);

  console.log(`\n${written} files written under public/`);
}

await main();
