import { render, screen } from '@testing-library/react';
import Heading from './Heading';
import Reveal from './Reveal';
import Surface from './Surface';

function setMotion({ animate, hover = true }: { animate: boolean; hover?: boolean }) {
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

describe.each([
  ['motion allowed', true],
  ['motion refused', false],
])('%s', (_label, animate) => {
  beforeEach(() => setMotion({ animate }));

  it('Reveal renders its children', () => {
    render(
      <Reveal>
        <p>body copy</p>
      </Reveal>,
    );
    expect(screen.getByText('body copy')).toBeInTheDocument();
  });

  it('Heading renders a real heading at the requested level', () => {
    render(<Heading level={2}>Who I am</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Who I am' })).toBeInTheDocument();
  });

  it('Heading renders exactly one heading element, never nested', () => {
    render(<Heading level={2}>Who I am</Heading>);
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('Surface renders its children and keeps the design tokens', () => {
    const { container } = render(
      <Surface>
        <p>card body</p>
      </Surface>,
    );
    expect(screen.getByText('card body')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('border-edge', 'bg-surface');
  });
});

describe.each([
  ['motion allowed', true],
  ['motion refused', false],
])('Reveal height passthrough, %s', (_label, animate) => {
  beforeEach(() => setMotion({ animate }));

  it('claims no height of its own by default', () => {
    const { container } = render(
      <Reveal>
        <p>body copy</p>
      </Reveal>,
    );

    // Stacked Reveals in a column would each become the full height of that
    // column, so a hero with five of them grows to five times its height.
    for (const el of container.querySelectorAll('*')) {
      expect(el.className).not.toContain('h-full');
    }
  });

  it('passes the parent height through when asked to fill', () => {
    const { container } = render(
      <Reveal fill>
        <p>card body</p>
      </Reveal>,
    );
    expect(container.querySelector('.h-full')).not.toBeNull();
  });
});

describe('when motion is allowed', () => {
  beforeEach(() => setMotion({ animate: true }));

  it('Reveal never hides its content with a class', () => {
    const { container } = render(
      <Reveal>
        <p>body copy</p>
      </Reveal>,
    );

    // The wrapper used to ship an `invisible` class that only GSAP removed, so
    // anything preventing GSAP from running left the content hidden for good.
    // The starting state is applied from a layout effect instead, which means
    // the markup alone is visible.
    for (const el of container.querySelectorAll('*')) {
      expect(el.className, 'content is hidden by a class rather than by script').not.toContain(
        'invisible',
      );
    }
  });
});

describe('with motion refused', () => {
  beforeEach(() => setMotion({ animate: false }));

  it('Heading is one plain text node, not one element per character', () => {
    render(<Heading level={2}>Who I am</Heading>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.childElementCount).toBe(0);
    expect(heading.textContent).toBe('Who I am');
  });

  it('Surface adds no cursor tracking', () => {
    const { container } = render(
      <Surface>
        <p>card body</p>
      </Surface>,
    );
    expect(container.querySelector('[data-spotlight]')).toBeNull();
  });
});

describe('on a touch device with motion allowed', () => {
  beforeEach(() => setMotion({ animate: true, hover: false }));

  it('Surface still skips the spotlight, which needs a hovering pointer', () => {
    const { container } = render(
      <Surface>
        <p>card body</p>
      </Surface>,
    );
    expect(container.querySelector('[data-spotlight]')).toBeNull();
    expect(screen.getByText('card body')).toBeInTheDocument();
  });
});
