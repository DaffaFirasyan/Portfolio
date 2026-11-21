import { useEffect, useRef } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { scrollProgress } from '@/lib/scroll';
import { cssToken } from '@/lib/token';
import { REGIONS, WORLD, projectFigures, stepCamera, toScreen, type Camera } from '@/map/mapEngine';
import { useView } from '@/map/ViewProvider';
import { usePassport } from '@/passport/PassportProvider';
import { TOTAL, initialsOf } from '@/passport/stamps';
import {
  LAYER_SPEED,
  cometPosition,
  makeStars,
  medianOf,
  nextCometDelay,
  nextTier,
  pathFor,
  startTier,
  withAlpha,
  type Star,
  type Tier,
} from './engine';

const STAR_COUNT = 150;
const TRAIL_MS = 600;
const COMET_MS = 4500;
const FIRST_COMET_MS = 15000;
/** A frame costing more than this in drawing cannot hold 60 fps on a mid device. */
const WORK_LIMIT_MS = 8;
const WINDOW = 60;
const MAP_PARALLAX = [1, 0.55, 0.25] as const;

const wrap = (value: number, size: number) => ((value % size) + size) % size;

interface Live {
  projectIds: string[];
  lit: string[];
  finale: boolean;
  initials: string;
  map: boolean;
  region: string | null;
  redraw: () => void;
}

/** The owner's initials as a field of dots: set in a big serif, then sampled on a grid. */
function initialsDots(text: string): Array<[number, number]> {
  const W = 480;
  const H = 220;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d');
  if (!octx) return [];
  octx.font = `700 ${H * 0.95}px Georgia, serif`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillText(text, W / 2, H / 2);
  const { data } = octx.getImageData(0, 0, W, H);
  const dots: Array<[number, number]> = [];
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      if (data[(y * W + x) * 4 + 3] > 128) dots.push([x / W, y / H]);
    }
  }
  return dots;
}

/**
 * The sky behind the whole page: three layers of stars that drift under scroll,
 * give way to the pointer, join into a project's constellation when a skill that
 * project used is hovered, warm towards dawn as the page is read, and now and
 * then let a comet cross. One canvas, one loop, no library. In Map mode the stars
 * are placed through a camera instead of the scroll offset, six constellations are
 * drawn, and the camera is stepped in the same loop.
 *
 * It looks after the device it is on. The drawing work of the first sixty frames
 * is timed (the work, not the gap between frames, so a browser that caps frames
 * at 30 Hz to save battery is not punished), and a slow median steps it down from full to lite (half the stars, thirty frames a
 * second, no trail, no comet) and then to still (one frame, redrawn only when
 * something changes). Reduced motion starts it still. It never steps back up,
 * and it stops while the tab is hidden.
 */
