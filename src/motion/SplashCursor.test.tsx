import { render } from '@testing-library/react';

import SplashCursor from './SplashCursor';

function setCapability({ animate, hover }: { animate: boolean; hover: boolean }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const realMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('SplashCursor', () => {
  it('renders nothing under reduced motion', () => {
    setCapability({ animate: false, hover: true });
    const { container } = render(<SplashCursor />);

    // Not merely hidden: this is a full-screen WebGL fluid simulation on a
    // permanent animation frame loop. Hiding it with CSS would leave the loop
    // running for someone who asked for less movement.
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing on a device with no hovering pointer', () => {
    // A cursor effect needs a cursor. Upstream binds touch handlers so it can
    // smear under a finger; that costs a GPU loop on exactly the devices least
    // able to spare one, for something nobody asked to aim.
    setCapability({ animate: true, hover: false });
    const { container } = render(<SplashCursor />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('the vendored SplashCursor', () => {
  it('degrades instead of crashing the page when WebGL is unavailable', async () => {
    // Upstream throws `Unable to initialize WebGL` from inside its effect,
    // which makes its own `if (!gl || !ext) return;` unreachable and takes the
    // whole React tree down over a decorative cursor. WebGL being absent is
    // ordinary — disabled by policy, a blocklisted driver, or too many live
    // contexts. jsdom provides none, so this environment *is* the failing
    // browser, which is what makes the check meaningful here.
    const Splash = (await import('@/components/reactbits/SplashCursor/SplashCursor')).default;

    expect(() => {
      const { unmount } = render(<Splash />);
      unmount();
    }).not.toThrow();
  });

  it('keeps its canvas out of the accessibility tree and out of pointer reach', async () => {
    const Splash = (await import('@/components/reactbits/SplashCursor/SplashCursor')).default;
    const { container } = render(<Splash />);
    const overlay = container.firstElementChild!;

    // It covers the viewport. Without pointer-events-none nothing underneath
    // could be clicked, and without aria-hidden a screen reader would meet a
    // canvas that has nothing to say.
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay.className).toContain('pointer-events-none');

    // Behind the content, not merely below the navigation. This shipped once
    // at z-30 — under the nav's z-40, which looked reasoned — and hid every
    // section on the page, because anything above the content can cover it.
    // The negative layer removes the failure mode rather than ordering around
    // it, and is what `Backdrop` and `Grain` already use.
    expect(overlay.className).toContain('-z-10');
    expect(overlay.className).not.toMatch(/(^|\s)z-\d/);
  });
});
