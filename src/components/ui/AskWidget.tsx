import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, X } from 'lucide-react';

import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { certificates } from '@/data/certificates';
import { education } from '@/data/education';
import { experiences } from '@/data/experiences';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import { buildIndex, search, type Hit } from '@/lib/search';

/**
 * A floating panel that answers questions about this site, in its owner's own
 * sentences.
 *
 * **It is retrieval, not generation, and the copy says so.** Every *fact* it
 * shows comes out of `src/data/`. Most answers are a whole sentence the owner
 * wrote; a few — the profile line, the certificates, the skill cards — are
 * assembled from his fields using a fixed frame, because "his name is X" is not
 * a sentence anyone had written down. Nothing is composed at runtime by
 * anything but those frames, so it cannot state something about its author that
 * its author did not say. Each answer names the entry it came from and links to
 * the section holding it, so a reader can go and check.
 *
 * The distinction matters enough to keep the wording honest: the panel says
 * answers *come from* this page, not that they are *quoted from* it, because
 * the second would not be true of all of them.
 *
 * Questions work without any parsing: the tokeniser drops stop words, so "what
 * did he build with Laravel?" reduces to `built, laravel` and searches exactly
 * as the bare terms would.
 *
 * **Not a `<dialog>`, deliberately.** The project's `Dialog` opens modally, and
 * modality is wrong here: this sits beside the page rather than replacing it,
 * and a reader should be able to keep scrolling while it is open. So it is a
 * non-modal panel with the three behaviours modality would otherwise have given
 * it for free — Escape closes, an outside click closes, and focus moves in on
 * open and returns to the launcher on close.
 */
const SUGGESTIONS = [
  'Who is he?',
  'Tell me about the AI research',
  'What did he build with Laravel?',
  'How do I contact him?',
];

interface Exchange {
  id: number;
  question: string;
  hits: Hit[];
}

export default function AskWidget() {
  const panelId = useId();
  // Through the hook, never a media query read inside the component — that is
  // the project's one rule about reduced motion, and the reason is that gating
  // spread around is gating that gets forgotten somewhere.
  const { animate } = useMotionAllowed();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [log, setLog] = useState<Exchange[]>([]);

  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const transcript = useRef<HTMLDivElement>(null);

  const index = useMemo(
    () => buildIndex({ profile, projects, experiences, skillCategories, certificates, education }),
    [],
  );

  const close = useCallback(() => {
    setOpen(false);
    // Focus goes back where it came from. Without this it lands on <body> and a
    // keyboard reader is dropped at the top of the document.
    launcher.current?.focus();
  }, []);

  const ask = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;
      setLog((prev) => [...prev, { id: prev.length, question: trimmed, hits: search(index, trimmed) }]);
      setQuery('');
    },
    [index],
  );

  // Escape from anywhere, and an outside click. Both are what modality would
  // have provided; neither is free without it.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panel.current?.contains(target) || launcher.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // Keep the newest exchange in view. scrollTop rather than scrollIntoView:
  // the latter scrolls the whole page to bring the panel into view, which on a
  // fixed element means moving the document under the reader for no reason.
  useEffect(() => {
    const el = transcript.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <>
      {/* lg:right-20 clears the node-rail nav, which is fixed at `right-8` and
          vertically centred. At `right-6` the open panel covers it — measured:
          the rail occupies 1221–1233px of a 1280px viewport, and a 24rem panel
          anchored 24px from the edge runs straight through it. Below lg the
          rail is hidden, so the tighter inset is free. */}
      <div className="fixed bottom-6 right-6 z-50 lg:right-20 print:hidden">
        {open && (
          <div
            ref={panel}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label="Ask about this portfolio"
            style={animate ? { animation: 'ask-panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' } : undefined}
            className="mb-3 flex h-[min(30rem,70vh)] w-[min(24rem,calc(100vw-3rem))] flex-col rounded-xl border border-edge bg-elevated shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-edge p-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
                  Ask about my work
                </p>
                {/* Said plainly rather than implied. This is a search over the
                    page, and calling it anything cleverer would be a claim the
                    code does not back. */}
                <p className="mt-1 text-xs text-muted">
                  Answers come from this page's own content — no AI, nothing made up.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div
              ref={transcript}
              // no-scrollbar hides the indicator only; overflow-y stays auto, so
              // wheel, touch and keyboard all still scroll it.
              className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4"
              data-lenis-prevent
            >
              {log.length === 0 && (
                <div>
                  <p className="text-sm text-muted">Try one of these:</p>
                  <ul className="mt-2 space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => ask(s)}
                          className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-left text-sm text-primary"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {log.map((entry) => (
                <div
                  key={entry.id}
                  style={animate ? { animation: 'ask-message-in 260ms ease-out both' } : undefined}
                >
                  <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-accent px-3 py-2 text-sm font-medium text-void">
                    {entry.question}
                  </p>

                  {entry.hits.length === 0 ? (
                    // An honest miss. Offering the nearest loose match is how a
                    // search over a small corpus starts implying things its
                    // author never claimed.
                    <p className="mt-2 text-sm text-muted">
                      Nothing on this page mentions that.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {entry.hits.map((hit) => (
                        <li
                          key={`${hit.kind}-${hit.title}`}
                          className="rounded-lg border border-edge bg-surface p-3"
                        >
                          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
                            {hit.kind}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-primary">{hit.title}</p>
                          {/* A quotation element, because that is what it is —
                              this component never writes a sentence itself. */}
                          <blockquote className="mt-1.5 text-sm leading-relaxed text-muted">
                            {hit.sentence}
                          </blockquote>
                          <a
                            href={`#${hit.sectionId}`}
                            onClick={close}
                            className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-accent"
                          >
                            Go to {hit.sectionId} →
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(query);
              }}
              className="flex items-center gap-2 border-t border-edge p-3"
            >
              <label htmlFor={`${panelId}-input`} className="sr-only">
                Ask a question about this portfolio
              </label>
              <input
                ref={input}
                id={`${panelId}-input`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask something…"
                autoComplete="off"
                enterKeyHint="send"
                className="min-h-11 w-full rounded-lg border border-edge bg-surface px-3 text-sm text-primary placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Ask"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-void"
              >
                <Search size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="ml-auto flex min-h-14 min-w-14 items-center justify-center rounded-full bg-accent text-void shadow-lg"
        >
          {/* The label changes with the state, so a screen reader hears what the
              button will do next rather than what it is. */}
          <span className="sr-only">{open ? 'Close the question panel' : 'Ask about my work'}</span>
          {open ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
