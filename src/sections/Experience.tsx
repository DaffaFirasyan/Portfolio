import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { experiences } from '@/data/experiences';
import Chip from '@/motion/Chip';
import Reveal from '@/motion/Reveal';

/** Seconds between one timeline entry arriving and the next. */
const STEP = 0.06;

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  const name = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${name} ${year}`;
}

export default function Experience() {
  return (
    <SectionShell {...shellProps('experience')}>
      {/* One-sided at every width. The alternating two-sided pattern reliably
          breaks at tablet widths and does not pay for its complexity. */}
      <ol className="relative border-l border-edge pl-6">
        {experiences.map((e, index) => {
          const current = e.endDate === 'present';

          return (
            <li key={e.id} className="mb-10 last:mb-0">
              {/* Outside the Reveal on purpose. AnimatedContent sets a
                  transform on its wrapper, and a transformed ancestor becomes
                  the containing block for absolutely positioned descendants —
                  which would move this dot off the line it marks. */}
              <span
                aria-hidden="true"
                className={`absolute -left-[5px] mt-2 block h-2.5 w-2.5 rounded-full ${
                  current ? 'bg-accent' : 'bg-edge'
                }`}
              />

              <Reveal delay={STEP * index}>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {`${formatMonth(e.startDate)} — ${current ? 'Present' : formatMonth(e.endDate)}`}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold break-words text-primary">
                  {e.role}
                </h3>
                <p className="text-accent-2">{e.organization}</p>
                <p className="mt-2 max-w-[68ch] text-muted">{e.summary}</p>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {e.highlights.map((h) => (
                    <li key={h.slice(0, 32)}>{h}</li>
                  ))}
                </ul>

                {e.stack && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {e.stack.map((s) => (
                      <li key={s}>
                        <Chip size="sm">{s}</Chip>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
