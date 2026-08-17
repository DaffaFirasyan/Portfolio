import { render, screen, waitFor } from '@testing-library/react';
import { observers } from '@/test/stubs';
import Backdrop from './Backdrop';

function setCapability({ reduced, memory }: { reduced: boolean; memory: number }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  // Both are read by useMotionAllowed's low-end check; pinning them keeps the
  // capability deterministic rather than dependent on the runner's machine.
  Object.defineProperty(navigator, 'deviceMemory', { value: memory, configurable: true });
  Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
}

describe('Backdrop', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('renders a static gradient and no canvas under reduced motion', async () => {
    setCapability({ reduced: true, memory: 16 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('canvas')).toBeNull());
  });

  it('renders a static gradient on a device too weak for it', async () => {
    setCapability({ reduced: false, memory: 2 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector('canvas')).toBeNull());
  });

  it('is hidden from assistive technology either way', () => {
    setCapability({ reduced: true, memory: 16 });
    const { container } = render(<Backdrop />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('watches its own visibility so it can unmount when scrolled away', () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    expect(observers.length).toBeGreaterThan(0);
  });

  it('stays unmounted while off screen even when the device is capable', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);

    // No intersection was ever emitted, so the backdrop has never been seen.
    await waitFor(() => expect(document.querySelector('canvas')).toBeNull());
    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
  });

  it('disconnects its observer on unmount', () => {
    setCapability({ reduced: false, memory: 16 });
    const { unmount } = render(<Backdrop />);
    expect(observers.length).toBe(1);
    unmount();
    expect(observers.length).toBe(0);
  });
});
