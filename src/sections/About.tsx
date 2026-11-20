import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';

const LABEL = 'font-mono text-xs uppercase tracking-[0.14em] text-muted';

/**
 * The published paper, as a credits table: a hairline above and between rows,
 * a label on the left and the credit on the right. The DOI is the only link,
 * so the title stays selectable text a reader can copy into a search. Authors
 * are listed in publication order, first author first; naming only himself on a
 * paper with three co-authors would claim more than the paper says.
 */
function Publication() {
  const { profile, t } = useLanguage();
  const paper = profile.publication;
  if (!paper) return null;

  const row = 'grid gap-1 border-b border-edge py-4 sm:grid-cols-[9rem_1fr] sm:gap-6';

  return (
    <dl className="mt-16 border-t border-edge">
      <div className={row}>
        <dt className={LABEL}>{t.publishedResearch}</dt>
        <dd>
          <p className="text-lg leading-snug font-medium text-primary text-pretty">{paper.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{paper.authors.join(', ')}</p>
        </dd>
      </div>
      <div className={row}>
        <dt className={LABEL}>{t.venue}</dt>
        <dd className="text-sm text-primary">
          {paper.venue}
          <span className="block text-muted">{paper.venueFull}</span>
        </dd>
      </div>
      <div className={row}>
        <dt className={LABEL}>{t.publishedIn}</dt>
        <dd className="text-sm text-primary">{paper.publisher}</dd>
      </div>
      <div className={row}>
        <dt className={LABEL}>DOI</dt>
        <dd>
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center break-all text-sm font-medium text-accent underline underline-offset-4"
          >
            {paper.doi} ↗
          </a>
        </dd>
      </div>
    </dl>
  );
}

export default function About() {
  const { profile, sections } = useLanguage();
  const shell = shellPropsFrom(sections, 'about');
  const [lead, ...rest] = profile.bio;

  return (
    <SectionShell {...shell}>
      <p className="max-w-[40ch] text-2xl leading-snug text-primary text-pretty">{lead}</p>
      <div className="mt-8 space-y-5">
        {rest.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="max-w-[62ch] text-muted text-pretty">
            {paragraph}
          </p>
        ))}
      </div>
      <Publication />
    </SectionShell>
  );
}
