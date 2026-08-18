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
