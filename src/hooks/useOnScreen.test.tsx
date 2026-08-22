import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { observers } from '@/test/stubs';
import { useOnScreen } from './useOnScreen';

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);
  return (
    <div ref={ref} data-testid="probe">
      {onScreen ? 'visible' : 'hidden'}
    </div>
  );
}

/** Tell the component's observer that its target left, or re-entered, the viewport. */
function report(isIntersecting: boolean) {
  const record = observers.at(-1);
  if (!record) throw new Error('nothing registered an IntersectionObserver');
  const target = [...record.targets][0];
  // Wrapped in act because the callback sets state synchronously.
  act(() => {
    record.emit([{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
  });
}

describe('useOnScreen', () => {
  beforeEach(() => {
    observers.length = 0;
  });

  it('starts visible, so a browser that never reports back does not hide the content', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('visible');
  });

  it('observes the element the ref points at', () => {
    render(<Probe />);
    expect(observers).toHaveLength(1);
    expect([...observers[0].targets][0]).toBe(screen.getByTestId('probe'));
  });

  it('goes hidden when the element leaves the viewport', () => {
    render(<Probe />);
    report(false);
    expect(screen.getByTestId('probe')).toHaveTextContent('hidden');
  });

  it('comes back when the element returns', () => {
    render(<Probe />);
    report(false);
    expect(screen.getByTestId('probe')).toHaveTextContent('hidden');

    report(true);
    expect(screen.getByTestId('probe')).toHaveTextContent('visible');
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    expect(observers).toHaveLength(1);
    unmount();
    expect(observers).toHaveLength(0);
  });
});
