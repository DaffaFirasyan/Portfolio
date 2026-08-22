import SectionShell from '@/components/layout/SectionShell';
import ContactForm from '@/components/ui/ContactForm';
import { shellProps } from '@/data/sections';
import { profile } from '@/data/profile';
import Reveal from '@/motion/Reveal';
import GlobeMark from '@/motion/GlobeMark';
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


              {/* The globe, in the slot the orb and the Spline robot held before it. The search that briefly replaced it is a
                  floating widget now — the two were only ever competing for
                  this column because both were in it.

                  Absolutely positioned, which is the whole point: in flow the
                  robot that preceded the orb was the tallest thing here and set
                  the section's height itself. Out of flow it contributes
                  nothing, so the section ends where the form ends.

                  `-bottom-32` against `SectionShell`'s `py-32` puts its base on
                  the footer border, and `overflow-hidden` cuts anything past
                  that line instead of pushing into the footer.

                  lg and up only. Below that it would sit between the social
                  links and the form, pushing the thing people came to use
                  further down a screen that is already tall. The `hidden` here
                  and the capability gate inside the component overlap on
                  purpose: this one keeps it out of the layout, that one keeps
                  it off the network.

                  `pointer-events-none` used to sit here and had to come off.
                  The robot and the orb both read the *window* and normalised
                  against their own rect, so neither needed this box to be
                  hittable. The globe does: it listens on its own canvas for
                  mousedown and mousemove, so with pointer events disabled on
                  an ancestor it could not be dragged at all. The canvas already
                  carried `cursor: grab` — nothing ever reached it.

                  Measured before removing it, since an absolutely positioned
                  box could easily be swallowing clicks: it starts 15px *below*
                  the social links so it covers none of them, and the only
                  thing it overlaps is 40px of footer, which has no links, no
                  buttons and nothing focusable — just the credit marquee.
                  Zoom is off, so the wheel handler returns before
                  `preventDefault` and the page still scrolls over it. */}
              <div className="absolute inset-x-0 -bottom-32 hidden h-[25rem] overflow-hidden lg:block">
                <GlobeMark />
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
