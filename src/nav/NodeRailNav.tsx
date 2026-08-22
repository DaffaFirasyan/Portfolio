import { useMotionAllowed } from '@/hooks/useMotionAllowed';
import { railGeometry, type NodeState } from '@/lib/rail';
import type { SectionNavProps } from '@/types';

/** Tailwind cannot build a class name from a variable, so the states are literal. */
const DOT: Record<NodeState, string> = {
  done: 'h-2 w-2 bg-accent',
  active: 'h-3.5 w-3.5 bg-accent',
  todo: 'h-2 w-2 border border-edge bg-surface',
};

const RAIL_HEIGHT = 280;

/**
 * The section-node rail — the second implementation of SectionNavProps, and the
 * navigation spec D6 intended from the start.
 *
 * It owns no scroll state: activeId and progress arrive as props from the same
 * hook the pill navigation used, so the two implementations cannot disagree
 * about where the reader is.
 *
 * It renders as a sibling of the header, never inside it. backdrop-filter makes
 * an element the containing block for fixed descendants, and the header gains
 * backdrop-blur once the page scrolls — a rail nested inside it would be
 * positioned against the viewport at the top of the page and against the header
 * everywhere else.
 *
 * Desktop only. A fixed vertical rail at tablet width sits on top of the
 * content; below lg the header's disclosure menu carries navigation instead.
 */
export default function NodeRailNav({ sections, activeId, progress, onNavigate }: SectionNavProps) {
  const { animate } = useMotionAllowed();
  const { nodes, fill } = railGeometry(sections, activeId, progress);
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <nav
      aria-label="Sections"
      className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative w-3" style={{ height: RAIL_HEIGHT }}>
        <div
          role="progressbar"
          aria-label="Reading progress"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-edge"
        >
          <div
            className="w-full bg-accent"
            style={{
              height: `${fill * 100}%`,
              transition: animate ? 'height 180ms linear' : undefined,
            }}
          />
        </div>

        <ul>
          {nodes.map((node) => (
            <li
              key={node.id}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${node.offset * 100}%` }}
            >
              <a
                href={`#${node.id}`}
                aria-current={node.state === 'active' ? 'page' : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onNavigate(node.id);
                }}
                className="group relative flex h-11 w-11 items-center justify-center"
              >
                <span className="sr-only">{node.label}</span>

                <span
                  aria-hidden="true"
                  className={`rounded-full ${DOT[node.state]} ${
                    animate ? 'transition-all duration-200' : ''
                  }`}
                />

                {/* Decorative duplicate of the label above. The accessible name
                    comes from the sr-only span, so this must stay hidden. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full mr-1 whitespace-nowrap rounded-full border border-edge bg-surface px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {node.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
