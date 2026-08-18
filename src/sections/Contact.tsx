import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';
import SplineRobot from '@/motion/SplineRobot';
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
          <Reveal>
            <div>
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

              {/* lg and up only, as the rotating badge was. Below that it would
                  sit between the social links and the form, pushing the thing
                  people came to use further down a screen that is already tall
                  — and it is 1.4 MB, which is the last thing to put in front of
                  a phone. The `hidden` here and the `hover` gate inside the
                  component overlap on purpose: this one keeps it out of the
                  layout, that one keeps it off the network.

                  Full column width. It was capped at 26rem inside a column
                  wider than that, which is what made it read as an object
                  floating in the space rather than part of the page. */}
              <div className="mt-10 hidden lg:block">
                <SplineRobot />
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
