import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';

import {
  FLY_MS,
  REGION_IDS,
  overviewCamera,
  stepFrom,
  type Camera,
  type Motion,
  type RegionId,
} from './mapEngine';

export type Mode = 'map' | 'read';
export const VIEW_KEY = 'daffa_view';

interface View {
  mode: Mode;
  /** False when there is no 2D canvas: the map cannot draw, so the page is always Reading. */
  canMap: boolean;
  setMode: (mode: Mode) => void;
  /** The constellation whose section is open in the panel, from the URL hash. */
  region: RegionId | null;
  open: (id: RegionId) => void;
  close: () => void;
  /** Go to the next (1) or previous (-1) section; the overview comes before About. */
  step: (dir: 1 | -1) => void;
  /** Move the camera: a flight where motion is allowed, a cut where it is not. */
  flyTo: (target: Camera) => void;
  camera: MutableRefObject<Camera>;
  motion: MutableRefObject<Motion>;
  /** Set by the sky: repaint a still frame. */
  paint: MutableRefObject<() => void>;
  /** Set by the map: put the region labels where the camera says. */
  layout: MutableRefObject<() => void>;
  /** Set by the sky: false in the still tier, where the camera cuts instead of flying. */
  animated: MutableRefObject<boolean>;
  /** The figure being traced by a drag: which project and the last star reached. */
  trace: MutableRefObject<{ id: string; index: number } | null>;
  /** Scroll a project's card into view in the panel. */
  focusProject: (id: string) => void;
  /** Set by the map once the visitor has touched it: the constellations stop pulsing. */
  interacted: MutableRefObject<boolean>;
  /** Set by the map: the constellation under the pointer, which the sky brightens. */
  hover: MutableRefObject<RegionId | null>;
}

const INERT: View = {
  mode: 'read',
  canMap: false,
  setMode: () => {},
  region: null,
  open: () => {},
  close: () => {},
  step: () => {},
  flyTo: () => {},
  camera: { current: { x: 1500, y: 1000, zoom: 1 } },
  motion: { current: { vx: 0, vy: 0, fly: null } },
  paint: { current: () => {} },
  layout: { current: () => {} },
  animated: { current: true },
  trace: { current: null },
  focusProject: () => {},
  interacted: { current: false },
  hover: { current: null },
};

const Context = createContext<View>(INERT);

function canvasSupported(): boolean {
  try {
    return document.createElement('canvas').getContext('2d') !== null;
  } catch {
    return false;
  }
}

function loadMode(): Mode {
  try {
    return localStorage.getItem(VIEW_KEY) === 'read' ? 'read' : 'map';
  } catch {
    return 'map';
  }
}

export function regionFromHash(hash: string): RegionId | null {
  const id = hash.replace(/^#/, '');
  return (REGION_IDS as readonly string[]).includes(id) ? (id as RegionId) : null;
}

/**
 * Which way the page is read: as a map you move through, or as the plain page.
 * The open region lives in the URL hash, so a link, a reload and the Back button
 * all work. Like SkillHighlight and the passport it is inert outside a provider.
 */
export function ViewProvider({ children }: { children: ReactNode }) {
  const [canMap] = useState(canvasSupported);
  const [mode, setModeState] = useState<Mode>(() => (canMap ? loadMode() : 'read'));
  const [region, setRegion] = useState<RegionId | null>(() => regionFromHash(window.location.hash));
  const camera = useRef<Camera>(overviewCamera({ w: window.innerWidth, h: window.innerHeight }));
  const motion = useRef<Motion>({ vx: 0, vy: 0, fly: null });
  const paint = useRef(() => {});
  const layout = useRef(() => {});
  const animated = useRef(true);
  const trace = useRef<{ id: string; index: number } | null>(null);
  const interacted = useRef(false);
  const hover = useRef<RegionId | null>(null);
  const scrollTo = useRef<string | null>(null);

  useEffect(() => {
    const sync = () => setRegion(regionFromHash(window.location.hash));
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  // The map is one screen: nothing behind it should scroll.
  useEffect(() => {
    if (mode !== 'map') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  // Leaving the map with a panel open lands the reader on that section.
  useEffect(() => {
    if (mode === 'read' && scrollTo.current) {
      document.getElementById(scrollTo.current)?.scrollIntoView();
      scrollTo.current = null;
    }
  }, [mode]);

  const flyTo = useCallback((target: Camera) => {
    if (animated.current) {
      motion.current = {
        vx: 0,
        vy: 0,
        fly: { from: { ...camera.current }, to: target, at: performance.now(), ms: FLY_MS },
      };
    } else {
      motion.current = { vx: 0, vy: 0, fly: null };
      camera.current = target;
      paint.current();
    }
  }, []);

  const focusProject = useCallback((id: string) => {
    document.getElementById(`project-${id}`)?.scrollIntoView({
      behavior: animated.current ? 'smooth' : 'auto',
      block: 'start',
    });
  }, []);

  const open = useCallback((id: RegionId) => {
    setRegion(id);
    if (window.location.hash !== `#${id}`) window.location.hash = id;
  }, []);

  const close = useCallback(() => {
    setRegion(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = stepFrom(region, dir);
      if (next === region) return;
      if (next) open(next);
      else close();
    },
    [region, open, close],
  );

  const setMode = useCallback(
    (next: Mode) => {
      if (next === 'map' && !canMap) return;
      try {
        localStorage.setItem(VIEW_KEY, next);
      } catch {
        // Storage is blocked: the choice lasts for this visit.
      }
      if (next === 'read') scrollTo.current = region;
      else setRegion(regionFromHash(window.location.hash));
      setModeState(next);
    },
    [canMap, region],
  );

  const value = useMemo<View>(
    () => ({ mode, canMap, setMode, region, open, close, step, flyTo, camera, motion, paint, layout, animated, trace, focusProject, interacted, hover }),
    [mode, canMap, setMode, region, open, close, step, flyTo, focusProject],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useView(): View {
  return useContext(Context);
}
