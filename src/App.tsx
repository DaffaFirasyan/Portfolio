import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Education from '@/sections/Education';
import Contact from '@/sections/Contact';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import MapPanel from '@/map/MapPanel';
import MapStamps from '@/map/MapStamps';
import StarMap from '@/map/StarMap';
import { ViewProvider, useView } from '@/map/ViewProvider';
import Navbar from '@/nav/Navbar';
import Passport from '@/passport/Passport';
import { PassportProvider } from '@/passport/PassportProvider';
import SkyCanvas from '@/sky/SkyCanvas';

/**
 * By default a star map: the sky is the page, each constellation opens its
 * section in a panel. In Reading mode it is the passport read top to bottom
 * under the night sky: the data page, then each section on the same
 * twelve-column grid, a hairline above it, its title on the left, its evidence
 * on the right and a stamp slot at its end. The bar across the top carries the
 * way to every section, the switch, the language and the CV; the chip in the
 * corner opens the passport.
 */
function AppContent() {
  const { profile, sections, t } = useLanguage();
  const { mode } = useView();
  const home = sections.find((section) => section.id === 'home');

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t.skipToContent}
      </a>

      <Navbar />

      <SkillHighlightProvider>
        <SkyCanvas />
        <StarMap />
        <MapStamps />
        <main>
          <Hero />
          <MapPanel>
            <About />
            <Skills />
            <Experience />
            <Projects />
            <Education />
            <Contact />
          </MapPanel>
        </main>
      </SkillHighlightProvider>

      {mode === 'read' && (
        <footer className="px-6 md:px-10">
          <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-edge pt-8 pb-24 text-sm text-muted">
            <p>
              © {new Date().getFullYear()} {profile.name} · {t.builtWith}
            </p>
            <a
              href="#home"
              className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
            >
              {home?.label} ↑
            </a>
          </div>
        </footer>
      )}

      <Passport />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PassportProvider>
        <ViewProvider>
          <AppContent />
        </ViewProvider>
      </PassportProvider>
    </LanguageProvider>
  );
}
