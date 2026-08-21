import { certificates } from '@/data/certificates';
import { education } from '@/data/education';
import { experiences } from '@/data/experiences';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';

import { buildIndex, search, sentencesOf, tokenise } from './search';

const index = buildIndex({ profile, projects, experiences, skillCategories, certificates, education });

/** Every sentence this can ever return, for the "invents nothing" guard. */
const corpus = index.flatMap((p) => p.sentences);

describe('tokenise', () => {
  it('drops stop words and single characters', () => {
    expect(tokenise('What is the AI he built with?')).toEqual(['ai', 'built']);
  });

  it('keeps short technical terms that carry the most signal here', () => {
    // "AI", "ML" and "KG" are two characters and are among the most
    // discriminating terms in this corpus. A length rule alone would eat them.
    expect(tokenise('AI ML KG-RAG .NET C#')).toEqual(['ai', 'ml', 'kg', 'rag', 'net', 'c#']);
  });
});

describe('sentencesOf', () => {
  it('does not split on the dots this corpus actually contains', () => {
    // All three are real strings in src/data. A naive split on "." cuts each
    // of them in half.
    const text = 'It scored 4.73 out of 5. He used .NET Core 8. It is live at banjarsarigarut.id today.';
    expect(sentencesOf(text)).toEqual([
      'It scored 4.73 out of 5.',
      'He used .NET Core 8.',
      'It is live at banjarsarigarut.id today.',
    ]);
  });
});

describe('search', () => {
  it('never returns a sentence that is not in the data', () => {
    // The whole reason this exists instead of a model. Anything it can say,
    // the owner already wrote.
    const queries = ['neo4j', 'laravel', 'knowledge graph', 'python', 'village', 'maintenance'];
    for (const q of queries) {
      for (const hit of search(index, q)) {
        expect(corpus, `"${hit.sentence}" is not in the data`).toContain(hit.sentence);
      }
    }
  });

  it('finds the AI project by a tool only that project names', () => {
    const [top] = search(index, 'Neo4j');
    expect(top).toBeDefined();
    expect(top.title).toContain('AssetMind');
    expect(top.kind).toBe('Project');
  });

  it('finds work by a framework that is only in a stack, never in prose', () => {
    // "Hostinger" appears in stacks and nowhere in any sentence. If keywords
    // were not indexed, this would return nothing at all.
    const hits = search(index, 'Hostinger');
    expect(hits.length).toBeGreaterThan(0);
  });

  it('returns nothing rather than the nearest loose match', () => {
    // An empty result is a real answer: the site does not claim this. The
    // failure mode being guarded is a small corpus quietly returning its
    // least-bad row for anything at all.
    expect(search(index, 'kubernetes rust blockchain')).toEqual([]);
    expect(search(index, '')).toEqual([]);
    expect(search(index, 'the and of')).toEqual([]);
  });

  it('gives every hit a section a reader can actually get to', () => {
    const sections = new Set(['about', 'projects', 'skills', 'experience', 'education', 'contact']);
    for (const hit of search(index, 'developer', 10)) {
      expect(sections, `${hit.title} points at "${hit.sectionId}"`).toContain(hit.sectionId);
    }
  });

  it('ranks the entry a term names above one that merely mentions it', () => {
    // "Python" is in AssetMind's and Animart's stacks and in the skills list.
    // Whatever wins, it must be something whose own title or stack carries it,
    // not the About prose that happens to use the word.
    const [top] = search(index, 'python');
    expect(top).toBeDefined();
    expect(top.title).not.toBe('About');
  });

  it('honours the limit', () => {
    expect(search(index, 'developer', 2).length).toBeLessThanOrEqual(2);
  });
});

describe('buildIndex', () => {
  it('covers every project, experience and certificate', () => {
    const titles = index.map((p) => p.title);
    for (const p of projects) expect(titles).toContain(p.title);
    for (const c of certificates) expect(titles).toContain(c.title);
    for (const e of experiences) expect(titles).toContain(`${e.role}, ${e.organization}`);
  });

  it('never indexes an empty passage', () => {
    for (const p of index) {
      expect(p.sentences.length, `${p.title} has no sentences`).toBeGreaterThan(0);
      for (const s of p.sentences) expect(s.trim()).not.toBe('');
    }
  });
});
