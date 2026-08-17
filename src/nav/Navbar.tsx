import { useCallback, useEffect, useState } from 'react';

import { profile } from '@/data/profile';
import { SECTIONS } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useLenis } from '@/hooks/useLenis';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import PillNavAdapter from './PillNavAdapter';

/**
 * Owns the scroll state and hands it to whichever navigation is rendered.
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
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled ? 'border-b border-edge bg-void/80 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:h-18 md:px-12">
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

        <nav aria-label="Sections" className="hidden md:block">
          <PillNavAdapter
            sections={SECTIONS}
            activeId={activeId}
            progress={progress}
            onNavigate={navigate}
          />
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={profile.cvUrl}
            download
            className="inline-flex min-h-11 items-center rounded-full border border-accent px-4 text-sm font-semibold text-accent"
          >
            CV
          </a>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 text-sm text-muted md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Sections, mobile"
          className="border-b border-edge bg-void px-6 py-4 md:hidden"
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
  );
}
