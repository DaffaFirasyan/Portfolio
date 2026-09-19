import { act, render, screen, waitFor } from '@testing-library/react';
import { observers } from '@/test/stubs';
import Backdrop from './Backdrop';

// The real WaveBackground builds a WebGL context, which jsdom does not provide. Mocking
// it keeps these tests about the gating decision rather than about WebGL. The
// props are recorded because the decisions this component makes are expressed
// as props, and that is the only part of WaveBackground testable without a GPU.
const { waveProps } = vi.hoisted(() => ({
  waveProps: [] as Record<string, unknown>[],
}));

vi.mock('@/components/lightswind/WaveBackground/WaveBackground', () => ({
  default: (props: Record<string, unknown>) => {
    waveProps.push(props);
    return <canvas data-testid="wave-background" />;
  },
}));

function setCapability({
  reduced,
  memory,
  hover = true,
}: {
  reduced: boolean;
  memory: number;
  hover?: boolean;
}) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reduced
      : query.includes('hover')
        ? hover
        : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  // Both feed useMotionAllowed's low-end check; pinning them keeps the decision
  // deterministic rather than dependent on the runner's machine.
  Object.defineProperty(navigator, 'deviceMemory', { value: memory, configurable: true });
  Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
}

/** Tell the component's observer that its host left, or re-entered, the viewport. */
function reportVisibility(isIntersecting: boolean) {
  const record = observers.at(-1);
  if (!record) throw new Error('Backdrop registered no IntersectionObserver');
  const target = [...record.targets][0];
  act(() => {
    record.emit([{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
  });
}

describe('Backdrop', () => {
  beforeEach(() => {
    observers.length = 0;
    waveProps.length = 0;
  });

  it('lets the wave background follow the pointer where a pointer can hover', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('wave-background');

    expect(waveProps.at(-1)?.mouseInteraction).toBe(true);
  });

  it('renders a static gradient and no wave background on a device that cannot hover', async () => {
    // This used to assert something weaker — that the backdrop still ran but
    // with its pointer parallax switched off. The gate is stronger now, and
    // measurement is why: `webgl` tests memory, cores and Save-Data, none of
    // which a phone-emulating audit fakes, so a WebGL render loop was running
    // through every mobile Lighthouse run and through every real phone visit
    // from a device with enough memory. `hover` is the flag that actually
    // separates a laptop from a phone, and it is what already gates the splash
    // cursor and the robot.
    setCapability({ reduced: false, memory: 16, hover: false });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('wave-background')).toBeNull());
  });

  it('renders the wave background when the device is capable', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);

    expect(await screen.findByTestId('wave-background')).toBeInTheDocument();
  });

  it('shows the wave background without waiting to be told it is visible', async () => {
    // The hero is the top of the page, so the backdrop is on screen by
    // construction. If this needed an intersection callback first, a browser
    // that never delivered one would silently lose the backdrop.
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);

    expect(await screen.findByTestId('wave-background')).toBeInTheDocument();
    expect(observers.length).toBe(1);
    expect(observers[0].targets.size).toBe(1);
  });

  it('pauses the wave background once it scrolls out of view', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('wave-background');
    expect(waveProps.at(-1)?.active).toBe(true);

    reportVisibility(false);

    // Instead of unmounting the WebGL canvas (which forces an expensive shader
    // recompilation freeze on scroll back), it pauses the animation loop when off-screen.
    await waitFor(() => expect(waveProps.at(-1)?.active).toBe(false));
  });

  it('resumes the wave background when it returns to view', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('wave-background');

    reportVisibility(false);
    await waitFor(() => expect(waveProps.at(-1)?.active).toBe(false));

    reportVisibility(true);
    await waitFor(() => expect(waveProps.at(-1)?.active).toBe(true));
  });

  it('renders a static gradient and no wave background under reduced motion', async () => {
    setCapability({ reduced: true, memory: 16 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('wave-background')).toBeNull());
  });

  it('renders a static gradient on a device too weak for it', async () => {
    setCapability({ reduced: false, memory: 2 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('wave-background')).toBeNull());
  });

  it('is hidden from assistive technology either way', () => {
    setCapability({ reduced: true, memory: 16 });
    const { container } = render(<Backdrop />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('disconnects its observer on unmount', () => {
    setCapability({ reduced: false, memory: 16 });
    const { unmount } = render(<Backdrop />);
    expect(observers.length).toBe(1);
    unmount();
    expect(observers.length).toBe(0);
  });
});
