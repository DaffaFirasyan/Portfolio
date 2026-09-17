import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/context/LanguageContext';
import LanguageToggle from './LanguageToggle';

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders language toggle buttons', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    expect(screen.getByRole('group', { name: /language selection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ID' })).toBeInTheDocument();
  });

  it('shows English as active by default', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'ID' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates active state on button click', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'ID' }));

    expect(screen.getByRole('button', { name: 'ID' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });
});
