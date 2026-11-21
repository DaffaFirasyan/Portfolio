import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInMap } from '@/test/mapHarness';
import MapPanel from './MapPanel';

afterEach(() => vi.restoreAllMocks());

const body = (
  <MapPanel>
    <p>panel body</p>
  </MapPanel>
);

describe('MapPanel', () => {
  it('slides in when a region is open, with a back button that has focus', () => {
    const { container } = renderInMap(body, '#about');
    expect(container.firstElementChild).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: /back to the sky/i })).toHaveFocus();
  });

  it('is shut and inert on the overview', () => {
    const { container } = renderInMap(body);
    expect(container.firstElementChild).toHaveAttribute('inert');
    expect(screen.queryByRole('button', { name: /back to the sky/i })).not.toBeInTheDocument();
  });

  it('closes with the back button', async () => {
    const user = userEvent.setup();
    const { container } = renderInMap(body, '#about');
    await user.click(screen.getByRole('button', { name: /back to the sky/i }));
    expect(container.firstElementChild).toHaveAttribute('inert');
    expect(window.location.hash).toBe('');
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    const { container } = renderInMap(body, '#about');
    await user.keyboard('{Escape}');
    expect(container.firstElementChild).toHaveAttribute('inert');
  });

  it('leaves Escape to an open dialog', async () => {
    const user = userEvent.setup();
    const { container } = renderInMap(
      <>
        {body}
        <dialog open aria-label="certificate" />
      </>,
      '#about',
    );
    await user.keyboard('{Escape}');
    expect(container.firstElementChild).not.toHaveAttribute('inert');
  });

  it('names both neighbours in the bar', () => {
    renderInMap(body, '#skills');
    expect(screen.getByRole('button', { name: 'Previous: About' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next: Experience' })).toBeInTheDocument();
  });

  it('has no Previous on the first section: Back is the way to the overview', () => {
    renderInMap(body, '#about');
    expect(screen.getByRole('button', { name: 'Next: Skills' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Previous/ })).not.toBeInTheDocument();
  });

  it('has no Next and no end row on the last section', () => {
    renderInMap(body, '#contact');
    expect(screen.getByRole('button', { name: 'Previous: Education' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Next/ })).not.toBeInTheDocument();
  });

  it('steps on with Next, back to the top of the panel and the back button', async () => {
    const user = userEvent.setup();
    const { container } = renderInMap(body, '#skills');
    const panel = container.firstElementChild as HTMLElement;
    Object.defineProperty(panel, 'scrollTop', { configurable: true, writable: true, value: 500 });
    await user.click(screen.getByRole('button', { name: 'Next: Experience' }));
    expect(window.location.hash).toBe('#experience');
    expect(panel.scrollTop).toBe(0);
    expect(screen.getByRole('button', { name: /back to the sky/i })).toHaveFocus();
  });

  it('steps back with Previous', async () => {
    const user = userEvent.setup();
    renderInMap(body, '#skills');
    await user.click(screen.getByRole('button', { name: 'Previous: About' }));
    expect(window.location.hash).toBe('#about');
  });

  it('ends every panel but the last with a row naming the next section', async () => {
    const user = userEvent.setup();
    renderInMap(body, '#about');
    await user.click(screen.getByRole('button', { name: 'Next: Skills →' }));
    expect(window.location.hash).toBe('#skills');
  });

  describe('scrolling past an edge', () => {
    /** jsdom has no layout: give the panel a scroll position and size. */
    const place = (panel: Element, top: number) => {
      Object.defineProperty(panel, 'scrollTop', { configurable: true, writable: true, value: top });
      Object.defineProperty(panel, 'clientHeight', { configurable: true, value: 600 });
      Object.defineProperty(panel, 'scrollHeight', { configurable: true, value: 2000 });
    };

    it('steps to the next section once the panel is at its end', () => {
      const { container } = renderInMap(body, '#about');
      const panel = container.firstElementChild!;
      place(panel, 1400);
      expect(fireEvent.wheel(panel, { deltaY: 110 })).toBe(true);
      expect(window.location.hash).toBe('#about');
      expect(fireEvent.wheel(panel, { deltaY: 110 })).toBe(true);
      expect(window.location.hash).toBe('#skills');
    });

    it('leaves the wheel to the panel in the middle', () => {
      const { container } = renderInMap(body, '#about');
      const panel = container.firstElementChild!;
      place(panel, 700);
      expect(fireEvent.wheel(panel, { deltaY: 300 })).toBe(true);
      expect(fireEvent.wheel(panel, { deltaY: -300 })).toBe(true);
      expect(window.location.hash).toBe('#about');
    });

    it('counts wheel lines as 16 px', () => {
      const { container } = renderInMap(body, '#about');
      const panel = container.firstElementChild!;
      place(panel, 1400);
      fireEvent.wheel(panel, { deltaY: 14, deltaMode: 1 });
      expect(window.location.hash).toBe('#skills');
    });

    it('steps back from the top of a panel', () => {
      const { container } = renderInMap(body, '#skills');
      const panel = container.firstElementChild!;
      place(panel, 0);
      fireEvent.wheel(panel, { deltaY: -220 });
      expect(window.location.hash).toBe('#about');
    });

    it('closes to the overview from the top of the first panel', () => {
      const { container } = renderInMap(body, '#about');
      const panel = container.firstElementChild!;
      place(panel, 0);
      fireEvent.wheel(panel, { deltaY: -220 });
      expect(window.location.hash).toBe('');
      expect(panel).toHaveAttribute('inert');
    });
  });

  it('has none of the stepping controls in Reading mode', () => {
    window.history.replaceState(null, '', '/#skills');
    const { container } = render(body);
    const panel = container.firstElementChild!;
    expect(screen.queryByRole('button', { name: /^(Previous|Next)/ })).not.toBeInTheDocument();
    Object.defineProperty(panel, 'scrollTop', { configurable: true, value: 0 });
    fireEvent.wheel(panel, { deltaY: -500 });
    expect(window.location.hash).toBe('#skills');
  });

  it('is just a transparent wrapper in Reading mode', () => {
    const { container } = render(body);
    expect(container.firstElementChild?.className).toContain('contents');
    expect(screen.queryByRole('button', { name: /back to the sky/i })).not.toBeInTheDocument();
    expect(screen.getByText('panel body')).toBeInTheDocument();
  });
});
