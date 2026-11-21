import { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInMap } from '@/test/mapHarness';
import MapPanel from './MapPanel';
import { REGIONS, projectFigures, stepCamera, toScreen } from './mapEngine';
import StarMap from './StarMap';
import { useView } from './ViewProvider';

const grabbed = {} as Pick<ReturnType<typeof useView>, 'camera' | 'motion' | 'interacted' | 'hover'>;
function Probe() {
  const v = useView();
  const { camera, motion, interacted, hover } = v;
  // In an effect: the hooks lint forbids writing outside variables during render.
  useEffect(() => {
    grabbed.camera = camera;
    grabbed.motion = motion;
    grabbed.interacted = interacted;
    grabbed.hover = hover;
  }, [camera, motion, interacted, hover]);
  return <p data-testid="region">{v.region ?? ''}</p>;
}
const tree = (
  <>
    <StarMap />
    <Probe />
  </>
);
const surface = () => document.querySelector<HTMLElement>('[data-map-surface]')!;

function pointer(type: string, x: number, y: number, id = 1, target: EventTarget = window, button = 0) {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button });
  Object.defineProperty(event, 'pointerId', { value: id });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  act(() => {
    target.dispatchEvent(event);
  });
}

// A wheel on the surface at a chosen time: a hand-built event's timeStamp is otherwise real time.
function wheel(deltaY: number, timeStamp: number, ctrlKey = false) {
  const event = new WheelEvent('wheel', { deltaY, ctrlKey, clientX: 400, clientY: 300, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  act(() => {
    surface().dispatchEvent(event);
  });
  return event;
}

afterEach(() => vi.restoreAllMocks());

describe('StarMap', () => {
  it('renders nothing in Reading mode', () => {
    const { container } = render(tree);
    expect(container.querySelector('[data-map-surface]')).toBeNull();
  });

  it('offers one button per constellation, named by the section', () => {
    renderInMap(tree);
    for (const name of ['About', 'Skills', 'Experience', 'Projects', 'Education', 'Contact']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('opens a region from its button', async () => {
    const user = userEvent.setup();
    renderInMap(tree);
    await user.click(screen.getByRole('button', { name: 'Skills' }));
    expect(screen.getByTestId('region').textContent).toBe('skills');
  });

  it('opens a region when its figure is tapped', () => {
    renderInMap(tree);
    const view = { w: window.innerWidth, h: window.innerHeight };
    const r = REGIONS[3];
    const [x, y] = toScreen(grabbed.camera.current, view, r.x, r.y);
    pointer('pointerdown', x, y, 1, surface());
    pointer('pointerup', x, y);
    expect(screen.getByTestId('region').textContent).toBe(r.id);
  });

  it('pans when dragged and does not open anything on release', () => {
    renderInMap(tree);
    const before = { ...grabbed.camera.current };
    pointer('pointerdown', 500, 400, 1, surface());
    pointer('pointermove', 600, 450);
    pointer('pointerup', 600, 450);
    expect(grabbed.camera.current.x).toBeCloseTo(before.x - 100 / before.zoom, 3);
    expect(grabbed.camera.current.y).toBeCloseTo(before.y - 50 / before.zoom, 3);
    expect(screen.getByTestId('region').textContent).toBe('');
  });

  it('zooms with Ctrl+wheel and keeps the page from scrolling', () => {
    renderInMap(tree);
    const before = grabbed.camera.current.zoom;
    const event = wheel(-200, 0, true);
    expect(grabbed.camera.current.zoom).toBeGreaterThan(before);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not zoom with a plain wheel, and keeps the page from scrolling', () => {
    renderInMap(tree);
    const before = grabbed.camera.current.zoom;
    const event = wheel(-200, 0);
    expect(grabbed.camera.current.zoom).toBe(before);
    expect(event.defaultPrevented).toBe(true);
  });

  it('steps through the sections with a plain wheel, one step per gesture', () => {
    renderInMap(tree);
    const t = 10_000;
    wheel(100, t);
    expect(screen.getByTestId('region').textContent).toBe('about');
    wheel(100, t + 50);
    expect(screen.getByTestId('region').textContent).toBe('about');
    wheel(100, t + 1050);
    expect(screen.getByTestId('region').textContent).toBe('skills');
  });

  it('closes back to the sky with an upward wheel from the first section', () => {
    renderInMap(tree, '#about');
    wheel(-100, 10_000);
    expect(screen.getByTestId('region').textContent).toBe('');
  });

  it('steps with PageDown and PageUp', () => {
    renderInMap(tree);
    act(() => {
      fireEvent.keyDown(surface(), { key: 'PageDown' });
    });
    expect(screen.getByTestId('region').textContent).toBe('about');
    act(() => {
      fireEvent.keyDown(surface(), { key: 'PageDown' });
    });
    expect(screen.getByTestId('region').textContent).toBe('skills');
    act(() => {
      fireEvent.keyDown(surface(), { key: 'PageUp' });
    });
    expect(screen.getByTestId('region').textContent).toBe('about');
  });

  it('offers a Start pill on the overview only, which opens About', async () => {
    const user = userEvent.setup();
    renderInMap(tree);
    await user.click(screen.getByRole('button', { name: /Start exploring/ }));
    expect(screen.getByTestId('region').textContent).toBe('about');
    expect(screen.queryByRole('button', { name: /Start exploring/ })).toBeNull();
  });

  it('previews a constellation under the mouse with its title and a pointer cursor', () => {
    renderInMap(tree);
    const view = { w: window.innerWidth, h: window.innerHeight };
    const r = REGIONS.find((g) => g.id === 'skills')!;
    const [x, y] = toScreen(grabbed.camera.current, view, r.x, r.y);
    expect(surface()).toHaveClass('cursor-grab');
    pointer('pointermove', x, y);
    expect(screen.getByText('What I work with')).toBeInTheDocument();
    expect(surface()).toHaveClass('cursor-pointer');
    expect(grabbed.hover.current).toBe('skills');
    pointer('pointermove', -5000, -5000);
    expect(screen.queryByText('What I work with')).toBeNull();
    expect(surface()).toHaveClass('cursor-grab');
    expect(grabbed.hover.current).toBeNull();
  });

  it('forgets the hover after a trip through Reading mode', () => {
    renderInMap(
      <>
        {tree}
        <ModeSwitch />
      </>,
    );
    const view = { w: window.innerWidth, h: window.innerHeight };
    const r = REGIONS.find((g) => g.id === 'skills')!;
    const [x, y] = toScreen(grabbed.camera.current, view, r.x, r.y);
    pointer('pointermove', x, y);
    expect(grabbed.hover.current).toBe('skills');
    act(() => {
      screen.getByText('to reading').click();
    });
    act(() => {
      screen.getByText('to map').click();
    });
    expect(grabbed.hover.current).toBeNull();
    expect(screen.queryByText('What I work with')).toBeNull();
    expect(surface()).toHaveClass('cursor-grab');
  });

  it('marks the map as touched on the first press', () => {
    renderInMap(tree);
    expect(grabbed.interacted.current).toBe(false);
    pointer('pointerdown', 500, 400, 1, surface());
    expect(grabbed.interacted.current).toBe(true);
  });

  it('pinches to zoom with two pointers', () => {
    renderInMap(tree);
    const before = grabbed.camera.current.zoom;
    pointer('pointerdown', 400, 400, 1, surface());
    pointer('pointerdown', 500, 400, 2, surface());
    pointer('pointermove', 350, 400, 1);
    pointer('pointermove', 550, 400, 2);
    expect(grabbed.camera.current.zoom).toBeGreaterThan(before);
  });

  it('pans and zooms from the keyboard', async () => {
    const user = userEvent.setup();
    renderInMap(tree);
    screen.getByRole('button', { name: 'About' }).focus();
    const x = grabbed.camera.current.x;
    await user.keyboard('{ArrowLeft}');
    expect(grabbed.camera.current.x).toBeLessThan(x);
    const zoom = grabbed.camera.current.zoom;
    await user.keyboard('+');
    expect(grabbed.camera.current.zoom).toBeGreaterThan(zoom);
  });

  it('keeps the labels out of the tab order while a panel is open, and gives focus back on close', async () => {
    const user = userEvent.setup();
    const { container } = renderInMap(
      <>
        {tree}
        <CloseButton />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Skills' }));
    expect(container.querySelector('[data-region-labels]')).toHaveAttribute('inert');
    await user.click(screen.getByText('close panel'));
    expect(screen.getByRole('button', { name: 'Skills' })).toHaveFocus();
  });

  it('flies to a label that is focused off-screen', () => {
    renderInMap(tree);
    // The mount already queued a flight to the overview; clear it, then look away.
    grabbed.motion.current = { vx: 0, vy: 0, fly: null };
    // The far corner: x 100, y 100 still shows Contact at the overview zoom on a 1024x768 jsdom window.
    grabbed.camera.current = { ...grabbed.camera.current, x: 3000, y: 2000 };
    act(() => {
      screen.getByRole('button', { name: 'Contact' }).focus();
    });
    expect(grabbed.motion.current.fly).not.toBeNull();
    expect(grabbed.motion.current.fly!.to.x).toBe(REGIONS.find((r) => r.id === 'contact')!.x);
  });

  it('moves the sky by exactly the pointer distance while the sky loop runs, and coasts only after release', () => {
    renderInMap(tree);
    pointer('pointerdown', 500, 400, 1, surface());
    const before = { ...grabbed.camera.current };
    let now = performance.now();
    for (let i = 1; i <= 5; i++) {
      pointer('pointermove', 500 + i * 40, 400 + i * 10);
      // What SkyCanvas does every frame.
      now += 16;
      grabbed.camera.current = stepCamera(grabbed.camera.current, grabbed.motion.current, now, 16);
      expect(grabbed.motion.current.vx).toBe(0);
      expect(grabbed.motion.current.vy).toBe(0);
    }
    expect(grabbed.camera.current.x).toBeCloseTo(before.x - 200 / before.zoom, 3);
    expect(grabbed.camera.current.y).toBeCloseTo(before.y - 50 / before.zoom, 3);
    pointer('pointerup', 700, 450);
    expect(grabbed.motion.current.vx).toBeGreaterThan(0);
  });

  it('ignores a press of a mouse button other than the primary one', () => {
    renderInMap(tree);
    const view = { w: window.innerWidth, h: window.innerHeight };
    const [x, y] = toScreen(grabbed.camera.current, view, REGIONS[3].x, REGIONS[3].y);
    pointer('pointerdown', x, y, 1, surface(), 2);
    pointer('pointerup', x, y, 1, window, 2);
    expect(screen.getByTestId('region').textContent).toBe('');
  });

  it('does not open the label a drag ends over', () => {
    renderInMap(tree);
    const label = screen.getByRole('button', { name: 'About' });
    pointer('pointerdown', 500, 400, 1, surface());
    pointer('pointermove', 600, 450);
    pointer('pointerup', 600, 450, 1, label);
    fireEvent.click(label, { detail: 1 });
    expect(screen.getByTestId('region').textContent).toBe('');
  });

  it('keeps the pan when a resize leaves the window size as it was', () => {
    renderInMap(tree);
    pointer('pointerdown', 500, 400, 1, surface());
    pointer('pointermove', 600, 450);
    pointer('pointerup', 600, 450);
    const panned = { ...grabbed.camera.current };
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(grabbed.camera.current).toEqual(panned);
  });

  it('does not move focus to an old label after a trip through Reading mode', async () => {
    const user = userEvent.setup();
    renderInMap(
      <>
        {tree}
        <ModeSwitch />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Skills' }));
    await user.click(screen.getByText('to reading'));
    window.history.replaceState(null, '', '/');
    await user.click(screen.getByText('to map'));
    expect(screen.getByRole('button', { name: 'Skills' })).not.toHaveFocus();
  });

  it('gives focus back to the label when the panel is closed with Escape', async () => {
    const user = userEvent.setup();
    renderInMap(
      <>
        <MapPanel>
          <section id="skills" />
        </MapPanel>
        {tree}
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Skills' }));
    expect(screen.getByTestId('region').textContent).toBe('skills');
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('region').textContent).toBe('');
    expect(screen.getByRole('button', { name: 'Skills' })).toHaveFocus();
  });

  it('lands on the open section when switching to Reading mode', async () => {
    const user = userEvent.setup();
    const scrolled = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    renderInMap(
      <>
        {tree}
        <section id="about" />
        <ModeSwitch />
      </>,
      '#about',
    );
    await user.click(screen.getByText('to reading'));
    expect(scrolled.mock.contexts).toContain(document.getElementById('about'));
  });
});

describe('StarMap on the Projects region', () => {
  const ids = ['assetmind', 'village-portal', 'simpel-ibs', 'animart'];

  function setup() {
    const scrolled = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    renderInMap(
      <>
        {tree}
        {ids.map((id) => (
          <article key={id} id={`project-${id}`} />
        ))}
      </>,
      '#projects',
    );
    const view = { w: window.innerWidth, h: window.innerHeight };
    const projects = REGIONS.find((r) => r.id === 'projects')!;
    const figures = projectFigures(ids, projects);
    const onScreen = (id: string) =>
      figures.find((f) => f.id === id)!.stars.map(([x, y]) => toScreen(grabbed.camera.current, view, x, y));
    return { scrolled, onScreen };
  }

  it('opens a project when one of its stars is tapped', () => {
    const { scrolled, onScreen } = setup();
    const [x, y] = onScreen('animart')[0];
    pointer('pointerdown', x, y, 1, surface());
    pointer('pointerup', x, y);
    expect(scrolled).toHaveBeenCalled();
  });

  it('opens a project once its stars are traced in order', () => {
    const { scrolled, onScreen } = setup();
    const stars = onScreen('assetmind');
    pointer('pointerdown', stars[0][0], stars[0][1], 1, surface());
    for (const [x, y] of stars.slice(1)) pointer('pointermove', x, y);
    pointer('pointerup', stars[3][0], stars[3][1]);
    expect(scrolled).toHaveBeenCalled();
  });

  it('does not open a project when the stars are touched out of order', () => {
    const { scrolled, onScreen } = setup();
    const stars = onScreen('assetmind');
    pointer('pointerdown', stars[0][0], stars[0][1], 1, surface());
    pointer('pointermove', stars[3][0], stars[3][1]);
    pointer('pointerup', stars[3][0], stars[3][1]);
    expect(scrolled).not.toHaveBeenCalled();
  });
});

function CloseButton() {
  const { close } = useView();
  return <button onClick={close}>close panel</button>;
}

function ModeSwitch() {
  const { setMode } = useView();
  return (
    <>
      <button onClick={() => setMode('read')}>to reading</button>
      <button onClick={() => setMode('map')}>to map</button>
    </>
  );
}
