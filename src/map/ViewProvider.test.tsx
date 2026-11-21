import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInMap } from '@/test/mapHarness';
import { VIEW_KEY, ViewProvider, regionFromHash, useView } from './ViewProvider';

function Probe() {
  const v = useView();
  return (
    <>
      <p data-testid="mode">{v.mode}</p>
      <p data-testid="can">{String(v.canMap)}</p>
      <p data-testid="region">{v.region ?? ''}</p>
      <button onClick={() => v.open('skills')}>open</button>
      <button onClick={v.close}>close</button>
      <button onClick={() => v.setMode('map')}>map</button>
      <button onClick={() => v.setMode('read')}>read</button>
      <button onClick={() => v.focusProject('assetmind')}>focus</button>
      <p data-testid="trace">{JSON.stringify(v.trace.current)}</p>
    </>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  document.body.style.overflow = '';
});
afterEach(() => vi.restoreAllMocks());

describe('regionFromHash', () => {
  it('knows the six regions and treats everything else as the overview', () => {
    expect(regionFromHash('#about')).toBe('about');
    expect(regionFromHash('#contact')).toBe('contact');
    expect(regionFromHash('#home')).toBeNull();
    expect(regionFromHash('')).toBeNull();
    expect(regionFromHash('#nonsense')).toBeNull();
  });
});

describe('ViewProvider', () => {
  it('falls back to Reading mode, and refuses the map, when there is no canvas', async () => {
    const user = userEvent.setup();
    render(
      <ViewProvider>
        <Probe />
      </ViewProvider>,
    );
    expect(text('can')).toBe('false');
    expect(text('mode')).toBe('read');
    await user.click(screen.getByText('map'));
    expect(text('mode')).toBe('read');
  });

  it('starts on the map when a canvas exists, and on Reading if that was the last choice', () => {
    const first = renderInMap(<Probe />);
    expect(text('mode')).toBe('map');
    first.unmount();

    vi.restoreAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never);
    localStorage.setItem(VIEW_KEY, 'read');
    render(
      <ViewProvider>
        <Probe />
      </ViewProvider>,
    );
    expect(text('mode')).toBe('read');
  });

  it('remembers the switch', async () => {
    const user = userEvent.setup();
    renderInMap(<Probe />);
    await user.click(screen.getByText('read'));
    expect(localStorage.getItem(VIEW_KEY)).toBe('read');
    await user.click(screen.getByText('map'));
    expect(localStorage.getItem(VIEW_KEY)).toBe('map');
  });

  it('opens and closes a region through the URL', async () => {
    const user = userEvent.setup();
    renderInMap(<Probe />);
    await user.click(screen.getByText('open'));
    expect(text('region')).toBe('skills');
    expect(window.location.hash).toBe('#skills');
    await user.click(screen.getByText('close'));
    expect(text('region')).toBe('');
    expect(window.location.hash).toBe('');
  });

  it('opens the region named in the URL on the first render', () => {
    renderInMap(<Probe />, '#experience');
    expect(text('region')).toBe('experience');
  });

  it('follows the Back button', () => {
    renderInMap(<Probe />, '#about');
    expect(text('region')).toBe('about');
    window.history.replaceState(null, '', '/');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(text('region')).toBe('');
  });

  it('locks page scroll in Map mode only', async () => {
    const user = userEvent.setup();
    renderInMap(<Probe />);
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByText('read'));
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('scrolls a project card into view, and starts with no trace', async () => {
    const user = userEvent.setup();
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView');
    renderInMap(
      <>
        <Probe />
        <article id="project-assetmind" />
      </>,
    );
    expect(text('trace')).toBe('null');
    await user.click(screen.getByText('focus'));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(document.getElementById('project-assetmind'));
  });

  it('is inert outside a provider', async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(screen.getByText('open'));
    expect(text('region')).toBe('');
    expect(text('mode')).toBe('read');
  });
});
