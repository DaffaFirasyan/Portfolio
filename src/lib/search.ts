import type { Certificate, Education, Experience, Profile, Project, SkillCategory } from '@/types';

/**
 * Retrieval over the owner's own content. No model, no API, no key.
 *
 * The point is what it *cannot* do: every string it returns is copied verbatim
 * out of `src/data/`, so it has no way to state something he did not write. A
 * generative answer on a portfolio can be confidently wrong about its author,
 * which is the one place that is least forgivable — and this is the same
 * property his own paper argues for, since every hit carries the entry it came
 * from rather than asserting a fact from nowhere.
 *
 * The index is built once at module load from the data files. It is small
 * enough that the honest implementation is a linear scan: at the time of
 * writing the whole corpus is around thirty entries, and a scan over thirty
 * short strings costs less than the machinery to avoid it would.
 */

export type SourceKind =
  | 'Project'
  | 'Experience'
  | 'Skill'
  | 'Certificate'
  | 'Education'
  | 'Paper'
  | 'About';

export interface Passage {
  /** Which entry this came from, e.g. "AssetMind — Maintenance Decision Support". */
  title: string;
  kind: SourceKind;
  /** The id of the section to scroll to, so a hit is reachable. */
  sectionId: string;
  /** Sentences, each one quotable on its own. */
  sentences: string[];
  /** Extra terms that should match this entry without being shown as an answer. */
  keywords: string[];
}

export interface Hit {
  title: string;
  kind: SourceKind;
  sectionId: string;
  /** The single best-matching sentence, verbatim. */
  sentence: string;
  score: number;
}

/**
 * Words carrying no retrieval signal.
 *
 * Deliberately short. An aggressive stop list starts eating real query terms —
 * "it" matters in "what is it built with" far less than "built", but "AI" is
 * two letters and is one of the most important terms in this corpus, so length
 * alone cannot be the rule.
 */
const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'did', 'do', 'does', 'for', 'from', 'has',
  'have', 'he', 'his', 'how', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to',
  'was', 'were', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'you', 'your',
]);

/** Lowercase alphanumeric runs, stop words dropped. `.NET` and `KG-RAG` survive as parts. */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Split prose into sentences without breaking on the abbreviations this corpus
 * actually contains.
 *
 * A naive split on `.` cuts "4.73", ".NET Core 8" and "banjarsarigarut.id" in
 * half — all three are real strings in this data. So a break requires the dot
 * to be followed by whitespace and a capital letter, which none of those are.
 */
export function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface Corpus {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  skillCategories: SkillCategory[];
  certificates: Certificate[];
  education: Education[];
}

/** Flattens the data files into passages. Nothing here is generated. */
export function buildIndex({
  profile,
  projects,
  experiences,
  skillCategories,
  certificates,
  education,
}: Corpus): Passage[] {
  const passages: Passage[] = [];

  for (const p of projects) {
    passages.push({
      title: p.title,
      kind: 'Project',
      sectionId: 'projects',
      // `solution` first, and the order is the fallback rule. When a query
      // matches only the stack — "Neo4j" appears in no sentence AssetMind owns
      // — the first sentence is what gets shown, and someone searching a tool
      // wants what was built with it, not the problem that preceded it.
      sentences: [p.solution, p.outcome, p.problem].filter((s): s is string => Boolean(s)),
      // The stack and category are how a reader searches — "Neo4j", "Laravel",
      // "AI" — but they are labels, not answers, so they match without ever
      // being returned as a sentence.
      keywords: [...p.stack, p.category, p.role ?? '', String(p.year)],
    });
  }

  if (profile.publication) {
    const paper = profile.publication;
    passages.push({
      title: paper.title,
      kind: 'Paper',
      sectionId: 'about',
      sentences: [
        `${paper.title} — ${paper.authors.join(', ')}, ${paper.venue}, published in ${paper.publisher}.`,
      ],
      keywords: [paper.venue, paper.venueFull, paper.publisher, paper.doi],
    });
  }

  for (const e of experiences) {
    passages.push({
      title: `${e.role}, ${e.organization}`,
      kind: 'Experience',
      sectionId: 'experience',
      sentences: [e.summary, ...e.highlights],
      keywords: [...(e.stack ?? []), e.organization, e.location ?? ''],
    });
  }

  for (const ed of education) {
    passages.push({
      title: `${ed.degree}, ${ed.institution}`,
      kind: 'Education',
      sectionId: 'education',
      sentences: ed.highlights ?? [],
      keywords: [ed.field, ed.institution, ed.gpa ?? ''],
    });
  }

  for (const category of skillCategories) {
    passages.push({
      title: category.name,
      kind: 'Skill',
      sectionId: 'skills',
      sentences: [`${category.name}: ${category.skills.map((s) => s.name).join(', ')}.`],
      keywords: category.skills.map((s) => s.name),
    });
  }

  for (const c of certificates) {
    passages.push({
      title: c.title,
      kind: 'Certificate',
      sectionId: 'education',
      // A certificate has no prose. Its own title is the only true sentence it
      // owns, so that is what a hit quotes.
      sentences: [`${c.title} — issued by ${c.issuer}.`],
      keywords: [...c.skills, c.issuer, c.category],
    });
  }

  // Insertion order is the tie-break, because the sort is stable and a small
  // corpus ties constantly — "RAG" scores 3 against the paper, the AI skills
  // card, AssetMind and a conference certificate all at once. So the order
  // here is editorial: work he built, then the paper, then jobs, then the
  // degree, then the skills list, then credentials, then the bio.
  //
  // Getting this wrong is visible: with certificates ahead of the paper, "RAG"
  // answered with a conference attendance certificate and never mentioned the
  // publication at all.
  //
  // The bio is last on purpose — it is the broadest text here, so on a tie it
  // should lose to an entry that is actually about the thing asked for.
  passages.push({
    title: 'About',
    // Its own kind. It read 'Education' at first, and the widget prints the
    // kind above the quote — so a sentence from the bio was labelled
    // "EDUCATION", which is a small lie in the one place this thing exists to
    // avoid telling them.
    kind: 'About',
    sectionId: 'about',
    sentences: profile.bio.flatMap(sentencesOf),
    keywords: [profile.location, ...profile.roles],
  });

  return passages;
}

