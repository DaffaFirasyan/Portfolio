import { act, screen } from '@testing-library/react';
import { renderInMap } from '@/test/mapHarness';
import { usePassport } from '@/passport/PassportProvider';
import MapStamps from './MapStamps';
import { useView } from './ViewProvider';

function Probe() {
  const { stamps } = usePassport();
  const v = useView();
  return (
    <>
      <p data-testid="stamps">{stamps.join(',')}</p>
      <button onClick={() => v.open('about')}>about</button>
      <button onClick={() => v.open('skills')}>skills</button>
      <button onClick={v.close}>close</button>
    </>
  );
}

const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const click = (name: string) =>
  act(() => {
    screen.getByText(name).click();
  });
const stamps = () => screen.getByTestId('stamps').textContent;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('MapStamps', () => {
  const tree = (
    <>
      <MapStamps />
      <Probe />
    </>
  );

  it('stamps a region after five seconds in its panel, once the reader leaves', () => {
    renderInMap(tree);
    click('about');
    wait(5000);
    expect(stamps()).toBe('');
    click('close');
    expect(stamps()).toBe('about');
  });

  it('stamps nothing for a quick look', () => {
    renderInMap(tree);
    click('about');
    wait(2000);
    click('skills');
    wait(2000);
    click('close');
    expect(stamps()).toBe('');
  });

  it('adds up separate visits to the same region', () => {
    renderInMap(tree);
    click('about');
    wait(3000);
    click('close');
    click('about');
    wait(2500);
    click('skills');
    expect(stamps()).toBe('about');
  });

  it('stamps the arrival after five seconds on the overview, once a region is opened', () => {
    renderInMap(tree);
    wait(5000);
    click('about');
    expect(stamps()).toBe('home');
  });
});
