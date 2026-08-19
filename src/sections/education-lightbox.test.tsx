import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Education from './Education';
import { certificates } from '@/data/certificates';

const first = certificates[0];
const last = certificates[certificates.length - 1];
const verifiable = certificates.find((c) => c.credentialUrl);
const unverifiable = certificates.find((c) => !c.credentialUrl)!;

/**
 * Tiles are named by their title *and* issuer, and are matched on the whole
 * name rather than a regex built from the title. Real content broke the regex
 * two ways at once: "Python (Basic)" carries regex groups, and "Web Developer"
 * is a substring of "Junior Web Developer — Programming and Software
 * Development", so one query matched two tiles.
 */
function tileName(c: (typeof certificates)[number]) {
  // A function matcher rather than a string or a regex. A regex built from the
  // title breaks on "Python (Basic)", whose brackets are groups. An exact
  // string breaks on how the accessible name joins the title and issuer spans.
  // Anchoring on the title and also requiring the issuer is what separates
  // "Web Developer" from "Junior Web Developer — Programming and Software
  // Development", which a substring match cannot do.
  return (name: string) => name.startsWith(c.title) && name.includes(c.issuer);
}

async function open(c: (typeof certificates)[number]) {
  await userEvent.click(screen.getByRole('button', { name: tileName(c) }));
  return screen.getByRole('dialog');
}

function shownTitle(dialog: HTMLElement) {
  return within(dialog).getByRole('heading', { level: 2 }).textContent;
}

describe('certificate lightbox', () => {
  it('gives every certificate a control that opens it', () => {
    render(<Education />);
    for (const certificate of certificates) {
      expect(
        screen.getByRole('button', { name: tileName(certificate) }),
      ).toBeInTheDocument();
    }
  });

  it('stays shut until asked', () => {
    render(<Education />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the full-size image, not the thumbnail', async () => {
    render(<Education />);
    const dialog = await open(first);

    const image = within(dialog).getByRole('img');
    expect(image).toHaveAttribute('src', first.imageUrl);
    expect(image).not.toHaveAttribute('src', first.thumbnailUrl);
  });

  it('moves forward with the right arrow', async () => {
    render(<Education />);
    const dialog = await open(first);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shownTitle(dialog)).toBe(certificates[1].title);
  });

  it('wraps backwards from the first to the last', async () => {
    render(<Education />);
    const dialog = await open(first);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(shownTitle(dialog)).toBe(last.title);
  });

  it('wraps forwards from the last to the first', async () => {
    render(<Education />);
    const dialog = await open(last);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shownTitle(dialog)).toBe(first.title);
  });

  it('ignores the arrows while it is closed', () => {
    render(<Education />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a verify link only for certificates that carry one', async () => {
    render(<Education />);

    // The absent case is always testable and is the one that matters most: a
    // certificate without a credential URL must render no control at all
    // rather than a dead one.
    const withoutLink = await open(unverifiable);
    expect(within(withoutLink).queryByRole('link', { name: /verify/i })).toBeNull();

    // The present case only exists while some certificate actually carries a
    // URL. None do right now — the owner has the scans but not the verify
    // links yet — and asserting against a `find` that returned undefined is
    // how a test starts passing for the wrong reason.
    if (!verifiable) return;

    await userEvent.click(within(withoutLink).getByRole('button', { name: /close/i }));
    const withLink = await open(verifiable);
    expect(within(withLink).getByRole('link', { name: /verify/i })).toHaveAttribute(
      'href',
      verifiable.credentialUrl,
    );
  });

  it('returns focus to the certificate that opened it', async () => {
    render(<Education />);
    const trigger = screen.getByRole('button', { name: tileName(first) });

    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
