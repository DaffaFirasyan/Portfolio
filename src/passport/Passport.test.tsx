import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/context/LanguageContext';
import Passport from './Passport';
import { PassportProvider, usePassport } from './PassportProvider';
import { SECTION_STAMPS, SOUND_KEY, STORAGE_KEY } from './stamps';

function Earner() {
  const { earn } = usePassport();
  return <button onClick={() => earn('about')}>earn about</button>;
}

const tree = (
  <LanguageProvider>
    <PassportProvider>
      <Earner />
      <Passport />
    </PassportProvider>
  </LanguageProvider>
);

beforeEach(() => localStorage.clear());

describe('Passport', () => {
  it('shows the count on a corner chip', () => {
    render(tree);
    expect(screen.getByRole('button', { name: /passport 0\/10/i })).toBeInTheDocument();
  });

  it('opens a sheet with ten stamps and closes it again', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport 0\/10/i }));

    const sheet = screen.getByRole('dialog', { name: 'Passport' });
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(10);
    expect(within(sheet).getAllByText('Secret stamp')).toHaveLength(3);

    await user.click(within(sheet).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'Passport' })).not.toBeInTheDocument();
  });

  it('announces a stamp when it is earned', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByText('earn about'));
    expect(screen.getByRole('status')).toHaveTextContent('Stamp earned: About');
    expect(screen.getByRole('button', { name: /passport 1\/10/i })).toBeInTheDocument();
  });

  it('keeps the closing note back until every section is stamped', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport/i }));
    expect(screen.queryByText('You read all of it.')).not.toBeInTheDocument();
  });

  it('shows the closing note and a way to write once every section is stamped', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...SECTION_STAMPS]));
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport 7\/10/i }));
    expect(screen.getByText('You read all of it.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/),
    );
  });

  it('turns sound on only when asked, and remembers it', async () => {
    const user = userEvent.setup();
    render(tree);
    await user.click(screen.getByRole('button', { name: /passport/i }));
    const toggle = screen.getByRole('checkbox', { name: 'Sound' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(localStorage.getItem(SOUND_KEY)).toBe('true');
  });
});
