import { render, screen } from '@testing-library/react';
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

  it('is just a transparent wrapper in Reading mode', () => {
    const { container } = render(body);
    expect(container.firstElementChild?.className).toContain('contents');
    expect(screen.queryByRole('button', { name: /back to the sky/i })).not.toBeInTheDocument();
    expect(screen.getByText('panel body')).toBeInTheDocument();
  });
});
