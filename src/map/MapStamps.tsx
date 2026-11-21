import { useEffect, useRef } from 'react';

import { usePassport } from '@/passport/PassportProvider';
import { DWELL_MS, type StampId } from '@/passport/stamps';
import { useView } from './ViewProvider';

/**
 * The reading rule for Map mode, which has no scrolling to measure: a region is
 * stamped once its panel has been open for five seconds in total and the reader
 * then leaves it (closes it, opens another, or switches to Reading mode). The
 * overview counts as "home". A hop through the map earns nothing.
 */
export default function MapStamps() {
  const { mode, region } = useView();
  const { earn } = usePassport();
  const spent = useRef<Record<string, number>>({});

  useEffect(() => {
    if (mode !== 'map') return;
    const id: StampId = region ?? 'home';
    const book = spent.current;
    const start = Date.now();
    return () => {
      book[id] = (book[id] ?? 0) + Date.now() - start;
      if (book[id] >= DWELL_MS) earn(id);
    };
  }, [mode, region, earn]);

  return null;
}
