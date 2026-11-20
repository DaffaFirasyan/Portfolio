import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { prepareSound, playStamp } from './sound';
import { loadSound, loadStamps, saveSound, saveStamps, type StampId } from './stamps';

interface Passport {
  stamps: readonly StampId[];
  earn: (id: StampId) => void;
  has: (id: string) => boolean;
  /** The stamp earned in the last few seconds, for the press animation and the live region. */
  justEarned: StampId | null;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
}

const INERT: Passport = {
  stamps: [],
  earn: () => {},
  has: () => false,
  justEarned: null,
  soundOn: false,
  setSoundOn: () => {},
};

const Context = createContext<Passport>(INERT);

/**
 * The reader's stamps. Progress is a list of ids in localStorage; nothing about
 * the reader is stored. Like SkillHighlight it is inert outside a provider, so
 * any section can render on its own in a test.
 */
export function PassportProvider({ children }: { children: ReactNode }) {
  const [stamps, setStamps] = useState<StampId[]>(loadStamps);
  const [justEarned, setJustEarned] = useState<StampId | null>(null);
  const [soundOn, setSound] = useState<boolean>(loadSound);

  // Read inside callbacks so `earn` stays stable and a double-fired observer cannot stamp twice.
  const owned = useRef(stamps);
  const sounding = useRef(soundOn);

  const earn = useCallback((id: StampId) => {
    if (owned.current.includes(id)) return;
    owned.current = [...owned.current, id];
    setStamps(owned.current);
    setJustEarned(id);
    saveStamps(owned.current);
    if (typeof navigator.vibrate === 'function') navigator.vibrate(30);
    if (sounding.current) playStamp();
  }, []);

  const setSoundOn = useCallback((on: boolean) => {
    sounding.current = on;
    setSound(on);
    saveSound(on);
    if (on) prepareSound();
  }, []);

  useEffect(() => {
    if (!justEarned) return;
    const timer = setTimeout(() => setJustEarned(null), 4000);
    return () => clearTimeout(timer);
  }, [justEarned]);

  const value = useMemo<Passport>(
    () => ({
      stamps,
      earn,
      has: (id) => (stamps as readonly string[]).includes(id),
      justEarned,
      soundOn,
      setSoundOn,
    }),
    [stamps, earn, justEarned, soundOn, setSoundOn],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePassport(): Passport {
  return useContext(Context);
}
