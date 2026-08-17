import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { education } from '@/data/education';
import { certificates } from '@/data/certificates';
import Chip from '@/motion/Chip';
import Counter from '@/motion/Counter';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one certificate card arriving and the next. */
const STEP = 0.04;

export default function Education() {
  return (
    <SectionShell {...shellProps('education')}>
      {education.map((e) => (
        <Reveal key={e.id}>
          <Surface className="p-6">
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
          </Surface>
        </Reveal>
      ))}

      <h3 className="mt-12 font-display text-lg font-bold text-primary">
        Certificates (<Counter value={certificates.length} />)
      </h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* `fill` because each Reveal is the grid item: without it the cards in
            a row stop matching heights. */}
        {certificates.map((c, index) => (
          <Reveal key={c.id} delay={STEP * index} fill>
            <article className="h-full rounded-xl border border-edge bg-surface p-4">
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
                  <li key={s}>
                    <Chip size="sm">{s}</Chip>
                  </li>
                ))}
              </ul>

              {/* No credential URL means no control at all, not a dead one.
                  Three of the fourteen have none. */}
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
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
