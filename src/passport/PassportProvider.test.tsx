import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassportProvider, usePassport } from './PassportProvider';
import { SOUND_KEY, STORAGE_KEY } from './stamps';
import { playStamp } from './sound';

vi.mock('./sound', () => ({ playStamp: vi.fn(), prepareSound: vi.fn() }));

function Probe() {
  const { stamps, earn, has, justEarned, soundOn, setSoundOn } = usePassport();
  return (
    <>
      <p data-testid="list">{stamps.join(',')}</p>
      <p data-testid="fresh">{justEarned ?? ''}</p>
      <p data-testid="has">{String(has('about'))}</p>
      <p data-testid="sound">{String(soundOn)}</p>
      <button onClick={() => earn('about')}>about</button>
      <button onClick={() => earn('comet')}>comet</button>
      <button onClick={() => setSoundOn(true)}>sound</button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('PassportProvider', () => {
  it('records a stamp once', async () => {
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'about' }));
    await user.click(screen.getByRole('button', { name: 'about' }));
    expect(screen.getByTestId('list').textContent).toBe('about');
    expect(screen.getByTestId('has').textContent).toBe('true');
    expect(screen.getByTestId('fresh').textContent).toBe('about');
  });

  it('saves progress and restores it, dropping ids it does not know', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('comet'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['comet']);
    unmount();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(['skills', 'skills', 'bogus']));
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    expect(screen.getByTestId('list').textContent).toBe('skills');
  });

  it('keeps working when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(screen.getByTestId('list').textContent).toBe('about');
    vi.restoreAllMocks();
  });

  it('is silent by default and only sounds once the reader opts in', async () => {
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(playStamp).not.toHaveBeenCalled();

    await user.click(screen.getByText('sound'));
    expect(localStorage.getItem(SOUND_KEY)).toBe('true');
    await user.click(screen.getByText('comet'));
    expect(playStamp).toHaveBeenCalledTimes(1);
  });

  it('vibrates briefly where the device can', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
    const user = userEvent.setup();
    render(
      <PassportProvider>
        <Probe />
      </PassportProvider>,
    );
    await user.click(screen.getByText('about'));
    expect(vibrate).toHaveBeenCalledWith(30);
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('is inert outside a provider', async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(screen.getByText('about'));
    expect(screen.getByTestId('list').textContent).toBe('');
  });
});
