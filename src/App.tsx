import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Education from '@/sections/Education';
import Contact from '@/sections/Contact';
import { profile } from '@/data/profile';
import { SkillHighlightProvider } from '@/highlight/SkillHighlight';
import Marquee from '@/motion/Marquee';
import Navbar from '@/nav/Navbar';

export default function App() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>

      <Navbar />

      <SkillHighlightProvider>
        <main>
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Education />
          <Contact />
        </main>
      </SkillHighlightProvider>

      {/* overflow-hidden is load-bearing. The marquee is deliberately wider
          than the viewport, and without clipping here the whole document
          scrolls sideways — the same bug the grain canvas already shipped
          once. */}
      <footer className="overflow-hidden border-t border-edge py-10">
        <Marquee text={`${profile.name} — ${profile.roles[0]}`} />

        <div className="mx-auto mt-8 w-full max-w-[1200px] px-6 md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`© ${new Date().getFullYear()} ${profile.name} · Built with React`}
          </p>
        </div>
      </footer>
    </>
  );
}
