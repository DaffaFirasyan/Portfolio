import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Skills from '@/sections/Skills';
import Experience from '@/sections/Experience';
import Projects from '@/sections/Projects';
import Education from '@/sections/Education';
import Contact from '@/sections/Contact';
import { profile } from '@/data/profile';

export default function App() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>

      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>

      <footer className="border-t border-edge py-10">
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`© ${new Date().getFullYear()} ${profile.name} · Built with React`}
          </p>
        </div>
      </footer>
    </>
  );
}
