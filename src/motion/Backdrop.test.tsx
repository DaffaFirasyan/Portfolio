import { render, screen, waitFor } from '@testing-library/react';
import { observers } from '@/test/stubs';
import Backdrop from './Backdrop';

// The real Galaxy builds a WebGL context, which jsdom does not provide. Mocking
// it keeps these tests about the gating decision rather than about ogl. The
// props are recorded because the decisions this component makes are expressed
// as props, and that is the only part of Galaxy testable without a GPU.
const { galaxyProps } = vi.hoisted(() => ({
  galaxyProps: [] as Record<string, unknown>[],
}));

vi.mock('@/components/reactbits/Galaxy/Galaxy', () => ({
  default: (props: Record<string, unknown>) => {
    galaxyProps.push(props);
    return <canvas data-testid="galaxy" />;
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
  record.emit([{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
}

describe('Backdrop', () => {
  beforeEach(() => {
    observers.length = 0;
    galaxyProps.length = 0;
  });

  it('lets the starfield follow the pointer where a pointer can hover', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('galaxy');

    expect(galaxyProps.at(-1)?.mouseInteraction).toBe(true);
  });

  it('leaves the pointer parallax off on a device that cannot hover', async () => {
    // Otherwise a touch device attaches a window mousemove listener for an
    // effect it can never show.
    setCapability({ reduced: false, memory: 16, hover: false });
    render(<Backdrop />);
    await screen.findByTestId('galaxy');

    expect(galaxyProps.at(-1)?.mouseInteraction).toBe(false);
  });

  it('renders the starfield when the device is capable', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);

    expect(await screen.findByTestId('galaxy')).toBeInTheDocument();
  });

  it('shows the starfield without waiting to be told it is visible', async () => {
    // The hero is the top of the page, so the backdrop is on screen by
    // construction. If this needed an intersection callback first, a browser
    // that never delivered one would silently lose the backdrop.
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);

    expect(await screen.findByTestId('galaxy')).toBeInTheDocument();
    expect(observers.length).toBe(1);
    expect(observers[0].targets.size).toBe(1);
  });

  it('unmounts the starfield once it scrolls out of view', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('galaxy');

    reportVisibility(false);

    // A hidden canvas keeps rendering, so this has to leave the DOM rather
    // than merely be hidden.
    await waitFor(() => expect(screen.queryByTestId('galaxy')).toBeNull());
    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
  });

  it('brings the starfield back when it returns to view', async () => {
    setCapability({ reduced: false, memory: 16 });
    render(<Backdrop />);
    await screen.findByTestId('galaxy');

    reportVisibility(false);
    await waitFor(() => expect(screen.queryByTestId('galaxy')).toBeNull());

    reportVisibility(true);
    expect(await screen.findByTestId('galaxy')).toBeInTheDocument();
  });

  it('renders a static gradient and no starfield under reduced motion', async () => {
    setCapability({ reduced: true, memory: 16 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('galaxy')).toBeNull());
  });

  it('renders a static gradient on a device too weak for it', async () => {
    setCapability({ reduced: false, memory: 2 });
    render(<Backdrop />);

    expect(screen.getByTestId('backdrop-fallback')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('galaxy')).toBeNull());
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
