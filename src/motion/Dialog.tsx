import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { useLenis } from '@/hooks/useLenis';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Announced as the dialog's name, so it is clear what opened. */
  label: string;
  children: ReactNode;
}

/**
 * The modal shell, built on the native dialog element.
 *
 * `showModal()` traps focus, handles Escape, and makes the rest of the page
 * inert — three things that are a hundred lines of subtle code to write by
 * hand and are usually written subtly wrong. What the platform does not do is
 * added here: handing focus back to whatever opened the dialog, and stopping
 * the smooth-scroll engine so the page does not drift behind it.
 *
 * It reads no motion capability. A dialog that refuses to open because someone
 * asked for less motion is broken, not considerate.
 */
export default function Dialog({ open, onClose, label, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const { stop, start } = useLenis();

  const handleNativeClose = useCallback(() => {
    // Only report a close the owner does not already know about. The cleanup
    // below closes the element after `open` is already false, and calling back
    // then would set state during teardown for no reason.
    //
    // This reads `open` from the closure rather than a ref deliberately:
    // writing a ref during render breaks under concurrent rendering, and the
    // listener effect below simply re-subscribes when `open` changes.
    if (open) onClose();
  }, [open, onClose]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('close', handleNativeClose);
    return () => element.removeEventListener('close', handleNativeClose);
  }, [handleNativeClose]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !open) return;

    trigger.current = document.activeElement as HTMLElement | null;
    element.showModal();
    stop();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Runs when `open` goes false and on unmount, so both paths restore the
    // page and the reader's place in it.
    return () => {
      if (element.open) element.close();
      start();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
      trigger.current = null;
    };
  }, [open, stop, start]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      // `m-auto` is load-bearing. The UA stylesheet centres a modal dialog with
      // `margin: auto`, and Tailwind's preflight resets margin to 0 on every
      // element — which pins the dialog to the top-left corner of the viewport.
      //
      // One scroll container, on the dialog itself. Nesting a second one inside
      // gives two scrollbars that fight each other. The scrollbar is coloured
      // because the browser default is a pale bar on a near-black surface.
      className="m-auto max-h-[85vh] w-[min(48rem,92vw)] overflow-y-auto rounded-xl border border-edge bg-surface p-0 text-primary [scrollbar-color:var(--color-edge)_transparent] [scrollbar-width:thin] backdrop:bg-void/80 backdrop:backdrop-blur-sm"
    >
      {/* Children only exist while open. Keeping them mounted would leave
          fourteen full-size certificate images in the document waiting for a
          click that may never come. */}
      {open && children}
    </dialog>
  );
}
