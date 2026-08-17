import SectionShell from '@/components/layout/SectionShell';
import { experiences } from '@/data/experiences';

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  const name = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${name} ${year}`;
}

export default function Experience() {
  return (
    <SectionShell id="experience" index={3} label="Experience" title="Where I have worked">
      <ol className="relative border-l border-edge pl-6">
        {experiences.map((e) => (
          <li key={e.id} className="mb-10 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] mt-2 block h-2.5 w-2.5 rounded-full bg-edge"
            />
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${formatMonth(e.startDate)} — ${e.endDate === 'present' ? 'Present' : formatMonth(e.endDate)}`}
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
                  <li
                    key={s}
                    className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-xs text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
