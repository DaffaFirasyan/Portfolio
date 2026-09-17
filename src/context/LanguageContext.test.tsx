import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from './LanguageContext';

function TestConsumer() {
  const { language, setLanguage, profile, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="open-to-work">{t.openToWork}</span>
      <span data-testid="headline">{profile.tagline}</span>
      <button type="button" onClick={() => setLanguage('id')}>
        Switch ID
      </button>
      <button type="button" onClick={() => setLanguage('en')}>
        Switch EN
      </button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('defaults to English when localStorage is empty', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('open-to-work')).toHaveTextContent('Open to work');
    expect(document.documentElement.lang).toBe('en');
  });

  it('initializes from localStorage if valid language is stored', () => {
    localStorage.setItem('daffa_portfolio_lang', 'id');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('id');
    expect(screen.getByTestId('open-to-work')).toHaveTextContent('Terbuka untuk kerja');
    expect(document.documentElement.lang).toBe('id');
  });

  it('switches language and persists to localStorage and document.documentElement', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Switch ID' }));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('id');
    expect(screen.getByTestId('open-to-work')).toHaveTextContent('Terbuka untuk kerja');
    expect(localStorage.getItem('daffa_portfolio_lang')).toBe('id');
    expect(document.documentElement.lang).toBe('id');

    await user.click(screen.getByRole('button', { name: 'Switch EN' }));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('open-to-work')).toHaveTextContent('Open to work');
    expect(localStorage.getItem('daffa_portfolio_lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('provides safe fallback when used without a provider', () => {
    render(<TestConsumer />);

    // Should gracefully fall back to en without throwing
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('open-to-work')).toHaveTextContent('Open to work');
  });
});
