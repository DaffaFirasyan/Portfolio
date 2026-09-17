import SectionShell from '@/components/layout/SectionShell';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one bio paragraph arriving and the next. */
const STEP = 0.08;

/**
 * The published paper, as a credential rather than a picture.
 *
 * This column held a second copy of the hero portrait — the same
 * `/profile/avatar.webp`, twice on one page — which the owner called redundant
 * and which was. What replaced it had to be something no other section already
 * leads with: a skills panel would duplicate Skills directly below it, a
 * timeline would duplicate Experience, and a different photo is another asset
 * to source. The IEEE paper was the one hard credential on this page appearing
 * nowhere prominent — a single bullet inside an Education highlight.
 *
 * The whole card is not a link. The DOI is, and it is the only interactive
 * thing here, so the title stays selectable text a reader can copy into a
 * search. A card-sized link would also announce its entire contents as one
 * label.
 *
 * `rel="noopener noreferrer"` and `target="_blank"` match every other external
 * link in the project.
 */
function PublicationCard() {
  const { profile, t } = useLanguage();
  const paper = profile.publication;
  if (!paper) return null;

  return (
    <Surface className="p-6">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
        {t.publishedResearch}
      </p>

      {/* h3, not h2: the section heading is the h2 and this sits under it. */}
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-primary">
        {paper.title}
      </h3>

      {/* Publication order, first author first. Naming only himself on a paper
          with three co-authors would claim more than the paper says. */}
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {paper.authors.join(', ')}
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{t.venue}</dt>
          <dd className="mt-0.5 text-primary">
            {paper.venue}
            <span className="block text-xs text-muted">{paper.venueFull}</span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{t.publishedIn}</dt>
          <dd className="mt-0.5 text-primary">{paper.publisher}</dd>
        </div>
      </dl>

      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center break-all text-sm font-semibold text-accent"
      >
        {/* The DOI itself, not "Read the paper". It is the citable identifier,
            so showing it lets a reader copy it without following the link —
            and it says what the destination is before they click. */}
        {paper.doi} →
      </a>
    </Surface>
  );
}

export default function About() {
  const { profile, sections, t } = useLanguage();
  const shell = shellPropsFrom(sections, 'about');

  return (
    <SectionShell {...shell}>
      <div className="grid gap-10 md:grid-cols-12">
        {/* Prose first in the DOM so a phone reads the bio before the
            credentials, and second visually on desktop through `md:order-2`.
            The rail carries exactly one focusable element, the DOI, so the
            visual/DOM order split costs nothing in tab order — which is the
            only reason it is acceptable here at all. */}
        <div className="md:col-span-7 md:order-2">
          {/* One Reveal per paragraph, not per word. Splitting prose would put
              roughly two hundred elements and two hundred scroll triggers on
              this column, which is the trade the design explicitly refuses. */}
          {profile.bio.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 32)} delay={STEP * index}>
              <p className="mb-4 max-w-[68ch] text-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <div className="space-y-6 md:col-span-5 md:order-1">
          <Reveal>
            <PublicationCard />
          </Reveal>

          <Reveal delay={STEP}>
            {/* The dl stays inside Surface rather than being replaced by it.
                Surface renders a div, and dt/dd outside a dl is invalid markup
                that also costs the description-list semantics.

                Moved here from below the bio when the paper took this column:
                two cards hold the rail against three paragraphs of prose,
                where one left it visibly short. */}
            <Surface className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {t.location}
                  </dt>
                  <dd className="mt-1 text-primary">{profile.location}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {t.status}
                  </dt>
                  <dd className="mt-1 text-primary">
                    {profile.openToWork ? t.openToWork : t.notLooking}
                  </dd>
                </div>
              </dl>
            </Surface>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