/**
 * The best sentence in a passage for these terms, and how well it scores.
 *
 * Scoring is deliberately plain: a term found in the title or the keywords is
 * worth more than one found in prose, because someone typing "Neo4j" wants the
 * project built with Neo4j rather than the sentence that happens to mention it.
 * Coverage beats frequency — matching three distinct query terms once each
 * outranks matching one of them three times, which is what stops a long
 * paragraph winning on repetition alone.
 */
function scorePassage(passage: Passage, terms: string[]): { sentence: string; score: number } {
  const titleTokens = new Set(tokenise(passage.title));
  const keywordTokens = new Set(passage.keywords.flatMap(tokenise));
  const sentenceTokens = passage.sentences.map((s) => new Set(tokenise(s)));

  // Each term is worth its *best* placement, never the sum of them. Summing
  // double-counts whenever a passage's sentence is built from its own keywords,
  // which is exactly the shape of the skill cards: "Data & Platform: MySQL,
  // ..., Neo4j." scored 4 for "Neo4j" — three for the keyword and one more for
  // the same word in the generated sentence — and so outranked the project
  // actually built with it. Taking the maximum removes that artefact without
  // needing a special case per kind.
  let score = 0;
  for (const term of terms) {
    if (titleTokens.has(term) || keywordTokens.has(term)) score += 3;
    else if (sentenceTokens.some((tokens) => tokens.has(term))) score += 1;
  }

  // The sentence to show is chosen separately from the score: the reader wants
  // whichever line covers most of what they asked, regardless of why the
  // passage ranked.
  let best = '';
  let bestCoverage = 0;
  passage.sentences.forEach((sentence, i) => {
    let coverage = 0;
    for (const term of terms) if (sentenceTokens[i].has(term)) coverage += 1;
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      best = sentence;
    }
  });

  // A passage that matched only on its title or stack still owes a sentence.
  if (!best && score > 0) best = passage.sentences[0] ?? '';

  return { sentence: best, score };
}

/**
 * Search the index. Returns nothing rather than guessing when nothing matches.
 *
 * An empty result is a real answer here — it means the site does not claim
 * whatever was asked about — and it is a better one than the closest loose
 * match, which is exactly how a search over a small corpus starts telling
 * comfortable lies.
 */
export function search(index: Passage[], query: string, limit = 3): Hit[] {
  const terms = [...new Set(tokenise(query))];
  if (terms.length === 0) return [];

  return index
    .map((passage) => ({ passage, ...scorePassage(passage, terms) }))
    .filter((r) => r.score > 0 && r.sentence !== '')
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ passage, sentence, score }) => ({
      title: passage.title,
      kind: passage.kind,
      sectionId: passage.sectionId,
      sentence,
      score,
    }));
}
