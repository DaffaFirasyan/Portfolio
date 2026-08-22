import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Aceternity's Focus Cards, kept as a mechanic rather than as a card.
 *
 * Upstream is ~50 lines that own everything: a fixed `h-60 md:h-96`, a
 * hardcoded `grid-cols-3 max-w-5xl mx-auto`, `bg-gray-100 dark:bg-neutral-900`,
 * an untyped `card: any`, a bare `<img>` with no dimensions, and a title in a
 * `<div>`. Vendored whole it would have imposed a height on the one section
 * this project has repeatedly cut down, broken the heading outline that
 * `projects-filter.test.tsx` asserts, and reintroduced the hardcoded palette
 * that `SpotlightCard` already had to have edited out of it.
 *
 * What is worth having is the twelve lines in the middle: **one index is
 * hovered, and everything that is not it softens.** That is kept exactly.
 * Everything else — sizing, colour, markup, headings — belongs to the caller.
 *
 * It rhymes with something the page already does. The skill-to-project
 * cross-highlight dims unrelated projects when a skill is hovered; this is the
 * same idea inside a single grid, so the two read as one language instead of
 * two competing ones. That is also why the softening here is deliberately
 * gentler than the cross-highlight's: one is an answer to a question the
 * reader asked, the other is just the cursor moving.
 */
interface FocusContext {
  hovered: number | null;
  setHovered: (index: number | null) => void;
}

const Focus = createContext<FocusContext>({ hovered: null, setHovered: () => {} });

export function FocusGrid({ className = '', children }: { className?: string; children: ReactNode }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const value = useMemo(() => ({ hovered, setHovered }), [hovered]);

  return (
    <Focus.Provider value={value}>
      {/* No grid definition here on purpose. Upstream hardcodes three columns
          and a max width; the bento layout is the caller's to describe. */}
      <div className={className}>{children}</div>
    </Focus.Provider>
  );
}

/**
 * One focusable cell.
 *
 * `blur-[1px]` and `scale-[0.99]`, against upstream's `blur-sm scale-[0.98]`.
 * Upstream's numbers are tuned for a wall of photographs where blurring is the
 * whole effect; these cells carry a heading, an outcome sentence and a stack,
 * and text under `blur-sm` reads as broken rather than as de-emphasised.
 *
 * Only opacity, blur and transform change between states — never anything that
 * affects layout — so nothing moves under the cursor as it crosses the grid.
 */
export function FocusItem({
  index,
  className = '',
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const { hovered, setHovered } = useContext(Focus);
  const dimmed = hovered !== null && hovered !== index;

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      // Focus as well as hover: the grid is keyboard-navigable because each
      // cell contains a real button, and a keyboard reader should get the same
      // emphasis a mouse does. Upstream is mouse-only.
      onFocus={() => setHovered(index)}
      onBlur={() => setHovered(null)}
      className={[
        'h-full transition-[opacity,filter,transform] duration-300 ease-out motion-reduce:transition-none',
        dimmed ? 'opacity-60 blur-[1px] scale-[0.99]' : 'opacity-100 blur-0 scale-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
