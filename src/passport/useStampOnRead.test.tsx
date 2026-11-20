import { act, render, screen } from '@testing-library/react';
import { observers } from '@/test/stubs';
import { PassportProvider, usePassport } from './PassportProvider';
import { hasPassed, useStampOnRead } from './useStampOnRead';

function Probe() {
  const ref = useStampOnRead<HTMLElement>('about');
  return <section ref={ref} data-testid="probe" />;
}

function List() {
  const { stamps } = usePassport();
  return <p data-testid="list">{stamps.join(',')}</p>;
}

function setup() {
  render(
    <PassportProvider>
      <Probe />
      <List />
    </PassportProvider>,
  );
  return screen.getByTestId('probe');
}

const see = (el: Element, isIntersecting: boolean) =>
  act(() => {
    observers.at(-1)!.emit([{ target: el, isIntersecting }]);
  });
const placeBottomAt = (el: Element, bottom: number) => {
  el.getBoundingClientRect = () => ({ bottom }) as DOMRect;
};
const scroll = () =>
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const list = () => screen.getByTestId('list').textContent;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  // jsdom has no layout: give the page a height so "end of page" is not always true.
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 });
});
afterEach(() => vi.useRealTimers());

describe('hasPassed', () => {
  it('is true above the middle of the screen, or at the end of the page', () => {
    expect(hasPassed(100, 800, false)).toBe(true);
    expect(hasPassed(500, 800, false)).toBe(false);
    expect(hasPassed(500, 800, true)).toBe(true);
  });
});

describe('useStampOnRead', () => {
  it('does not stamp a section that was seen but not scrolled past', () => {
    const el = setup();
    placeBottomAt(el, 900);
    see(el, true);
    wait(5000);
    scroll();
    expect(list()).toBe('');
  });

  it('does not stamp a section scrolled past in under five seconds', () => {
    const el = setup();
    placeBottomAt(el, -10);
    see(el, true);
    wait(4000);
    see(el, false);
    scroll();
    expect(list()).toBe('');
  });

  it('stamps once it was seen for five seconds and then scrolled past', () => {
    const el = setup();
    placeBottomAt(el, 900);
    see(el, true);
    wait(5000);
    expect(list()).toBe('');
    placeBottomAt(el, -10);
    scroll();
    expect(list()).toBe('about');
  });

  it('adds up separate visits', () => {
    const el = setup();
    placeBottomAt(el, -10);
    see(el, true);
    wait(3000);
    see(el, false);
    expect(list()).toBe('');
    see(el, true);
    wait(2000);
    expect(list()).toBe('about');
  });

  it('counts the end of the page as scrolled past', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 768 });
    const el = setup();
    placeBottomAt(el, 700);
    see(el, true);
    wait(5000);
    expect(list()).toBe('about');
  });
});
