import { act, screen } from '@testing-library/react';
import { observers } from '@/test/stubs';
import { renderInMap } from '@/test/mapHarness';
import SectionShell from '@/components/layout/SectionShell';
import About from '@/sections/About';
import Hero from '@/sections/Hero';
import { usePassport } from '@/passport/PassportProvider';

function Stamps() {
  const { stamps } = usePassport();
  return <p data-testid="stamps">{stamps.join(',')}</p>;
}

afterEach(() => vi.restoreAllMocks());

describe('sections in Map mode', () => {
  it('shows only the open section and hides the rest', () => {
    const { container } = renderInMap(
      <>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>about body</p>
        </SectionShell>
        <SectionShell id="skills" index={2} label="Skills" title="What I use">
          <p>skills body</p>
        </SectionShell>
      </>,
      '#skills',
    );
    expect(container.querySelector<HTMLElement>('#about')).toHaveAttribute('hidden');
    expect(container.querySelector<HTMLElement>('#skills')).not.toHaveAttribute('hidden');
  });

  it('hides every section on the overview', () => {
    const { container } = renderInMap(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
    );
    expect(container.querySelector('#about')).toHaveAttribute('hidden');
  });

  it('lays a section out as one compact column', () => {
    const { container } = renderInMap(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
      '#about',
    );
    expect(container.querySelector('#about > div')?.className).not.toContain('lg:grid-cols-12');
  });

  it('does not stamp by scrolling while in Map mode', () => {
    renderInMap(
      <>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>body</p>
        </SectionShell>
        <Stamps />
      </>,
      '#about',
    );
    // No observer is created for the reading rule in Map mode.
    expect(observers).toHaveLength(0);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByTestId('stamps').textContent).toBe('');
  });

  it('shows the overview title block, with the hint, and no passport page', () => {
    const { container } = renderInMap(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Drag the sky. Pick a constellation.')).toBeInTheDocument();
    expect(container.querySelector('.plate')).toBeNull();
  });

  it('adds the scroll hint to the overview hint, for fine pointers only', () => {
    renderInMap(<Hero />);
    const hint = screen.getByText('Drag the sky. Pick a constellation.');
    expect(hint.textContent).toContain('Scroll to begin.');
    // jsdom cannot evaluate the media query, so the class is what is checked.
    expect(screen.getByText('Scroll to begin.')).toHaveClass('hidden', '[@media(pointer:fine)]:inline');
  });

  it('hides the overview while a region is open', () => {
    const { container } = renderInMap(<Hero />, '#about');
    expect(container.querySelector('#home')).toHaveAttribute('hidden');
  });

  it('lets a drag through the empty part of the overview, so only the buttons take the pointer', () => {
    const { container } = renderInMap(<Hero />);
    const row = container.querySelector('#home a[href="#projects"]')!.parentElement!;
    // The row spans the page; if it took the pointer, a drag started beside the buttons would never reach the sky.
    expect(row.className).toContain('pointer-events-none');
    expect(row.className).toContain('[&>a]:pointer-events-auto');
  });

  it('puts the passport page at the top of About', () => {
    const { container } = renderInMap(<About />, '#about');
    expect(container.querySelector('.plate')).not.toBeNull();
    expect(screen.getByText('Arrival')).toBeInTheDocument();
  });
});
