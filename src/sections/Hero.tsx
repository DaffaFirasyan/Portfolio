import { useLanguage } from '@/context/LanguageContext';

/** A plate caption or a credit-row label: small, mono, wide-tracked, never above a heading. */
const LABEL = 'font-mono text-xs uppercase tracking-[0.14em] text-muted';

const PILL =
  'inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-medium text-primary transition-colors hover:border-primary';

/**
 * The letterpress stamp: his name, role and city around a ring, his initials in
 * the middle, pressed half off the corner of the portrait plate. It is the one
 * moment on the page that moves, and it moves once, at load. Everything it says
 * is real text elsewhere, so it is hidden from assistive technology.
 */
function Stamp() {
  const { profile } = useLanguage();
  const ring = [profile.name, profile.roles[1] ?? profile.roles[0], profile.location]
    .join(' · ')
    .toUpperCase();
  const initials = profile.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      className="stamp absolute -bottom-14 -left-3 h-40 w-40 text-accent sm:-left-12 sm:h-48 sm:w-48"
    >
      <defs>
        <path id="stamp-ring" d="M80,80 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" />
      </defs>
      {/* A paper disc behind the ink, like a seal stamped on a label, so the ring
          text stays legible where it crosses the dark shirt. */}
      <circle cx="80" cy="80" r="75" className="fill-void/90" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
      <text className="font-mono" fontSize="10.5" fill="currentColor" letterSpacing="1.6">
        <textPath href="#stamp-ring" textLength="368" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <text
        x="80"
        y="91"
        textAnchor="middle"
        fontSize="32"
        fontWeight="500"
        letterSpacing="-1"
        fill="currentColor"
      >
        {initials}
      </text>
    </svg>
  );
}

/**
 * The title page. His name is set as large as the page sets anything, in the
 * one grotesque at its regular weight, with a credits row under it. On the
 * right is the plate: a hairline frame with a crosshair on each corner, the
 * portrait inside on a faint tint, and the stamp half off its lower-left corner.
 *
 * The h1 is the name and the only h1 on the page.
 */
export default function Hero() {
  const { profile, t } = useLanguage();
  const status = profile.openToWork ? t.openToWork : t.notLooking;

  return (
    <section id="home" className="scroll-mt-14 px-6 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28">
      <div className="mx-auto grid w-full max-w-[1120px] gap-x-10 gap-y-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1
            aria-label={profile.name}
            className="font-display text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.92] font-normal tracking-[-0.045em] text-primary"
          >
            {profile.name.split(' ').map((word) => (
              <span key={word}>
                <span className="block">{word}</span>{' '}
              </span>
            ))}
          </h1>

          <p className="mt-10 text-xl text-primary md:text-2xl">
            {profile.roles.slice(0, 2).join(' · ')}
          </p>
          <p className="mt-4 max-w-[40ch] text-lg text-muted text-pretty">{profile.tagline}</p>

          <dl className="mt-12 grid max-w-[34rem] grid-cols-2 border-t border-edge">
            <div className="border-b border-edge py-4 pr-6">
              <dt className={LABEL}>{t.location}</dt>
              <dd className="mt-1.5 text-primary">{profile.location}</dd>
            </div>
            <div className="border-b border-l border-edge py-4 pl-6">
              <dt className={LABEL}>{t.status}</dt>
              <dd className="mt-1.5 text-primary">{status}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
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

        <div className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[24rem] lg:mx-0 lg:ml-auto">
            <div className="plate bg-surface">
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
                sizes="(min-width: 1024px) 384px, min(24rem, calc(100vw - 3rem))"
                src={profile.avatarUrl}
                alt={`${profile.name} avatar`}
                width={240}
                height={320}
                decoding="async"
                fetchPriority="high"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            <Stamp />
          </div>
        </div>
      </div>
    </section>
  );
}
