import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';
import OrbMark from '@/motion/OrbMark';
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

              {/* Absolutely positioned, and that is the whole point: in normal
                  flow the robot was the tallest thing in this column and set
                  the section's height itself, running roughly 300px past the
                  Send button for no reason a reader could name. Out of flow it
                  contributes nothing, so the section ends where the form ends
                  and the robot fills the space that was already there.

                  `-bottom-32` against `SectionShell`'s `py-32` puts its base on
                  the footer border, and `overflow-hidden` cuts anything past
                  that line instead of pushing into the footer — which is what
                  makes standing it on the border safe: its feet may be clipped.
                  Only the lg variant is needed since the whole thing is lg-only,
                  and `md:py-32` is already in force by then.

                  lg and up only, as the rotating badge was. Below that it would
                  sit between the social links and the form, pushing the thing
                  people came to use further down a screen that is already tall
                  — and it is 1.4 MB, which is the last thing to put in front of
                  a phone. The `hidden` here and the `hover` gate inside the
                  component overlap on purpose: this one keeps it out of the
                  layout, that one keeps it off the network. */}
              {/* 25rem is the largest this can be before it reaches the social
                  links: measured with the entrance transforms settled, the gap
                  between them and the footer line is 415px, and this is 400px.
                  pointer-events-none because it is absolutely positioned across
                  the column and must never intercept a click meant for the
                  links or the address above it — the orb does not need real
                  pointer events, since it reads the window and normalises
                  against its own rect. */}
              <div className="pointer-events-none absolute inset-x-0 -bottom-32 hidden h-[25rem] overflow-hidden lg:block">
                <OrbMark />
              </div>
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
