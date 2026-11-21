import { useLanguage } from '@/context/LanguageContext';
import { useView } from '@/map/ViewProvider';
import { usePassport } from '@/passport/PassportProvider';
import { useStampOnRead } from '@/passport/useStampOnRead';
import PassportPage from './PassportPage';

const PILL =
  'inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-medium text-primary transition-colors hover:border-primary';

/**
 * Reading mode: the first page of the passport, his name as large as the page
 * sets anything, then the data page and the actions. Map mode: only the title
 * block, laid over the sky as the overview, with the hint; the data page moves
 * to the top of the About panel.
 *
 * The h1 is the name and the only h1 on the page.
 */
export default function Hero() {
  const { profile, t } = useLanguage();
  const { earn } = usePassport();
  const { mode, region } = useView();
  const ref = useStampOnRead<HTMLElement>('home');
  const map = mode === 'map';

  const name = (
    <h1
      aria-label={profile.name}
      className={`font-display leading-[0.95] font-normal tracking-[-0.03em] text-primary ${
        map ? 'text-[clamp(2.75rem,8vw,6rem)]' : 'text-[clamp(3.25rem,10vw,8rem)]'
      }`}
    >
      {profile.name.split(' ').map((word) => (
        <span key={word}>
          <span className="block">{word}</span>{' '}
        </span>
      ))}
    </h1>
  );

  const actions = (
    <>
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
    </>
  );

  if (map) {
    return (
      <section
        ref={ref}
        id="home"
        hidden={region !== null}
        className="pointer-events-none fixed inset-x-0 top-14 z-10 px-6 pt-6 md:px-10 lg:pt-14"
      >
        <div className="mx-auto w-full max-w-[1120px]">
          {name}
          <p className="mt-5 text-lg text-primary md:text-2xl">{profile.roles.slice(0, 2).join(' · ')}</p>
          <p className="mt-3 hidden max-w-[40ch] text-lg text-muted text-pretty md:block">
            {profile.tagline}
          </p>
          {/* Only the buttons take the pointer; the empty part of the row must let a drag through to the sky. */}
          <div className="pointer-events-none mt-6 hidden flex-wrap items-center gap-x-3 gap-y-3 md:flex [&>a]:pointer-events-auto">
            {actions}
          </div>
          <p className="mt-6 font-mono text-xs tracking-[0.14em] text-muted uppercase">{t.mapHint}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="home"
      className="scroll-mt-14 px-6 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1120px]">
        {name}

        <p className="mt-8 text-xl text-primary md:text-2xl">{profile.roles.slice(0, 2).join(' · ')}</p>
        <p className="mt-3 max-w-[40ch] text-lg text-muted text-pretty">{profile.tagline}</p>

        <div className="mt-14">
          <PassportPage />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">{actions}</div>
      </div>
    </section>
  );
}
