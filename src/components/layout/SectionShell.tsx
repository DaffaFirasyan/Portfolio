import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  index: number;
  label: string;
  title: string;
  /** A working control for the left columns, set under the title (a filter, say). */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * One section of the plate section. A hairline draws across the top as it
 * arrives; under it the title takes the left four of twelve columns and the
 * evidence takes the right eight, so every section is laid out the same way and
 * the eye learns the page once. On wide screens the title stays beside its
 * evidence while it scrolls; on a phone the two simply stack.
 *
 * `index` and `label` are still accepted because the section metadata supplies
 * them; neither is printed. The heading carries its own weight.
 */
export default function SectionShell({ id, title, aside, children }: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-14 px-6 md:px-10">
      <div className="mx-auto grid w-full max-w-[1120px] gap-x-10 gap-y-10 pb-20 md:pb-28 lg:grid-cols-12">
        <div aria-hidden="true" className="rule h-px bg-edge lg:col-span-12" />
        <div className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <h2 className="font-display text-4xl leading-[1.05] font-normal tracking-[-0.03em] text-primary text-balance md:text-5xl">
            {title}
          </h2>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
