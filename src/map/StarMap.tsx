import { useCallback, useEffect, useRef, useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import {
  MAX_COAST,
  REGIONS,
  createWheelStepper,
  frameFor,
  hitRegion,
  labelPosition,
  overviewCamera,
  panBy,
  projectFigures,
  toScreen,
  toWorld,
  traceStep,
  zoomAt,
  type Region,
  type RegionId,
} from './mapEngine';
import { useView } from './ViewProvider';

const DRAG_PX = 6;
const KEY_STEP = 90;

const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });

/**
 * The map's hands. A full-screen surface turns a drag into panning (with a
 * coast after you let go), the wheel and a two-finger pinch into zooming about
 * the pointer, a tap on a constellation into opening it, and the arrow keys and
 * plus and minus into the same for the keyboard. Each constellation also has a
 * real button, named by its section, so the map works without a pointer.
 *
 * The camera follows the open region: open one and it flies there, leaving the
 * free side of the screen to the panel; close it and it flies back to the
 * overview. A drag that moved never counts as a click.
 *
 * In the Projects region each project has a small figure of its own: tap one of
 * its stars, or drag from its first star through the rest in order, to bring
 * that project's card into view.
 */
export default function StarMap() {
  const { sections, projects, t } = useLanguage();
  const view = useView();
  const { mode, region, open, step, flyTo, focusProject } = view;
  // Named *Ref so the React compiler lets the handlers write them.
  const {
    camera: cameraRef,
    motion: motionRef,
    paint: paintRef,
    layout: layoutRef,
    animated: animatedRef,
    trace: traceRef,
    interacted: interactedRef,
    hover: hoverRef,
  } = view;
  const surface = useRef<HTMLDivElement>(null);
  const labels = useRef(new Map<RegionId, HTMLButtonElement>());
  const moved = useRef(false);
  const previous = useRef<RegionId | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const [dragging, setDragging] = useState(false);
  // The stepper outlives the pointer effect, which re-runs on every region change: a fresh one would drop the lock and let an inertia tail step again.
  const stepRef = useRef(step);
  const stepperRef = useRef<ReturnType<typeof createWheelStepper> | null>(null);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    stepperRef.current = createWheelStepper((dir) => stepRef.current(dir), 80);
  }, []);

  // Mirrored into the shared ref for the sky; state changes only when the region under the mouse does.
  const setHover = useCallback(
    (id: RegionId | null) => {
      if (hoverRef.current === id) return;
      hoverRef.current = id;
      setHovered(id);
      paintRef.current();
    },
    [hoverRef, paintRef],
  );

  // Leaving the map forgets the hover and the drag, so a return shows no stale highlight or grabbing cursor.
  useEffect(() => {
    if (mode !== 'map') return;
    return () => {
      setHover(null);
      setDragging(false);
    };
  }, [mode, setHover]);

  // The camera follows the region.
  useEffect(() => {
    if (mode !== 'map') {
      // Forget the last region, so coming back to the map does not focus a stale label.
      previous.current = null;
      return;
    }
    // Any way of opening a region (tap, label, step, link) counts as touching the map.
    if (region) interactedRef.current = true;
    flyTo(frameFor(REGIONS.find((r) => r.id === region), viewport()));
    if (!region && previous.current) labels.current.get(previous.current)?.focus();
    previous.current = region;
  }, [mode, region, flyTo, interactedRef]);

  // The sky asks for the labels to be placed every frame.
  useEffect(() => {
    if (mode !== 'map') return;
    const place = () => {
      const view = viewport();
      for (const r of REGIONS) {
        const el = labels.current.get(r.id);
        if (!el) continue;
        const [x, y] = labelPosition(r, cameraRef.current, view);
        el.style.transform = `translate(${x}px, ${y}px) translateX(-50%)`;
      }
    };
    layoutRef.current = place;
    place();
    return () => {
      layoutRef.current = () => {};
    };
  }, [mode, cameraRef, layoutRef]);

  // A resized window re-frames the current view without a flight.
  useEffect(() => {
    if (mode !== 'map') return;
    let size = viewport();
    const onResize = () => {
      const view = viewport();
      if (view.w === size.w && view.h === size.h) return;
      // Mobile browsers resize the window as the address bar slides; on touch only a real change re-frames.
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      if (coarse && view.w === size.w && Math.abs(view.h - size.h) < 150) return;
      size = view;
      motionRef.current = { vx: 0, vy: 0, fly: null };
      cameraRef.current = frameFor(REGIONS.find((r) => r.id === region), view);
      paintRef.current();
      layoutRef.current();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mode, region, cameraRef, motionRef, paintRef, layoutRef]);

  useEffect(() => {
    const el = surface.current;
    if (mode !== 'map' || !el) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    let startX = 0;
    let startY = 0;
    let lastAt = 0;
    // The drag's velocity, handed to the sky only on release: written while held, the loop would pan a second time.
    let vx = 0;
    let vy = 0;
    const commit = () => {
      paintRef.current();
      layoutRef.current();
    };
    const stop = () => {
      motionRef.current = { vx: 0, vy: 0, fly: null };
    };

    const figures = projectFigures(
      projects.map((p) => p.id),
      REGIONS.find((r) => r.id === 'projects')!,
    );
    const near = ([x, y]: [number, number], px: number, py: number) => {
      const s = toScreen(cameraRef.current, viewport(), x, y);
      return Math.hypot(s[0] - px, s[1] - py) <= 28;
    };
    // The figure whose first star is under the pointer: where a trace may begin.
    const figureAt = (px: number, py: number) =>
      region === 'projects' ? (figures.find((f) => near(f.stars[0], px, py)) ?? null) : null;
    // The figure with any star under the pointer: what a tap opens.
    const starAt = (px: number, py: number) =>
      region === 'projects' ? (figures.find((f) => f.stars.some((s) => near(s, px, py))) ?? null) : null;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      interactedRef.current = true;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        setDragging(true);
        moved.current = false;
        startX = event.clientX;
        startY = event.clientY;
        lastAt = event.timeStamp;
        vx = 0;
        vy = 0;
        stop();
        const f = figureAt(event.clientX, event.clientY);
        traceRef.current = f ? { id: f.id, index: 0 } : null;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        moved.current = true;
        // A second finger turns a trace into a pinch.
        traceRef.current = null;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && pointers.size === 0) {
        // Over a label, its own enter and leave decide.
        if (event.target instanceof Element && event.target.closest('[data-region-labels] button')) return;
        const [wx, wy] = toWorld(cameraRef.current, viewport(), event.clientX, event.clientY);
        setHover(hitRegion(REGIONS, wx, wy, Math.max(130, 44 / cameraRef.current.zoom))?.id ?? null);
        return;
      }
      const p = pointers.get(event.pointerId);
      if (!p) return;
      const dx = event.clientX - p.x;
      const dy = event.clientY - p.y;
      p.x = event.clientX;
      p.y = event.clientY;
      // A third finger neither pans nor pinches.
      if (pointers.size > 2) return;

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) {
          cameraRef.current = zoomAt(cameraRef.current, viewport(), (a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch);
        }
        pinch = dist;
        commit();
        return;
      }
      const far = Math.hypot(event.clientX - startX, event.clientY - startY) >= DRAG_PX;
      const traced = traceRef.current;
      if (traced) {
        // A trace never pans; a jitter under DRAG_PX still lets the release count as a tap.
        if (far) moved.current = true;
        const f = figures.find((fig) => fig.id === traced.id)!;
        const view = viewport();
        const points = f.stars.map(([x, y]) => toScreen(cameraRef.current, view, x, y));
        traced.index = traceStep(points, traced.index, event.clientX, event.clientY);
        if (traced.index === points.length - 1) {
          focusProject(f.id);
          traceRef.current = null;
        }
        paintRef.current();
        return;
      }
      if (!moved.current && !far) return;
      moved.current = true;
      cameraRef.current = panBy(cameraRef.current, dx, dy);
      const dt = Math.max(1, event.timeStamp - lastAt);
      lastAt = event.timeStamp;
      vx = dx / dt;
      vy = dy / dt;
      commit();
    };

    const onUp = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) return;
      // Back to two fingers (or one): the next move starts a fresh pinch instead of jumping.
      if (pointers.size <= 2) pinch = 0;
      if (pointers.size > 0) return;
      setDragging(false);
      traceRef.current = null;
      if (!moved.current) {
        const star = starAt(event.clientX, event.clientY);
        if (star) {
          focusProject(star.id);
          return;
        }
        // A tap: open the constellation under it, with a finger-sized reach on a small screen.
        const [wx, wy] = toWorld(cameraRef.current, viewport(), event.clientX, event.clientY);
        const hit = hitRegion(REGIONS, wx, wy, Math.max(130, 44 / cameraRef.current.zoom));
        if (hit) open(hit.id);
        return;
      }
      // Coast only if the finger was still moving when it lifted, and only where motion is welcome.
      if (animatedRef.current && event.timeStamp - lastAt <= 80) {
        const speed = Math.hypot(vx, vy);
        const scale = speed > MAX_COAST ? MAX_COAST / speed : 1;
        motionRef.current.vx = vx * scale;
        motionRef.current.vy = vy * scale;
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      interactedRef.current = true;
      if (!event.ctrlKey) {
        // A plain wheel walks the sections; the region change flies the camera.
        const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
        stepperRef.current?.push(event.deltaY * scale, event.timeStamp);
        return;
      }
      // Ctrl+wheel, which is also how a trackpad pinch arrives. A pinch sends small deltas and a
      // mouse notch sends about 100, so the delta is clamped: a notch zooms by about a third.
      stop();
      cameraRef.current = zoomAt(
        cameraRef.current,
        viewport(),
        event.clientX,
        event.clientY,
        Math.exp(-Math.max(-30, Math.min(30, event.deltaY)) * 0.01),
      );
      commit();
    };

    const onLeave = () => setHover(null);

    const onKey = (event: KeyboardEvent) => {
      interactedRef.current = true;
      if (event.key === 'PageDown' || event.key === 'PageUp') {
        event.preventDefault();
        stepRef.current(event.key === 'PageDown' ? 1 : -1);
        return;
      }
      const steps: Record<string, [number, number]> = {
        ArrowLeft: [KEY_STEP, 0],
        ArrowRight: [-KEY_STEP, 0],
        ArrowUp: [0, KEY_STEP],
        ArrowDown: [0, -KEY_STEP],
      };
      const view = viewport();
      if (event.key in steps) {
        stop();
        cameraRef.current = panBy(cameraRef.current, ...steps[event.key]);
      } else if (event.key === '+' || event.key === '=') {
        cameraRef.current = zoomAt(cameraRef.current, view, view.w / 2, view.h / 2, 1.2);
      } else if (event.key === '-') {
        cameraRef.current = zoomAt(cameraRef.current, view, view.w / 2, view.h / 2, 1 / 1.2);
      } else if (event.key === '0') {
        flyTo(overviewCamera(view));
        return;
      } else {
        return;
      }
      event.preventDefault();
      commit();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('keydown', onKey);
    el.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [
    mode,
    region,
    projects,
    open,
    flyTo,
    focusProject,
    setHover,
    cameraRef,
    motionRef,
    paintRef,
    layoutRef,
    animatedRef,
    traceRef,
    interactedRef,
  ]);

  if (mode !== 'map') return null;

  const reveal = (r: Region) => {
    const [x, y] = toScreen(cameraRef.current, viewport(), r.x, r.y);
    const { w, h } = viewport();
    if (x < 0 || x > w || y < 56 || y > h) flyTo({ ...cameraRef.current, x: r.x, y: r.y });
  };

  const cursor = dragging ? 'cursor-grabbing' : hovered ? 'cursor-pointer' : 'cursor-grab';

  return (
    <>
      <div
        ref={surface}
        data-map-surface
        tabIndex={-1}
        className={`fixed inset-0 z-0 touch-none outline-none ${cursor}`}
      >
        <div
          data-region-labels
          inert={region !== null}
          onClickCapture={(event) => {
            // The release of a drag is not a click on whatever label it ended over.
            // detail is 0 for Enter or Space, which must still open a label after an earlier drag.
            if (moved.current && event.detail > 0) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          {REGIONS.map((r) => (
            <button
              key={r.id}
              ref={(el) => {
                if (el) labels.current.set(r.id, el);
                else labels.current.delete(r.id);
              }}
              type="button"
              onClick={() => open(r.id)}
              onFocus={() => reveal(r)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setHover(r.id);
              }}
              onPointerLeave={() => setHover(null)}
              className="absolute top-0 left-0 inline-flex min-h-11 flex-col items-center justify-center rounded-full bg-void/80 px-3 font-mono text-xs tracking-[0.14em] text-primary uppercase"
            >
              {sections.find((s) => s.id === r.id)?.label ?? r.id}
              {hovered === r.id && (
                // Out of the accessible name, which stays the section's label.
                <span aria-hidden="true" className="block text-[10px] tracking-normal text-muted normal-case">
                  {sections.find((s) => s.id === r.id)?.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {region === null && (
        // Outside the surface, so its press is never also a tap on the sky beneath it.
        <button
          type="button"
          onClick={() => step(1)}
          className="fixed bottom-4 left-4 z-20 inline-flex min-h-11 items-center rounded-full border border-edge bg-void px-4 text-sm font-medium text-primary hover:border-primary"
        >
          {t.mapStart} ↓
        </button>
      )}
    </>
  );
}
