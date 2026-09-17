import { useLanguage } from '@/context/LanguageContext';
import Backdrop from '@/motion/Backdrop';
import BlurIn from '@/motion/BlurIn';
import Counter from '@/motion/Counter';
import Grain from '@/motion/Grain';
import Heading from '@/motion/Heading';
import Reveal from '@/motion/Reveal';
import RotatingRole from '@/motion/RotatingRole';
import Shine from '@/motion/Shine';
import AvatarCard from '@/motion/AvatarCard';

/**
 * Entrance timing: 80ms between elements, so the eye is led down the column
 * rather than everything arriving at once. Six steps at 80ms plus a 600ms
 * animation lands the last item around 1.0s, inside the 1.2s the design allows.
 */
const STEP = 0.08;

export default function Hero() {
  const { profile, t } = useLanguage();
  const status = profile.openToWork
    ? `${profile.location} — ${t.openToWork}`
    : profile.location;

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center py-24">
      <Backdrop />
      <Grain />

      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal delay={STEP * 0}>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {profile.openToWork ? <Shine text={status} /> : status}
              </p>
            </Reveal>

            {/* break-words because profile.name is the one rendered string with no
                LIMITS entry — you cannot cap a person's name — and it sits in the
                largest type on the page. At 320px a single token beyond ~11
                characters would otherwise overflow the viewport. */}
            <Heading
              level={1}
              className="mt-4 font-display text-display-sm font-extrabold leading-none tracking-[-0.02em] break-words text-primary md:text-display"
            >
              {profile.name}
            </Heading>

            <Reveal delay={STEP * 2}>
              <p className="mt-4 text-xl font-semibold text-accent-2">
                <RotatingRole roles={profile.roles} />
              </p>
            </Reveal>

            <Reveal delay={STEP * 3}>
              <BlurIn text={profile.tagline} className="mt-4 max-w-[52ch] text-muted" />
            </Reveal>

            <Reveal delay={STEP * 4}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-void"
                >
                  {t.viewProjects}
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
                >
                  {t.downloadCv}
                </a>
              </div>
            </Reveal>

            <Reveal delay={STEP * 5}>
              <dl className="mt-10 flex flex-wrap gap-8">
                {profile.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-bold text-primary">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <AvatarCard
              src={profile.avatarUrl}
              name={profile.name}
              // The framing of this portrait is no longer decided here, and the
              // long note that used to sit in this spot — head widths, crop
              // ratios, where the transparent padding went — described a
              // generated crop that is not what ships. The owner supplies the
              // file himself as of 2026-08-22 and asked that it not be
              // regenerated; `scripts/crop-avatar.mjs` refuses to run without
              // `--force` for that reason.
              //
              // These two numbers exist to carry the file's aspect ratio, which
              // is what the browser reserves a box from before the image
              // arrives. They must therefore track whatever is actually in
              // `public/profile/avatar.webp`, and on 2026-08-22 they stopped:
              // the owner replaced the portrait with one at 2000x2666, ratio
              // 0.750, while this still said 320x446, ratio 0.717. The image
              // rendered at its own ratio regardless, so nothing looked broken
              // — the reservation was simply the wrong shape and the column
              // shifted when the portrait loaded.
              //
              // That is the second time a stale pair of these has shipped
              // (About had 800x800 for the same 0.717 file), so it is no longer
              // left to care: hero-avatar.test.ts reads the file and fails if
              // this ratio disagrees with it.
              width={320}
              height={427}
              // max-w-[26rem], not the max-w-xs this carried under ProfileCard.
              // That component rendered the portrait at the card's full 388px;
              // the Comet card adds a 12px frame either side, so at 320px the
              // person came out 294px wide — noticeably smaller than the size
              // the owner settled after several rounds of tuning. 416px puts
              // the portrait back to ~390px, which is where it was.
              className="w-full max-w-[26rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
