import { useLanguage } from '@/context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const BUTTON = 'inline-flex min-h-8 items-center px-1 text-sm transition-colors';

/**
 * EN / ID as two words in whatever colour the surrounding surface uses. The
 * active one is underlined and full strength, the other at 70%: state is carried by weight and a rule, never
 * by colour alone, and nothing here glows, tilts or casts a shadow.
 */
export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        title="English"
        className={`${BUTTON} ${
          language === 'en'
            ? 'font-semibold underline underline-offset-4'
            : 'opacity-70 hover:opacity-100'
        }`}
      >
        EN
      </button>
      <span aria-hidden="true" className="opacity-40">
        /
      </span>
      <button
        type="button"
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
        title="Bahasa Indonesia"
        className={`${BUTTON} ${
          language === 'id'
            ? 'font-semibold underline underline-offset-4'
            : 'opacity-70 hover:opacity-100'
        }`}
      >
        ID
      </button>
    </div>
  );
}
