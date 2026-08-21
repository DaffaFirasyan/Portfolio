import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';
import Surface from '@/motion/Surface';

/** Seconds between one bio paragraph arriving and the next. */
const STEP = 0.08;

export default function About() {
  return (
    <SectionShell {...shellProps('about')}>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            {/* 320x446, which is what the file actually is. It said 800x800
                until 2026-08-22 — a square reservation for a 0.717 portrait,
                so the browser held the wrong box until the image arrived and
                then reflowed this column. Nothing failed and nothing looked
                obviously wrong, which is why it survived a CLS pass that took
                the desktop score from 0.245; the numbers here simply never
                matched the asset the crop script writes.

                This is also the same file the hero's ProfileCard renders, and
                the owner has called that redundant. If this image is replaced,
                these two numbers go with it. */}
            <img
              src={profile.avatarUrl}
              alt={`${profile.name}, portrait`}
              width={320}
              height={446}
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border border-edge"
            />
          </Reveal>
        </div>

        <div className="md:col-span-7">
          {/* One Reveal per paragraph, not per word. Splitting prose would put
              roughly two hundred elements and two hundred scroll triggers on
              this column, which is the trade the design explicitly refuses. */}
          {profile.bio.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 32)} delay={STEP * index}>
              <p className="mb-4 max-w-[68ch] text-muted">{paragraph}</p>
            </Reveal>
          ))}

          <Reveal delay={STEP * profile.bio.length}>
            {/* The dl stays inside Surface rather than being replaced by it.
                Surface renders a div, and dt/dd outside a dl is invalid markup
                that also costs the description-list semantics. */}
            <Surface className="mt-8 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    Location
                  </dt>
                  <dd className="mt-1 text-primary">{profile.location}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    Status
                  </dt>
                  <dd className="mt-1 text-primary">
                    {profile.openToWork ? 'Open to work' : 'Not looking right now'}
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
