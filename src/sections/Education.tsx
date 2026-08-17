import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { education } from '@/data/education';
import { certificates } from '@/data/certificates';

export default function Education() {
  return (
    <SectionShell {...shellProps('education')}>
      {education.map((e) => (
        <div key={e.id} className="rounded-xl border border-edge bg-surface p-6">
          <h3 className="font-display text-lg font-bold text-primary">{e.degree}</h3>
          <p className="text-accent-2">{e.institution}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {`${e.startYear} — ${e.endYear === 'present' ? 'Present' : e.endYear}${e.gpa ? ` · GPA ${e.gpa}` : ''}`}
          </p>
          {e.highlights && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
              {e.highlights.map((h) => (
                <li key={h.slice(0, 32)}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <h3 className="mt-12 font-display text-lg font-bold text-primary">
        {`Certificates (${certificates.length})`}
      </h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c) => (
          <article key={c.id} className="rounded-xl border border-edge bg-surface p-4">
            <img
              src={c.thumbnailUrl}
              alt={`${c.title} certificate issued by ${c.issuer}`}
              width={600}
              height={420}
              loading="lazy"
              decoding="async"
              className="mb-3 w-full rounded-lg border border-edge"
            />
            <p className="text-sm font-semibold break-words text-primary">{c.title}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {`${c.issuer} · ${c.issueDate}`}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <li key={s} className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">
                  {s}
                </li>
              ))}
            </ul>
            {c.credentialUrl && (
              <a
                href={c.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-accent"
              >
                Verify credential
              </a>
            )}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
