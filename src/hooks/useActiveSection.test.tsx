import { act, renderHook } from '@testing-library/react';

import { observers } from '@/test/stubs';

import { useActiveSection } from './useActiveSection';

const SECTIONS = [
  { id: 'home', label: 'Home', index: 0 },
  { id: 'about', label: 'About', index: 1 },
];

function mountSections() {
  document.body.innerHTML = SECTIONS.map((s) => `<section id="${s.id}"></section>`).join('');
}

describe('useActiveSection', () => {
  beforeEach(() => {
    mountSections();
    observers.length = 0;
    history.replaceState(null, '', '/');
  });

  it('starts on the first section', () => {
    const { result } = renderHook(() => useActiveSection(SECTIONS));
    expect(result.current.activeId).toBe('home');
    expect(result.current.progress).toBe(0);
  });

  it('observes every section that exists in the document', () => {
    renderHook(() => useActiveSection(SECTIONS));
    expect(observers.at(-1)!.targets.size).toBe(2);
  });

  it('follows the most visible section', () => {
    const { result } = renderHook(() => useActiveSection(SECTIONS));

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('home')!, intersectionRatio: 0.1 },
        { target: document.getElementById('about')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(result.current.activeId).toBe('about');
  });

  it('writes the active section to the url without adding history entries', () => {
    const before = history.length;
    const { result } = renderHook(() => useActiveSection(SECTIONS));

    act(() => {
      observers.at(-1)!.emit([
        { target: document.getElementById('about')!, intersectionRatio: 0.9 },
      ]);
    });

    expect(result.current.activeId).toBe('about');
    expect(window.location.hash).toBe('#about');
    expect(history.length).toBe(before);
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(SECTIONS));
    expect(observers.length).toBe(1);
    unmount();
    expect(observers.length).toBe(0);
  });
});
