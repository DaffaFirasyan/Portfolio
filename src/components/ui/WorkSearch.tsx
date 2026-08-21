import { useId, useMemo, useState } from 'react';

import { certificates } from '@/data/certificates';
import { education } from '@/data/education';
import { experiences } from '@/data/experiences';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import { buildIndex, search } from '@/lib/search';

/**
 * Search over the owner's own work, answering only in his own sentences.
 *
 * It took the slot the decorative orb held, because the two could not share it
 * — measured, there were 15px of clearance between the social links and the
 * orb's top edge. In the last section of the page, an affordance that helps
 * someone decide whether to write beats a glow. `OrbMark` is still in the tree
 * and is one line from coming back.
 *
 * **There is no model here and that is the feature.** Every sentence it can
 * show is copied out of `src/data/`, so it cannot state something about its
 * author that its author did not write — which on a portfolio is the one place
 * a confident invention does the most damage. Each hit names the entry it came
 * from and links to the section holding it, so a reader can go and check. That
 * is the same property the owner's own paper argues for.
 *
 * The index is built once with `useMemo` and searched on every keystroke. The
 * corpus is about thirty short entries, so a linear scan per keystroke is
 * genuinely cheaper than debouncing it would be.
 */
const EXAMPLES = ['Neo4j', 'Laravel', 'explainability', 'IoT'];

export default function WorkSearch() {
  const inputId = useId();
  const [query, setQuery] = useState('');

  const index = useMemo(
    () => buildIndex({ profile, projects, experiences, skillCategories, certificates, education }),
    [],
  );
  const hits = useMemo(() => search(index, query), [index, query]);

  const asked = query.trim().length > 0;

  return (
    <div className="mt-8">
      <label
        htmlFor={inputId}
        className="font-mono text-xs uppercase tracking-[0.12em] text-muted"
      >
        Search my work
      </label>

      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="a tool, a problem, a project…"
        // enterKeyHint rather than a submit button: there is nothing to submit,
        // since results update as you type. A form here would promise a round
        // trip that never happens.
        enterKeyHint="search"
        autoComplete="off"
        className="mt-2 min-h-11 w-full rounded-lg border border-edge bg-surface px-4 text-sm text-primary placeholder:text-muted"
      />

      {/* Announced politely rather than assertively: results change on every
          keystroke, and an assertive region would interrupt the reader mid-word
          on each one. */}
      <p aria-live="polite" className="sr-only">
        {asked ? `${hits.length} result${hits.length === 1 ? '' : 's'} for ${query}` : ''}
      </p>

      {!asked && (
        <p className="mt-3 text-sm text-muted">
          Try{' '}
          {EXAMPLES.map((example, i) => (
            <span key={example}>
              {i > 0 && ', '}
              <button
                type="button"
                onClick={() => setQuery(example)}
                className="text-accent underline underline-offset-2"
              >
                {example}
              </button>
            </span>
          ))}
          .
        </p>
      )}

      {asked && hits.length === 0 && (
        // An honest empty state. The alternative — showing the closest loose
        // match — is how a search over a small corpus starts implying things
        // its author never claimed.
        <p className="mt-3 text-sm text-muted">
          Nothing here mentions that. Everything this searches is on this page.
        </p>
      )}

      {hits.length > 0 && (
        <ul className="mt-3 space-y-3">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.title}`} className="rounded-lg border border-edge bg-surface p-4">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
                {hit.kind}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">{hit.title}</p>
              {/* Verbatim, and marked as a quotation because that is what it
                  is — this component never composes a sentence of its own. */}
              <blockquote className="mt-2 text-sm leading-relaxed text-muted">
                {hit.sentence}
              </blockquote>
              <a
                href={`#${hit.sectionId}`}
                className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-accent"
              >
                Go to {hit.sectionId} →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
