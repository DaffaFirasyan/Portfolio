import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { profile } from './profile';
import { site } from './site';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');

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

  it('preloads the avatar the profile data actually names', () => {
    // The avatar is the page's largest contentful paint, and it was being
    // discovered 880ms late because React renders it. The preload hint fixes
    // that only while it points at the right file — and it is a hardcoded path
    // in index.html sitting next to a data file that owns the real one, which
    // is exactly the drift this suite exists to catch. Swapping in a real
    // photo under a new name would otherwise leave a preload fetching a file
    // nobody displays, and the LCP regression would be silent.
    const preload = html.match(/<link[^>]*rel="preload"[^>]*>/s);
    if (!preload) throw new Error('index.html carries no preload for the avatar');

    expect(preload[0]).toContain(`href="${profile.avatarUrl}"`);
    expect(preload[0]).toContain('as="image"');
    expect(preload[0]).toContain('fetchpriority="high"');
  });

  it('gives crawlers a robots.txt and a sitemap that agree on the origin', () => {
    expect(read('public', 'robots.txt')).toContain(`Sitemap: ${site.url}/sitemap.xml`);
    expect(read('public', 'sitemap.xml')).toContain(`<loc>${site.url}/</loc>`);
  });
});
