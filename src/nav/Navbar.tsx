import { useCallback, useEffect, useState } from 'react';

import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useLenis } from '@/hooks/useLenis';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import NodeRailNav from './NodeRailNav';

/**
 * Owns the scroll state and hands it to whichever navigation is rendered.
 *
 * This is the only non-test file that names a SectionNavProps implementation,
 * which is what makes swapping one for another a single-line change. A test in
 * Navbar.test.tsx enforces that.
 *
 * The mobile menu is a plain disclosure rather than an overlay: a button with
 * aria-expanded and a panel that closes on selection and on Escape. It is not
 * a modal, so it needs no focus trap and no inert background — for seven links
 * that is a lot of machinery to get right for no gain.
 *
 * The CV link sits outside the disclosure so it stays reachable at every width
 * without opening the menu first.
 */
export default function Navbar() {
  const { activeId, progress } = useActiveSection(SECTIONS);
  const { scrollTo } = useLenis();
  const scrolled = useScrolledPast(80);
  const [menuOpen, setMenuOpen] = useState(false);

  // The rail says where the reader is; this says what it is called. The rail's
  // labels only appear on hover, and hover is not something a reader does while
  // reading — so without this the section name is never on screen. Built from
  // the same metadata SectionShell uses, so the two can never disagree.
  const active = SECTIONS.find((section) => section.id === activeId);
  const activeLabel = active ? `${String(active.index).padStart(2, '0')} / ${active.label}` : '';

  const navigate = useCallback(
    (id: string) => {
      setMenuOpen(false);
      scrollTo(id);
    },
    [scrollTo],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          scrolled ? 'border-b border-edge bg-void/80 backdrop-blur' : 'bg-transparent'
        }`}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:h-18 md:px-12">
          <a
            href="#home"
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              navigate('home');
            }}
            className="inline-flex min-h-11 items-center font-display text-lg font-extrabold text-primary"
          >
            {profile.shortName}
          </a>

          {/* Absolutely centred rather than a third flex child, so it stays on
              the page's centre line regardless of how wide the name or the CV
              button turn out to be. pointer-events-none so it can never sit in
              front of either of them. */}
          <p className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 font-mono text-xs uppercase tracking-[0.12em] text-primary md:block">
            {activeLabel}
          </p>

          <div className="flex items-center gap-3">
            <a
              href={profile.cvUrl}
              download
              className="inline-flex min-h-11 items-center rounded-full border border-accent px-4 text-sm font-semibold text-accent"
            >
              CV
            </a>

            {/* lg, not md. At 768 the seven pills that used to live here
                measured 687px inside a 753px container, which pushed the CV
                link off screen while this button was already hidden. The pills
                are gone, but the rail replaces them at exactly the same
                breakpoint, so the disclosure still has to cover everything
                below lg. */}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 text-sm text-muted lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Sections, mobile"
            className="border-b border-edge bg-void px-6 py-4 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={section.id === activeId ? 'page' : undefined}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      navigate(section.id);
                    }}
                    className="flex min-h-11 items-center rounded-lg px-3 text-primary"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Outside the header on purpose. backdrop-filter makes an element the
          containing block for its fixed descendants, and the header gains
          backdrop-blur the moment the page scrolls past 80px — nested here, the
          rail would be positioned against the viewport at the top of the page
          and against the header everywhere else, jumping on the first scroll. */}
      <NodeRailNav
        sections={SECTIONS}
        activeId={activeId}
        progress={progress}
        onNavigate={navigate}
      />
    </>
  );
}
