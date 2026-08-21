/**
 * Crops the hero portrait from the original photo in Konten_Asli.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIS DOES NOT RUN WITHOUT `--force`, AND THAT IS DELIBERATE.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * On 2026-08-22 the owner put his own portrait at public/profile/avatar.webp
 * and asked that it not be touched, because the version this script produced
 * looked wrong to him on his own screen. He owns that file now.
 *
 * The likely reason, for whoever picks this up: the output is 320px wide, and
 * the card renders it at up to 388 CSS px. On a display at 2x that needs ~776
 * real pixels, so a 320px source is upscaled about two and a half times and
 * goes soft. The browser pane here reports devicePixelRatio 1, so it cannot
 * show that and did not. If this script is ever wanted again, raise OUT_W to
 * 2x the rendered width before anything else — do not just re-run it.
 *
 * Run with: npm run avatar -- --force
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY NUMBER TO CHANGE IS `ZOOM`, JUST BELOW.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The card always renders the portrait at its own width, so the only way to
 * change how large the person looks is to show more or less of them. `ZOOM`
 * decides that: it is how much of the photo's width gets cut away.
 *
 *   ZOOM = 1.00  current setting, the photo as supplied  — head renders ~129px
 *   ZOOM = 1.15  a little tighter                        — head renders ~149px
 *   ZOOM = 1.32  head and chest only                     — head renders ~171px
 *
 * Higher means the person is bigger and more of them is cut off. The head is
 * always kept; what goes is the arms at the sides and the body below.
 *
 * Those numbers were re-measured on 2026-08-22 against the current source and
 * are not the ones this file used to quote. They move whenever `SOURCE` does,
 * because ZOOM is a fraction of the source's own width — the same 1.15 gave
 * ~141px against the previous photo. Re-measure after changing the source
 * rather than trusting the table.
 *
 * At 1.00 nothing is cut from the width at all — the crop is the whole trimmed
 * photo, with only as much off the bottom as the card's aspect demands. Any
 * value below roughly 1.05 lands in the same place, because the height runs out
 * first and the clamp below takes over. So 1.00 means "the photo as the owner
 * framed it", which is exactly what he asked for. The script prints how much it
 * cut on every run; read that rather than a number quoted here.
 *
 * Change the number, run `npm run avatar -- --force`, and reload the page. The
 * output is always 320x446 whatever you choose — which is no longer what
 * `Hero.tsx` declares, because the owner's own portrait is a different shape.
 * `hero-avatar.test.ts` compares the declaration against the file and fails on
 * a mismatch, so running this again means updating that pair to 320x446 too.
 */
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const ZOOM = 1.0;

// ─────────────────────────────────────────────────────────────────────────────

const root = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIR = join(root, 'Konten_Asli', 'gambar', 'profil');
const OUTPUT = join(root, 'public', 'profile', 'avatar.webp');

/**
 * The newest image in the source folder, rather than a filename.
 *
 * This used to name `fotoprofil (1).png` outright, and that broke the moment
 * the owner re-exported his photo: the file arrived as `fotoprofil (3).png`,
 * the old name stopped existing, and `npm run avatar` could only fail. A
 * hardcoded filename carrying a browser's copy-counter in it was never going
 * to survive a second export.
 *
 * The folder is a drop-box for one portrait, so "the newest image here" is
 * both what the owner means and something he cannot break by renaming. It
 * prints what it picked, because magic that does not say what it chose is
 * worse than a hardcoded path.
 */
function newestImage() {
  const files = readdirSync(SOURCE_DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => ({ f, at: statSync(join(SOURCE_DIR, f)).mtimeMs }))
    .sort((a, b) => b.at - a.at);

  if (files.length === 0) {
    throw new Error(`No image in ${SOURCE_DIR} — drop the portrait there first.`);
  }
  return join(SOURCE_DIR, files[0].f);
}

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
  // Refuses by default. The owner's photo lives at OUTPUT and overwriting it
  // silently is the exact accident this guard exists to prevent — the same
  // shape of footgun as `npm run placeholders`, which will happily replace
  // every real asset in public/ with generated stand-ins.
  if (!process.argv.includes('--force')) {
    console.error("Refusing to run: public/profile/avatar.webp is the owner's own file.");
    console.error('');
    console.error('He replaced the generated portrait with his own on 2026-08-22 and asked');
    console.error('that it not be regenerated. Read the note at the top of this file first —');
    console.error('the output width is very likely too small for a high-DPI display.');
    console.error('');
    console.error('If you still mean it:  npm run avatar -- --force');
    process.exitCode = 1;
    return;
  }

  // The source photo carries its own transparent margins, so the subject is
  // trimmed to its true edges first. Without this, ZOOM would be measured
  // against empty space rather than against the person.
  const SOURCE = newestImage();
  console.log(`source ${SOURCE.slice(root.length)}`);

  const trimmed = await sharp(SOURCE)
    .trim({ threshold: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels } = trimmed.info;
  const head = headExtent(trimmed.data, W, H, channels);

  // Both dimensions have to keep the card's aspect. Clamping only the height
  // against a tall source left the crop at a different shape, which the resize
  // below then squeezed to fit — a portrait 9% narrower than the person really
  // is. When the height runs out, the width has to come down with it.
  let cropW = Math.round(W / ZOOM);
  let cropH = Math.round(cropW / CARD_ASPECT);
  if (cropH > H) {
    cropH = H;
    cropW = Math.round(H * CARD_ASPECT);
  }

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
