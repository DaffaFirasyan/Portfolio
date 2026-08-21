/**
 * Crops the hero portrait from the original photo in Konten_Asli.
 *
 * Run with: npm run avatar
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY NUMBER TO CHANGE IS `ZOOM`, JUST BELOW.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The card always renders the portrait at its own width, so the only way to
 * change how large the person looks is to show more or less of them. `ZOOM`
 * decides that: it is how much of the photo's width gets cut away.
 *
 *   ZOOM = 1.00  the whole subject, head to hips   — head renders ~123px
 *   ZOOM = 1.15  current setting                   — head renders ~141px
 *   ZOOM = 1.32  head and chest only               — head renders ~162px
 *
 * Higher means the person is bigger and more of them is cut off. The head is
 * always kept; what goes is the arms at the sides and the body below.
 *
 * Change the number, run `npm run avatar`, and reload the page. The output is
 * always 320x446 whatever you choose, so nothing else in the project needs
 * touching — that size is what `Hero.tsx` declares and what the card renders,
 * and keeping it fixed is what stops the two drifting apart.
 */
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const ZOOM = 0.75;

// ─────────────────────────────────────────────────────────────────────────────

const root = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = join(root, 'Konten_Asli', 'gambar', 'profil', 'Foto Profil.webp');
const OUTPUT = join(root, 'public', 'profile', 'avatar.webp');

/** ProfileCard's own aspect ratio, and the size it renders at in the hero. */
const CARD_ASPECT = 0.718;
const OUT_W = 320;
const OUT_H = Math.round(OUT_W / CARD_ASPECT);

/** Where the head sits, measured from the top band where nothing else is. */
function headExtent(data, width, height, channels) {
  const band = Math.round(height * 0.18);
  let minX = width;
  let maxX = 0;
  for (let y = 0; y < band; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  return { left: minX, right: maxX, width: maxX - minX + 1, centre: Math.round((minX + maxX) / 2) };
}

async function main() {
  // The source photo carries its own transparent margins, so the subject is
  // trimmed to its true edges first. Without this, ZOOM would be measured
  // against empty space rather than against the person.
  const trimmed = await sharp(SOURCE)
    .trim({ threshold: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels } = trimmed.info;
  const head = headExtent(trimmed.data, W, H, channels);

  const cropW = Math.round(W / ZOOM);
  const cropH = Math.min(Math.round(cropW / CARD_ASPECT), H);

  // Centred on the head, not on the frame: the arms are not symmetrical, so the
  // two centres are ~50px apart and framing on the wrong one puts the face
  // visibly off to one side. At most zooms the head cannot be centred inside
  // the source at all, so the canvas is extended with transparency rather than
  // the crop being clamped back inside — clamping is what shifts the face.
  const left = head.centre - Math.round(cropW / 2);
  const padLeft = Math.max(0, -left);
  const padRight = Math.max(0, left + cropW - W);

  // Through a real format between the two steps. sharp's raw output carries no
  // metadata, and it reorders extend and extract within a single pipeline,
  // which makes the extract area invalid.
  const padded = await sharp(trimmed.data, { raw: { width: W, height: H, channels } })
    .extend({ left: padLeft, right: padRight, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const info = await sharp(padded)
    .extract({ left: left + padLeft, top: 0, width: cropW, height: cropH })
    .resize(OUT_W, OUT_H, { fit: 'fill' })
    .webp({ quality: 92 })
    .toFile(OUTPUT);

  const headRendered = Math.round((head.width / cropW) * OUT_W);
  console.log(`zoom ${ZOOM}`);
  console.log(`  source trimmed to  ${W}x${H}`);
  console.log(`  cropped            ${cropW}x${cropH}  (cut ${W - cropW}px of width, ${H - cropH}px of height)`);
  console.log(`  written            ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
  console.log(`  head renders at    ${headRendered}px inside the ${OUT_W}px card`);
  console.log('');
  console.log('Reload the page to see it. Raise ZOOM for a larger person, lower it for more of them.');
}

main();
