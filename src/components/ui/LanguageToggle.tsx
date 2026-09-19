import { useLanguage } from '@/context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

function FlagUk({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`h-4 w-4 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-white/20 ${className}`}
      aria-hidden="true"
    >
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#ffffff" strokeWidth="5.5" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="3" />
      <path d="M16 0 V32 M0 16 H32" stroke="#ffffff" strokeWidth="9" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="5.5" />
    </svg>
  );
}

function FlagId({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`h-4 w-4 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-white/25 ${className}`}
      aria-hidden="true"
    >
      <rect width="32" height="16" fill="#E70011" />
      <rect y="16" width="32" height="16" fill="#FFFFFF" />
    </svg>
  );
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 rounded-full border border-edge bg-surface/80 p-1 text-xs font-semibold shadow-inner backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        title="English"
        className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 active:scale-95 ${
          language === 'en'
            ? 'bg-accent font-bold text-void shadow-sm shadow-accent/25'
            : 'text-muted hover:bg-white/5 hover:text-primary'
        }`}
      >
        <FlagUk className="transition-transform duration-200 group-hover:scale-115 group-hover:rotate-3" />
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
        title="Bahasa Indonesia"
        className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 active:scale-95 ${
          language === 'id'
            ? 'bg-accent font-bold text-void shadow-sm shadow-accent/25'
            : 'text-muted hover:bg-white/5 hover:text-primary'
        }`}
      >
        <FlagId className="transition-transform duration-200 group-hover:scale-115 group-hover:rotate-3" />
        <span>ID</span>
      </button>
    </div>
  );
}
