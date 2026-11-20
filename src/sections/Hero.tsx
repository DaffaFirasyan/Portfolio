import { useLanguage } from '@/context/LanguageContext';
import { usePassport } from '@/passport/PassportProvider';
import StampMark from '@/passport/StampMark';
import { stampName } from '@/passport/stampName';
import { useStampOnRead } from '@/passport/useStampOnRead';

/** A credit-row label: small, mono, wide-tracked, never above a heading. */
const LABEL = 'font-mono text-xs uppercase tracking-[0.14em] text-muted';

const PILL =
  'inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-medium text-primary transition-colors hover:border-primary';

/**
 * The first page of the passport. His name is set as large as the page sets
 * anything, in the serif. Under it is the data page: the portrait in the photo
 * slot, where he is and whether he is open to work, the empty stamp for arrival,
 * and a machine-readable line along the bottom, as a passport has.
 *
 * The h1 is the name and the only h1 on the page.
 */
export default function Hero() {
  const { profile, t, sections } = useLanguage();
  const { earn, has, justEarned } = usePassport();
  const ref = useStampOnRead<HTMLElement>('home');
  const status = profile.openToWork ? t.openToWork : t.notLooking;
  const home = stampName('home', sections, t);
  const machineLine = `P<${profile.name.toUpperCase().replace(/\s+/g, '<<')}`.padEnd(40, '<');

  return (
    <section
      ref={ref}
      id="home"
      className="scroll-mt-14 px-6 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1120px]">
        <h1
          aria-label={profile.name}
          className="font-display text-[clamp(3.25rem,10vw,8rem)] leading-[0.95] font-normal tracking-[-0.03em] text-primary"
        >
          {profile.name.split(' ').map((word) => (
            <span key={word}>
              <span className="block">{word}</span>{' '}
            </span>
          ))}
        </h1>

        <p className="mt-8 text-xl text-primary md:text-2xl">
          {profile.roles.slice(0, 2).join(' · ')}
        </p>
        <p className="mt-3 max-w-[40ch] text-lg text-muted text-pretty">{profile.tagline}</p>

        <div className="plate mt-14 max-w-[46rem] bg-surface/70">
          <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-[14rem_1fr] md:p-8">
            {/* srcSet and sizes come before src on purpose: React applies props in
                order, and a src applied first starts a fetch of the 2000px original
                before the browser has seen the smaller candidates.

                Width and height carry the file's aspect ratio (0.750), which is
                what the browser reserves a box from before the image arrives.
                hero-avatar.test.ts reads public/profile/avatar.webp and fails if
                these drift, which has shipped silently twice. The portrait is
                the owner's own file and is not to be regenerated. */}
            <img
              srcSet={profile.avatarSrcSet}
              sizes="224px"
              src={profile.avatarUrl}
              alt={`${profile.name} avatar`}
              width={240}
              height={320}
              decoding="async"
              fetchPriority="high"
              className="mx-auto aspect-[3/4] w-56 object-cover sm:mx-0"
            />

            <div className="flex flex-col justify-between gap-8">
              <dl className="border-t border-edge">
                <div className="border-b border-edge py-3">
                  <dt className={LABEL}>{t.location}</dt>
                  <dd className="mt-1 text-primary">{profile.location}</dd>
                </div>
                <div className="border-b border-edge py-3">
                  <dt className={LABEL}>{t.status}</dt>
                  <dd className="mt-1 text-primary">{status}</dd>
                </div>
              </dl>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className={LABEL}>{t.arrival}</p>
                  <p className="mt-1 text-sm text-muted">{has('home') ? t.stamped : t.notStamped}</p>
                </div>
                <StampMark
                  stampId="home"
                  label={home}
                  earned={has('home')}
                  fresh={justEarned === 'home'}
                  className="h-20 w-20"
                />
              </div>
            </div>
          </div>

          <p
            aria-hidden="true"
            className="overflow-hidden border-t border-edge px-6 py-3 font-mono text-xs whitespace-nowrap text-muted md:px-8"
          >
            {machineLine}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => earn('reach')}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            {t.downloadCv} ↗
          </a>
          <a href={`mailto:${profile.email}`} className={PILL}>
            {t.emailMe}
          </a>
          <a href="#projects" className={PILL}>
            {t.viewProjects}
          </a>
        </div>
      </div>
    </section>
  );
}
