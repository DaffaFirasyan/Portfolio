import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
  children: ReactNode;
}

export default function SectionShell({ id, index, label, title, children }: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {`${String(index).padStart(2, '0')} / ${label}`}
        </p>
        <h2 className="mt-3 font-display text-h2 font-bold tracking-[-0.02em] text-primary">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
