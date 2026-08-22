import SectionShell from '@/components/layout/SectionShell';
import { shellProps } from '@/data/sections';
import { EXPERIENCE_TYPE_LABEL, experiences } from '@/data/experiences';
import Chip from '@/motion/Chip';
import PulseDot from '@/motion/PulseDot';
import Reveal from '@/motion/Reveal';

/** Seconds between one entry arriving and the next. */
const STEP = 0.06;

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  const name = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${name} ${year}`;
}

function Body({ entry, current }: { entry: (typeof experiences)[number]; current: boolean }) {
  const content = (
    <>
      <h3 className="font-display text-lg font-bold break-words text-primary">{entry.role}</h3>

      <p className="mt-1">
        <span className="text-accent-2">{entry.organization}</span>
        <span className="ml-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {EXPERIENCE_TYPE_LABEL[entry.type]}
        </span>
      </p>

      <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
        {`${formatMonth(entry.startDate)} — ${current ? 'Present' : formatMonth(entry.endDate)}`}
      </p>

      <p className="mt-3 max-w-[68ch] text-muted">{entry.summary}</p>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
        {entry.highlights.map((h) => (
          <li key={h.slice(0, 32)}>{h}</li>
        ))}
      </ul>

      {entry.stack && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {entry.stack.map((s) => (
            <li key={s}>
              <Chip size="sm">{s}</Chip>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!current) return content;

  // Quiet on purpose. A tinted border and a lifted background are enough to say
  // "read this one first"; the only thing that moves is the dot beside the
  // year, which is peripheral rather than drawn around the text.
  return <div className="rounded-xl border border-accent-2/30 bg-elevated/50 p-5">{content}</div>;
}

export default function Experience() {
  return (
    <SectionShell {...shellProps('experience')}>
      {/* No rule and no dots down the left. With the entries in reverse order
          the sequence is already obvious from the dates, so the rule spent
          horizontal space restating it — and a ruled timeline is the layout
          almost every portfolio template ships.

          The year leads instead. It gives the section a rhythm the rest of the
          page does not have: every other section opens with prose, this one
          opens with a number.

          Losing the rule also retires the containing-block trap. The dots had
          to sit outside their Reveal because AnimatedContent transforms its
          wrapper, and a transformed ancestor becomes the containing block for
          absolutely positioned descendants. Nothing here is positioned against
          the section any more. */}
      <ol className="space-y-12">
        {experiences.map((e, index) => {
          const current = e.endDate === 'present';

          return (
            <li key={e.id} className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-8">
              {/* At md and up this sits in the margin; below it stacks above the
                  role, because a phone has no margin to put a number in. */}
              {/* items-start, not items-center: the grid cell stretches to the
                  height of the whole entry, so centring floated the year to the
                  middle of a tall block instead of beside the role it labels.

                  Left-aligned, and the column is 10rem rather than 7rem. Both
                  were measured: at 1280 the year renders 120–123px wide inside
                  a 112px column, so it did not fit, and `justify-end` sent the
                  overflow leftwards — every year hung past the section's left
                  edge, 29px left of the heading it sits under. Worse, the pulse
                  dot shares this flex row, so on the current entry it claimed
                  18px of the right side (10px dot plus a gap-2) and pushed that
                  year 19px further left again than its neighbours. Aligning
                  left removes both at once: the dot now grows rightwards into
                  space the column has, and cannot move the number. */}
              <div className="flex items-start gap-2">
                <p
                  // Past years were `text-edge`, which measures 1.39:1 against
                  // the page — a 48px extrabold numeral almost invisible, and
                  // unlike the footer marquee this is information rather than
                  // decoration: it is the only date on the row until you read
                  // the small print. muted/70 is 3.73:1, over the 3:1 AA asks
                  // of large text, while staying obviously quieter than the
                  // accent the current role gets.
                  className={`font-display text-3xl font-extrabold leading-none md:text-display-sm ${
                    current ? 'text-accent' : 'text-muted/70'
                  }`}
                >
                  {e.startDate.slice(0, 4)}
                </p>
                {current && <PulseDot active className="relative shrink-0" />}
              </div>

              <Reveal delay={STEP * index}>
                <Body entry={e} current={current} />
              </Reveal>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
