import type { SectionNavProps } from '@/types';

/**
 * The desktop navigation, and the first implementation of SectionNavProps.
 *
 * It owns no scroll state — activeId and progress arrive as props — so the
 * node-rail navigation planned to replace it can be swapped in by changing one
 * import, without touching the hooks or any section.
 *
 * Links keep real href anchors so navigation still works if the JavaScript
 * fails to load, and so middle-click, copy-link, and open-in-new-tab behave as
 * a reader expects. onNavigate takes over only for plain left clicks, which is
 * where smooth scrolling is wanted.
 */
export default function PillNavAdapter({
  sections,
  activeId,
  progress,
  onNavigate,
}: SectionNavProps) {
  return (
    <div className="flex items-center gap-4">
      <ul className="flex items-center gap-1 rounded-full border border-edge bg-surface p-1">
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onNavigate(section.id);
                }}
                className={`flex min-h-11 items-center rounded-full px-4 text-sm transition-colors ${
                  isActive ? 'bg-accent font-semibold text-void' : 'text-muted hover:text-primary'
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 w-16 overflow-hidden rounded-full bg-edge"
      >
        <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