export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cometRef = useRef<HTMLButtonElement>(null);
  const { projects, profile, t } = useLanguage();
  const { isHighlighted } = useSkillHighlight();
  const { earn, stamps } = usePassport();
  const view = useView();
  // Named *Ref so the React compiler lets the loop write them.
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
  const map = view.mode === 'map';
  const region = view.region;

  const lit = projects
    .filter((project) => isHighlighted(project.id))
    .map((project) => project.id)
    .join(',');
  const initials = initialsOf(profile.name);
  const finale = stamps.length === TOTAL;

  // The loop reads these live instead of restarting whenever one changes.
  const live = useRef<Live>({ projectIds: [], lit: [], finale: false, initials: '', map: false, region: null, redraw: () => {} });

  useEffect(() => {
    live.current.projectIds = projects.map((project) => project.id);
    live.current.lit = lit ? lit.split(',') : [];
    live.current.finale = finale;
    live.current.initials = initials;
    live.current.map = map;
    live.current.region = region;
    live.current.redraw();
  }, [projects, lit, finale, initials, map, region]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cometButton = cometRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !cometButton || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let tier: Tier = startTier({
      reducedMotion: reduced.matches,
      saveData: connection?.saveData === true,
    });
    animatedRef.current = tier !== 'still';

    const stars: Star[] = makeStars(STAR_COUNT);
    const paths = new Map(live.current.projectIds.map((id) => [id, pathFor(id, stars)]));
    const projectsRegion = REGIONS.find((r) => r.id === 'projects')!;
    const figures = projectFigures(live.current.projectIds, projectsRegion);
    const reveal = new Map<string, number>();
    const pointer = { x: -9999, y: -9999 };
    const trail: Array<{ x: number; y: number; at: number }> = [];
    const costs: number[] = [];
    let measuring = true;
    let flight: { x0: number; y0: number; x1: number; y1: number; at: number } | null = null;
    let nextComet = FIRST_COMET_MS;
    let dots: Array<[number, number]> | null = null;
    let colors = readColors();
    let w = 0;
    let h = 0;
    let scrollY = window.scrollY;
    let progress = 0;
    let raf = 0;
    let last = 0;
    let frame = 0;
    let queued = false;
    let soon = 0;
    // The camera the labels were last placed for; null so the first frame places them.
    let laidOut: Camera | null = null;
    // The same object the live-sync effect writes to; copied so the cleanup provably clears this one.
    const state = live.current;

    function readColors() {
      return {
        ink: cssToken('--color-primary'),
        accent: cssToken('--color-accent'),
        // Dark dots on pale paper read harder than light dots on a night sky.
        dim: dark.matches ? 1 : 0.55,
      };
    }

    const measure = () => {
      scrollY = window.scrollY;
      progress = scrollProgress(scrollY, document.documentElement.scrollHeight, window.innerHeight);
    };

    // Forced: used at start and whenever the tier changes the pixel density.
    const size = () => {
      const dpr = tier === 'full' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const place = (s: Star): [number, number] => {
      if (state.map) {
        const cam = cameraRef.current;
        const p = MAP_PARALLAX[s.layer];
        // Never smaller than the screen, or a zoomed-out layer would wrap into a thin, repeated patch.
        const z = Math.max(1 + (cam.zoom - 1) * p, w / WORLD.w, h / WORLD.h);
        return [
          wrap(w / 2 + (s.x * WORLD.w - cam.x * p) * z, w),
          wrap(h / 2 + (s.y * WORLD.h - cam.y * p) * z, h),
        ];
      }
      let x = s.x * w;
      let y = (((s.y * h - scrollY * LAYER_SPEED[s.layer]) % h) + h) % h;
      if (tier === 'full' && pointer.x > -9000) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 120) {
          const k = ((1 - d / 120) * 18) / d;
          x += dx * k;
          y += dy * k;
        }
      }
      return [x, y];
    };

    const endComet = (now: number) => {
      // Hiding a focused button would drop focus to <body>; hand it to the passport chip.
      if (document.activeElement === cometButton) {
        document.querySelector<HTMLElement>('[data-passport-chip]')?.focus();
      }
      flight = null;
      cometButton.hidden = true;
      nextComet = now + nextCometDelay(Math.random);
    };

    const step = (now: number, dt: number) => {
      for (const id of paths.keys()) {
        const target = live.current.lit.includes(id) ? 1 : 0;
        const current = reveal.get(id) ?? 0;
        reveal.set(id, tier === 'still' ? target : current + (target - current) * Math.min(1, dt / 220));
      }
      while (trail.length && now - trail[0].at > TRAIL_MS) trail.shift();
      if (state.map) {
        cameraRef.current = stepCamera(cameraRef.current, motionRef.current, now, dt);
        // The labels move only with the camera; a still paint (dt 0) always places them, since a cut relies on it.
        if (cameraRef.current !== laidOut || dt === 0) {
          laidOut = cameraRef.current;
          layoutRef.current();
        }
      }
      if (tier !== 'full') return;

      if (!flight && now >= nextComet) {
        const x0 = w * (0.55 + Math.random() * 0.4);
        // Below the 56 px navbar, so the catchable head never sits under it.
        const y0 = h * 0.12 + 56 + Math.random() * h * 0.1;
        flight = { x0, y0, x1: x0 - w * 0.45, y1: y0 + h * 0.35, at: now };
        cometButton.hidden = false;
      }
      if (flight) {
        const p = (now - flight.at) / COMET_MS;
        if (p >= 1) {
          endComet(now);
        } else {
          const head = cometPosition(flight, p);
          cometButton.style.transform = `translate(${head.x - 24}px, ${head.y - 24}px)`;
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // Dawn: the lower sky warms as the page is read, a flat band and no glow.
      if (progress > 0) {
        const band = ctx.createLinearGradient(0, h * 0.55, 0, h);
        band.addColorStop(0, withAlpha(colors.accent, 0));
        band.addColorStop(1, withAlpha(colors.accent, 0.14 * progress));
        ctx.fillStyle = band;
        ctx.fillRect(0, h * 0.55, w, h * 0.45);
      }

      const spots: Array<[number, number]> = [];
      ctx.fillStyle = colors.ink;
      stars.forEach((s, i) => {
        const pos = place(s);
        spots[i] = pos;
        if (tier === 'lite' && i % 2) return;
        const twinkle = tier === 'full' ? 0.7 + 0.3 * Math.sin(now / 1100 + s.phase) : 1;
        ctx.globalAlpha = (0.55 - s.layer * 0.12) * twinkle * colors.dim;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (state.map) {
        const cam = cameraRef.current;
        const reach = Math.min(1.6, Math.sqrt(cam.zoom));
        ctx.lineWidth = 1;
        const showProjects = state.region === 'projects';
        // Until the first touch the figures breathe, to say they can be picked; full tier only.
        const pulse = !interactedRef.current && tier === 'full' && state.region === null;
        const rest = pulse ? 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(now / 650)) : 0.5;
        for (const r of REGIONS) {
          // Open, the Projects region gives way to one small figure per project.
          if (showProjects && r.id === 'projects') continue;
          const active = state.region === r.id || hoverRef.current === r.id;
          const points = r.stars.map(([dx, dy]) => toScreen(cam, { w, h }, r.x + dx, r.y + dy));
          ctx.strokeStyle = active ? colors.accent : colors.ink;
          ctx.fillStyle = active ? colors.accent : colors.ink;
          ctx.globalAlpha = active ? 0.9 : rest * colors.dim;
          ctx.beginPath();
          points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
          for (const [x, y] of points) {
            ctx.beginPath();
            ctx.arc(x, y, 2.4 * reach, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (showProjects) {
          // Every figure is drawn faint in ink; lit by a skill it is all accent, traced it is accent up to the star reached.
          const line = (points: Array<[number, number]>) => {
            ctx.beginPath();
            points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.stroke();
          };
          for (const f of figures) {
            const traced = traceRef.current?.id === f.id ? traceRef.current.index : -1;
            const points = f.stars.map(([x, y]) => toScreen(cam, { w, h }, x, y));
            const bright = state.lit.includes(f.id) ? points.length - 1 : traced;
            ctx.strokeStyle = colors.ink;
            ctx.fillStyle = colors.ink;
            ctx.globalAlpha = 0.35 * colors.dim;
            if (bright < points.length - 1) line(points);
            ctx.globalAlpha = 0.5 * colors.dim;
            points.forEach(([x, y], i) => {
              if (i <= bright) return;
              ctx.beginPath();
              ctx.arc(x, y, 3 * reach, 0, Math.PI * 2);
              ctx.fill();
            });
            if (bright < 0) continue;
            ctx.strokeStyle = colors.accent;
            ctx.fillStyle = colors.accent;
            ctx.globalAlpha = 0.95;
            line(points.slice(0, bright + 1));
            points.slice(0, bright + 1).forEach(([x, y]) => {
              ctx.beginPath();
              ctx.arc(x, y, 3 * reach, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 1;
      if (!state.map) {
        for (const [id, path] of paths) {
          const amount = reveal.get(id) ?? 0;
          if (amount <= 0.01) continue;
          const points = path.map((i) => spots[i]);
          const reach = amount * (points.length - 1);
          ctx.globalAlpha = 0.7 * Math.min(1, amount * 2);
          ctx.beginPath();
          for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i];
            const [x1, y1] = points[i + 1];
            const fraction = Math.min(1, reach - i);
            if (fraction <= 0) break;
            // A star that wrapped past the edge would draw a line across the screen.
            if (Math.hypot(x1 - x0, y1 - y0) > h * 0.6) continue;
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + (x1 - x0) * fraction, y0 + (y1 - y0) * fraction);
          }
          ctx.stroke();
          points.forEach(([x, y], i) => {
            if (i > reach) return;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      if (tier === 'full' && !state.map) {
        for (const p of trail) {
          const age = now - p.at;
          if (age > TRAIL_MS) continue;
          ctx.globalAlpha = 0.5 * (1 - age / TRAIL_MS);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (flight) {
        const p = (now - flight.at) / COMET_MS;
        const head = cometPosition(flight, p);
        const tail = cometPosition(flight, Math.max(0, p - 0.12));
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
      }

      // The reward for a full passport: the owner's initials, written in stars.
      if (live.current.finale) {
        dots ??= initialsDots(live.current.initials);
        const boxW = Math.min(w * 0.8, 560);
        const boxH = boxW * (220 / 480);
        ctx.fillStyle = colors.accent;
        for (const [dx, dy] of dots) {
          ctx.globalAlpha = tier === 'full' ? 0.3 + 0.15 * Math.sin(now / 900 + dx * 9) : 0.35;
          ctx.beginPath();
          ctx.arc(w / 2 - boxW / 2 + dx * boxW, h * 0.38 - boxH / 2 + dy * boxH, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const paintStill = () => {
      const now = performance.now();
      step(now, 0);
      draw(now);
    };

    const paintStillSoon = () => {
      if (queued) return;
      queued = true;
      soon = requestAnimationFrame(() => {
        queued = false;
        if (tier === 'still') paintStill();
      });
    };

    // An arrow, not a hoisted declaration: TypeScript keeps the null-narrowing of cometButton only for these.
    const setTier = (next: Tier) => {
      tier = next;
      animatedRef.current = next !== 'still';
      if (next !== 'full' && flight) {
        flight = null;
        cometButton.hidden = true;
      }
      size();
      if (next === 'still') {
        cancelAnimationFrame(raf);
        raf = 0;
        // The still tier never steps the camera, so a flight in progress lands now.
        const fly = motionRef.current.fly;
        if (fly) {
          cameraRef.current = { ...fly.to };
          motionRef.current = { vx: 0, vy: 0, fly: null };
        }
        paintStill();
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // The first frame, and one after the tab came back (last reset or a long gap), is not a measurement of the device.
      const steady = last !== 0 && now - last < 200;
      const dt = last ? now - last : 16;
      last = now;
      frame++;
      if (tier === 'lite' && frame % 2) return;
      const start = performance.now();
      step(now, dt);
      draw(now);
      if (!measuring || !steady) return;
      costs.push(performance.now() - start);
      if (costs.length < WINDOW) return;
      const next = nextTier(tier, medianOf(costs), WORK_LIMIT_MS);
      costs.length = 0;
      // One window per tier: a tier that held stops being measured, a new one gets a fresh window.
      if (next === tier) measuring = false;
      else setTier(next);
    };

    const onScroll = () => {
      measure();
      if (tier === 'still') paintStillSoon();
    };
    const onResize = () => {
      // Mobile browsers resize the window as the address bar slides; on touch only a real change reallocates.
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      if (coarse && window.innerWidth === w && Math.abs(window.innerHeight - h) < 150) return;
      size();
      measure();
      if (tier === 'still') paintStill();
    };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (event.pointerType === 'mouse' && tier === 'full') {
        trail.push({ x: event.clientX, y: event.clientY, at: performance.now() });
        if (trail.length > 24) trail.shift();
      }
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onTheme = () => {
      colors = readColors();
      if (tier === 'still') paintStill();
    };
    const onReduced = () => {
      if (reduced.matches && tier !== 'still') setTier('still');
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (tier !== 'still' && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const onCatch = () => {
      earn('comet');
      endComet(performance.now());
    };

    live.current.redraw = () => {
      if (tier === 'still') paintStill();
    };
    paintRef.current = () => {
      if (tier === 'still') paintStillSoon();
    };

    size();
    measure();
    if (tier === 'still') paintStill();
    else raf = requestAnimationFrame(tick);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onLeave);
    window.addEventListener('pointercancel', onLeave);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    dark.addEventListener('change', onTheme);
    reduced.addEventListener('change', onReduced);
    cometButton.addEventListener('click', onCatch);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(soon);
      state.redraw = () => {};
      paintRef.current = () => {};
      cometButton.hidden = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onLeave);
      window.removeEventListener('pointercancel', onLeave);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      dark.removeEventListener('change', onTheme);
      reduced.removeEventListener('change', onReduced);
      cometButton.removeEventListener('click', onCatch);
    };
  }, [earn, cameraRef, motionRef, paintRef, layoutRef, animatedRef, traceRef, interactedRef, hoverRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      <button
        ref={cometRef}
        type="button"
        hidden
        aria-label={t.cometLabel}
        className="fixed top-0 left-0 z-30 h-12 w-12 rounded-full"
      />
    </>
  );
}
