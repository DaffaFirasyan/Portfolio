import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FocusGrid, FocusItem } from './FocusCards';

/**
 * Asserted here rather than in the browser pane, deliberately.
 *
 * React synthesises `mouseenter` from a bubbling `mouseover` plus
 * `relatedTarget` bookkeeping, and the pane cannot deliver that reliably — a
 * hand-dispatched `mouseover` there left every cell unblurred while the code
 * was working. Testing Library's `userEvent.hover` drives the real sequence.
 */
function grid() {
  return render(
    <FocusGrid className="grid">
      {['one', 'two', 'three'].map((name, i) => (
        <FocusItem key={name} index={i}>
          <button type="button">{name}</button>
        </FocusItem>
      ))}
    </FocusGrid>,
  );
}

/** The FocusItem wrapping a given cell's button. */
const cellOf = (name: string) => screen.getByRole('button', { name }).parentElement!;

describe('FocusCards', () => {
  it('leaves every cell alone until one is hovered', () => {
    grid();
    for (const name of ['one', 'two', 'three']) {
      expect(cellOf(name).className).toContain('opacity-100');
      expect(cellOf(name).className).not.toContain('blur-[1px]');
    }
  });

  it('softens every cell except the hovered one', async () => {
    const user = userEvent.setup();
    grid();

    await user.hover(screen.getByRole('button', { name: 'two' }));

    expect(cellOf('two').className, 'the hovered cell must stay sharp').toContain('blur-0');
    for (const other of ['one', 'three']) {
      expect(cellOf(other).className, `${other} should soften`).toContain('blur-[1px]');
      expect(cellOf(other).className).toContain('opacity-60');
    }
  });

  it('restores every cell when the pointer leaves', async () => {
    const user = userEvent.setup();
    grid();

    await user.hover(screen.getByRole('button', { name: 'two' }));
    await user.unhover(screen.getByRole('button', { name: 'two' }));

    for (const name of ['one', 'two', 'three']) {
      expect(cellOf(name).className).not.toContain('blur-[1px]');
    }
  });

  it('answers the keyboard too, not only the mouse', async () => {
    const user = userEvent.setup();
    grid();

    // Upstream is mouse-only. The grid is keyboard-navigable because every
    // cell holds a real button, so a keyboard reader should get the same
    // emphasis a pointer does rather than a grid that never reacts.
    await user.tab();
    expect(screen.getByRole('button', { name: 'one' })).toHaveFocus();
    expect(cellOf('two').className, 'focusing one cell should soften the rest').toContain(
      'blur-[1px]',
    );
  });

  it('changes only opacity, blur and transform, so nothing moves under the cursor', async () => {
    const user = userEvent.setup();
    grid();
    const before = cellOf('one').className;

    await user.hover(screen.getByRole('button', { name: 'two' }));
    const after = cellOf('one').className;

    // Strip exactly the three properties that are allowed to differ. Anything
    // left over would be a layout-affecting class changing on hover, which is
    // how a grid starts shifting under the pointer that is crossing it.
    const strip = (c: string) =>
      c
        .replace(/opacity-\d+/g, '')
        .replace(/blur-(\[1px\]|0)/g, '')
        .replace(/scale-(\[0\.99\]|100)/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    expect(strip(after)).toBe(strip(before));
  });
});
