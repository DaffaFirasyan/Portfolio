import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { profile } from '@/data/profile';

/**
 * The avatar's declared dimensions have to match the file on disk.
 *
 * This has now shipped wrong twice, both times silently. About declared
 * 800x800 for a 320x446 file, and Hero declared 320x446 after the owner
 * replaced the portrait with one at 2000x2666. Neither looked broken — an
 * `<img>` renders at its own aspect regardless — so the only symptom was the
 * column shifting when the image arrived, which is exactly the Cumulative
 * Layout Shift this project spent a commit driving down.
 *
 * The owner manages `public/profile/avatar.webp` himself now. That makes this
 * guard the thing standing between a photo swap and a silent CLS regression,
 * because the swap is the moment the declaration goes stale and nothing else
 * would say so.
 *
 * Tolerance is one percent, not equality: the declared pair is a small integer
 * ratio approximating the file's, and demanding exactness would fail on
 * rounding rather than on a real mismatch.
 */
const TOLERANCE = 0.01;

const publicPath = (url: string) => join(process.cwd(), 'public', url.replace(/^\//, ''));

/** The width/height attributes on the avatar `<img>`, read from the source. */
function declaredIn(file: string) {
  const source = readFileSync(join(process.cwd(), 'src', 'sections', file), 'utf8');
  const width = source.match(/width=\{(\d+)\}/);
  const height = source.match(/height=\{(\d+)\}/);
  if (!width || !height) return null;
  return { width: Number(width[1]), height: Number(height[1]) };
}

describe('avatar dimensions', () => {
  it('declares the aspect ratio the file actually has', async () => {
    const meta = await sharp(publicPath(profile.avatarUrl)).metadata();
    expect(meta.width, 'avatar has no width').toBeTruthy();
    expect(meta.height, 'avatar has no height').toBeTruthy();

    const fileRatio = meta.width! / meta.height!;
    const declared = declaredIn('Hero.tsx');
    expect(declared, 'Hero.tsx no longer declares width/height on an image').not.toBeNull();

    const declaredRatio = declared!.width / declared!.height;
    expect(
      Math.abs(declaredRatio - fileRatio) / fileRatio,
      `Hero declares ${declared!.width}x${declared!.height} (${declaredRatio.toFixed(3)}) ` +
        `but ${profile.avatarUrl} is ${meta.width}x${meta.height} (${fileRatio.toFixed(3)}). ` +
        `Update the declared pair to match the file.`,
    ).toBeLessThanOrEqual(TOLERANCE);
  });
});
