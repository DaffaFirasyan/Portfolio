import type { SectionMeta } from '@/types';

export const SECTIONS: SectionMeta[] = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1, title: 'Who I am' },
  { id: 'skills', label: 'Skills', index: 2, title: 'What I work with' },
  { id: 'experience', label: 'Experience', index: 3, title: 'Where I have worked' },
  { id: 'projects', label: 'Projects', index: 4, title: 'Selected work' },
  { id: 'education', label: 'Education', index: 5, title: 'Study and certification' },
  { id: 'contact', label: 'Contact', index: 6, title: 'Let us talk' },
];

interface ShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
}

/**
 * SectionShell props for one section, read from SECTIONS.
 *
 * Sections used to repeat their own number, label and heading as literals,
 * which meant the eyebrow a section rendered and the entry navigation reads
 * were two facts that merely happened to agree. Reading both from here makes
 * them one fact.
 *
 * Throws instead of rendering a header assembled from missing metadata — a
 * section headed `undefined` is worse than a failed render.
 */
export function shellProps(id: string): ShellProps {
  const meta = SECTIONS.find((section) => section.id === id);
  if (!meta?.title) {
    throw new Error(`SECTIONS has no titled entry for "${id}"`);
  }
  return { id: meta.id, index: meta.index, label: meta.label, title: meta.title };
}

export function shellPropsFrom(sections: SectionMeta[], id: string): ShellProps {
  const meta = sections.find((section) => section.id === id);
  if (meta?.title) {
    return { id: meta.id, index: meta.index, label: meta.label, title: meta.title };
  }
  return shellProps(id);
}

