import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { LanguageProvider } from '@/context/LanguageContext';
import Contact from '@/sections/Contact';
import { PassportProvider, usePassport } from './PassportProvider';

function List() {
  const { stamps } = usePassport();
  return <p data-testid="list">{stamps.join(',')}</p>;
}

const tree = (ui: ReactNode) =>
  render(
    <LanguageProvider>
      <PassportProvider>
        {ui}
        <List />
      </PassportProvider>
    </LanguageProvider>,
  );

beforeEach(() => localStorage.clear());

describe('secret stamps', () => {
  it('stamps "language" only when the language actually changes', async () => {
    const user = userEvent.setup();
    tree(<LanguageToggle />);

    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByTestId('list').textContent).toBe('');

    await user.click(screen.getByRole('button', { name: 'ID' }));
    expect(screen.getByTestId('list').textContent).toBe('language');
  });

  it('stamps "reach" when the email address is copied', async () => {
    const user = userEvent.setup();
    tree(<Contact />);

    await user.click(screen.getByRole('button', { name: /copy email/i }));
    await waitFor(() => expect(screen.getByTestId('list').textContent).toBe('reach'));
  });
});
