import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';
import WorkSearch from '@/components/ui/WorkSearch';
import Sparks from '@/motion/Sparks';
import Typed from '@/motion/Typed';

/**
 * Public by design — a Web3Forms access key identifies a form, not an account,
 * and the service expects it in client-side code. Absent, the form resolves to
 * its error state, which is where the mailto: fallback already lives.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

export default function Contact() {
  return (
    <SectionShell {...shellProps('contact')}>
      {/* No `fill` on either Reveal. They are grid items, but each holds a
          column of stacked content rather than a card that must match a
          sibling's height, and h-full on stacked Reveals is what broke the
          hero in the motion plan. */}
      <Sparks>
        <div className="grid gap-12 lg:grid-cols-2">
          {/* `fill` here, where the note above says neither Reveal takes it.
              That note held while both columns were plain stacks of content;
              this one now anchors the robot to its own bottom edge, which
              needs the column to actually reach the row's full height rather
              than stopping at its text. It is the case the prop documents — a
              grid item whose child must match its sibling. */}
          <Reveal fill>
            <div className="relative flex h-full flex-col">
              <Typed
                text="The fastest way to reach me is email. I read everything and reply to anything specific."
                className="max-w-[48ch] text-muted"
              />

              <p className="mt-3 max-w-[48ch] text-muted">
                If you would rather not use the form, the address is right here.
              </p>

              <a
                href={`mailto:${profile.email}`}
                className="mt-6 inline-block font-display text-2xl font-bold break-words text-accent"
              >
                {profile.email}
              </a>

              <ul aria-label="Social links" className="mt-8 flex flex-wrap gap-4">
                {profile.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-edge px-4 text-sm text-muted"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>


              {/* This slot held the orb, and before that the Spline robot. The
                  two could not share the column: measured with the entrance
                  transforms settled, the social links end 15px above where the
                  orb began. In the last section of a nine-screen page, a reader
                  who is still here is deciding whether to write — so the space
                  goes to something that helps them decide rather than to a
                  glow. `OrbMark` is still in the tree and is one import from
                  coming back.

                  In flow, unlike the orb: this one has to be reachable, and an
                  absolutely positioned control at `pointer-events-none` is
                  neither. It grows the column, which is why it sits below the
                  links rather than above them — the email address is what most
                  people came to this section for and it stays where it was. */}
              <WorkSearch />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ContactForm accessKey={ACCESS_KEY} />
          </Reveal>
        </div>
      </Sparks>
    </SectionShell>
  );
}
