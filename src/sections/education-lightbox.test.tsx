import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Education from './Education';
import { certificates } from '@/data/certificates';

const first = certificates[0];
const last = certificates[certificates.length - 1];
const verifiable = certificates.find((c) => c.credentialUrl)!;
const unverifiable = certificates.find((c) => !c.credentialUrl)!;

async function open(title: string) {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(title, 'i') }));
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
        screen.getByRole('button', { name: new RegExp(certificate.title, 'i') }),
      ).toBeInTheDocument();
    }
  });

  it('stays shut until asked', () => {
    render(<Education />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the full-size image, not the thumbnail', async () => {
    render(<Education />);
    const dialog = await open(first.title);

    const image = within(dialog).getByRole('img');
    expect(image).toHaveAttribute('src', first.imageUrl);
    expect(image).not.toHaveAttribute('src', first.thumbnailUrl);
  });

  it('moves forward with the right arrow', async () => {
    render(<Education />);
    const dialog = await open(first.title);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shownTitle(dialog)).toBe(certificates[1].title);
  });

  it('wraps backwards from the first to the last', async () => {
    render(<Education />);
    const dialog = await open(first.title);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(shownTitle(dialog)).toBe(last.title);
  });

  it('wraps forwards from the last to the first', async () => {
    render(<Education />);
    const dialog = await open(last.title);

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

    const withLink = await open(verifiable.title);
    expect(within(withLink).getByRole('link', { name: /verify/i })).toHaveAttribute(
      'href',
      verifiable.credentialUrl,
    );

    await userEvent.click(within(withLink).getByRole('button', { name: /close/i }));

    const withoutLink = await open(unverifiable.title);
    expect(within(withoutLink).queryByRole('link', { name: /verify/i })).toBeNull();
  });

  it('returns focus to the certificate that opened it', async () => {
    render(<Education />);
    const trigger = screen.getByRole('button', { name: new RegExp(first.title, 'i') });

    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
