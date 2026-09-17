import { useLanguage } from '@/context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-full border border-edge bg-surface/60 p-0.5 text-xs font-semibold backdrop-blur ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          language === 'en'
            ? 'bg-accent text-void font-bold shadow-sm'
            : 'text-muted hover:text-primary'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          language === 'id'
            ? 'bg-accent text-void font-bold shadow-sm'
            : 'text-muted hover:text-primary'
        }`}
      >
        ID
      </button>
    </div>
  );
}
