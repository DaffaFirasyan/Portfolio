import { technologies } from './technologies';

describe('technologies', () => {
  it('lists every logo the owner asked for, once', () => {
    const names = technologies.map((t) => t.name);
    expect(names).toHaveLength(17);
    expect(new Set(names).size).toBe(names.length);
  });

  it('carries a viewBox per logo rather than assuming one', () => {
    // simple-icons draws on 24 units and devicon on 128. Assuming either would
    // render two of the seventeen at a fraction of their size.
    for (const t of technologies) {
      expect(t.viewBox, t.name).toMatch(/^0 0 \d+ \d+$/);
    }
    expect(new Set(technologies.map((t) => t.viewBox)).size).toBeGreaterThan(1);
  });

  it('gives every logo one real path', () => {
    for (const t of technologies) {
      expect(t.path.length, t.name).toBeGreaterThan(50);
      expect(t.path, t.name).toMatch(/^[Mm]/);
    }
  });

  it('carries no hardcoded fill, so the strip can be a single colour', () => {
    for (const t of technologies) {
      expect(t.path, t.name).not.toMatch(/fill=/);
    }
  });
});
