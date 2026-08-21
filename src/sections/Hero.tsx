import { profile } from '@/data/profile';
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
  const status = profile.openToWork
    ? `${profile.location} — Open to work`
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
                  View projects
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
                >
                  Download CV
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
              // 368x513, and every part of that is measured. The asset was
              // padded into an 800x800 square, so the subject filled 45% of the
              // card's width and read as a small figure in a large frame.
              // Removing the padding was not enough: the source photo carries
              // its own transparent margins, and the subject only spanned 68%
              // of even the unpadded file.
              //
              // Trimmed to the subject it is 368x744, an aspect of 0.495
              // against the card's 0.718 — filling the width at that shape puts
              // the head above the top edge, and the card clips it. So it is
              // cropped to the card's own aspect instead, head to hips, which
              // is the framing that lets the subject reach both edges.
              //
              // These numbers must match the file: the browser reserves a box
              // from them before the image arrives, and a wrong one stretches
              // the portrait into it.
              width={368}
              height={513}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
