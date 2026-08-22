import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Dialog from './Dialog';

const stop = vi.fn();
const start = vi.fn();

vi.mock('@/hooks/useLenis', () => ({
  useLenis: () => ({ scrollTo: () => {}, stop, start }),
  NAV_OFFSET: 80,
}));

/** A trigger plus a dialog, wired the way a real caller wires them. */
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open project
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Project detail">
        <p>detail body</p>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  beforeEach(() => {
    stop.mockClear();
    start.mockClear();
    document.body.style.overflow = '';
  });

  it('keeps its content out of the document until it is opened', () => {
    render(<Harness />);
    // Not merely hidden — absent. Fourteen certificate images would otherwise
    // sit in the DOM waiting for a click that may never come.
    expect(screen.queryByText('detail body')).toBeNull();
  });

  it('opens on demand and announces what it is', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open project' }));

    expect(screen.getByRole('dialog', { name: 'Project detail' })).toBeInTheDocument();
    expect(screen.getByText('detail body')).toBeInTheDocument();
  });

  it('returns focus to whatever opened it', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open project' });

    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    // The platform traps focus but does not hand it back, and without this a
    // keyboard user is dropped at the top of the document.
    expect(trigger).toHaveFocus();
  });

  it('stops the smooth scroll while open and starts it again after', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open project' }));

    expect(stop).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(start).toHaveBeenCalled();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('does not touch the scroll lock before it has ever opened', () => {
    render(<Harness />);
    expect(stop).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  });

  it('tells its owner when the browser closes it, which is how Escape arrives', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open project' }));

    // Escape is handled by the browser without telling React, so the component
    // has to listen for the element's own close event or its state drifts out
    // of step with what is on screen.
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;
    // A raw DOM close, not a Testing Library interaction, so the resulting
    // state update needs act to flush — exactly as a real Escape keypress
    // would arrive from outside React.
    act(() => dialog.close());

    expect(screen.queryByText('detail body')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open project' })).toHaveFocus();
  });

  it('behaves the same when the reader asked for reduced motion', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open project' }));

    // A dialog that will not open because someone asked for less motion is
    // broken, not considerate.
    expect(screen.getByRole('dialog', { name: 'Project detail' })).toBeInTheDocument();
  });
});
