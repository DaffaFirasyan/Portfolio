import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';

function formatMonth(value: string, lang: 'en' | 'id'): string {
  const [year, month] = value.split('-');
  const name = new Date(Number(year), Number(month) - 1).toLocaleString(
    lang === 'id' ? 'id-ID' : 'en-US',
    { month: 'short' },
  );
  return `${name} ${year}`;
}

/**
 * Roles, newest first, as a credits table. The dates sit in the left column in
 * small tabular figures and stack above the role on a phone, which has no margin
 * to give. Nothing is boxed and nothing is badged: the kind of role is said in
 * words beside the organisation and the stack is a line of text.
 *
 * Only a role that is still running takes the seal colour. Today none is, and
 * the section is allowed to say so by looking the same all the way down.
 */
export default function Experience() {
  const { experiences, experienceTypeLabel, sections, t, language } = useLanguage();
  const shell = shellPropsFrom(sections, 'experience');

  return (
    <SectionShell {...shell}>
      <ol>
        {experiences.map((entry) => {
          const current = entry.endDate === 'present';
          const end = current ? t.present : formatMonth(entry.endDate, language);

          return (
            <li
              key={entry.id}
              className="grid gap-2 border-b border-edge py-8 sm:grid-cols-[9rem_1fr] sm:gap-8"
            >
              <p
                className={`font-mono text-xs tabular-nums sm:pt-1.5 ${
                  current ? 'text-accent' : 'text-muted'
                }`}
              >
                {`${formatMonth(entry.startDate, language)} — ${end}`}
              </p>

              <div className="min-w-0">
                <h3 className="text-xl font-medium break-words text-primary text-balance">
                  {entry.role}
                </h3>
                <p className="mt-1 text-muted">
                  {entry.organization} · {experienceTypeLabel[entry.type]}
                </p>

                <p className="mt-4 max-w-[62ch] text-primary text-pretty">{entry.summary}</p>

                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-muted marker:text-edge">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight.slice(0, 32)}>{highlight}</li>
                  ))}
                </ul>

                {entry.stack && (
                  <p className="mt-4 text-sm text-primary">{entry.stack.join(' · ')}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
