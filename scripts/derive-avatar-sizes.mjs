// Derives smaller copies of the owner's portrait for srcset. It only READS
// public/profile/avatar.webp, which is the owner's own file and is never
// rewritten: re-encoding it once made it "berantakan", so the original stays as
// it is and these are separate downscaled files next to it.
//
//   node scripts/derive-avatar-sizes.mjs
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = join(process.cwd(), 'public', 'profile');
const source = join(dir, 'avatar.webp');

await mkdir(dir, { recursive: true });
const meta = await sharp(source).metadata();
console.log(`source avatar.webp ${meta.width}x${meta.height} (left untouched)`);

for (const width of [640, 960, 1280]) {
  const out = join(dir, `avatar-${width}.webp`);
  const info = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(out);
  console.log(`avatar-${width}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
}
