/**
 * jsdom 29 implements none of IntersectionObserver, ResizeObserver, matchMedia
 * or scrollIntoView, and every getBoundingClientRect() returns zeroes. These
 * stubs exist so components that watch scrolling can render at all.
 *
 * They are observable rather than silent. Since jsdom computes no layout, a
 * real observer would never fire, so the only way to exercise observer wiring
 * is for a test to emit entries by hand — which is what `observers` is for.
 */
export interface FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
  emit: (entries: Array<Partial<IntersectionObserverEntry> & { target: Element }>) => void;
}

export const observers: FakeIntersectionObserver[] = [];

class StubIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  // TypeScript 6.0's lib.dom.d.ts requires scrollMargin; without it this class
  // does not satisfy `implements IntersectionObserver`.
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  private record: FakeIntersectionObserver;

  constructor(callback: IntersectionObserverCallback) {
    this.record = {
      callback,
      targets: new Set(),
      emit: (entries) => {
        callback(entries as IntersectionObserverEntry[], this);
      },
    };
    observers.push(this.record);
  }

  observe(target: Element) {
    this.record.targets.add(target);
  }

  unobserve(target: Element) {
    this.record.targets.delete(target);
  }

  disconnect() {
    this.record.targets.clear();
    const at = observers.indexOf(this.record);
    if (at >= 0) observers.splice(at, 1);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class StubResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver =
  StubIntersectionObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

Element.prototype.scrollIntoView = function scrollIntoView() {};

/**
 * jsdom 29 defines HTMLDialogElement but implements neither showModal nor
 * close, so anything built on the native dialog cannot even render in a test.
 *
 * This stub tracks `open` and fires `close`, which is enough to exercise the
 * wiring around a dialog. It traps no focus and makes nothing inert — those are
 * the parts only a real browser can be trusted with, and they are checked
 * there rather than here.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(
    this: HTMLDialogElement,
    returnValue?: string,
  ) {
    if (!this.open) return;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event('close'));
  };
}

/**
 * jsdom implements no SVG text metrics, so `getComputedTextLength` is missing
 * and anything laying text along a path throws on mount.
 *
 * It returns a plausible width rather than zero on purpose. Components gate
 * their real markup on a measured length being greater than zero, so a zero
 * would render an empty shell and the test would be asserting against nothing.
 */
if (typeof SVGElement !== 'undefined') {
  const proto = SVGElement.prototype as unknown as {
    getComputedTextLength?: () => number;
  };

  if (!proto.getComputedTextLength) {
    proto.getComputedTextLength = function getComputedTextLength(this: SVGElement) {
      return Math.max((this.textContent ?? '').length * 10, 1);
    };
  }
}

/**
 * jsdom implements no FontFaceSet, so `document.fonts` is undefined. Text
 * animations wait on it before measuring, because splitting a heading into
 * characters against a fallback font produces the wrong glyph widths.
 *
 * Reporting 'loaded' lets those components take their already-ready path
 * instead of awaiting a promise that would never settle.
 */
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      status: 'loaded',
      ready: Promise.resolve(),
      check: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  });
}
