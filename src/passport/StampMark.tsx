import { useId } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { initialsOf } from './stamps';

interface StampMarkProps {
  stampId: string;
  label: string;
  earned: boolean;
  /** Just earned: press it down. */
  fresh?: boolean;
  className?: string;
}

/**
 * One stamp. Empty, it is a dashed ring waiting to be filled; earned, it is
 * inked in the accent colour with the section's name around the ring and the
 * owner's initials in the middle. Decorative: the state is said in words beside
 * it, so the whole thing is hidden from assistive technology.
 */
export default function StampMark({
  stampId,
  label,
  earned,
  fresh = false,
  className = 'h-20 w-20',
}: StampMarkProps) {
  const { profile } = useLanguage();
  const ringId = useId();
  const initials = initialsOf(profile.name);
  const word = label.toUpperCase();
  const ring = `${Array(Math.ceil(40 / (word.length + 3))).fill(word).join(' · ')} ·`;

  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      data-stamp={stampId}
      data-earned={earned}
      className={`stamp ${fresh ? 'stamp-new' : ''} ${earned ? 'text-accent' : 'text-muted'} ${className}`}
    >
      <defs>
        <path id={ringId} d="M80,80 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" />
      </defs>
      <circle
        cx="80"
        cy="80"
        r="75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={earned ? undefined : '4 6'}
      />
      {earned && (
        <>
          <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
          <text className="font-mono" fontSize="10.5" fill="currentColor" letterSpacing="1.6">
            <textPath href={`#${ringId}`} textLength="368" lengthAdjust="spacing">
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
        </>
      )}
    </svg>
  );
}
