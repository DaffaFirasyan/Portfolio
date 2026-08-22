import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { profile } from '@/data/profile';
import ContactForm from './ContactForm';

const valid = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work and would like to talk about an internship this year.',
};

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), valid.name);
  await user.type(screen.getByLabelText(/email/i), valid.email);
  await user.type(screen.getByLabelText(/message/i), valid.message);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('labels every field a reader has to fill in', () => {
    render(<ContactForm accessKey="key-123" />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('says nothing about a field the reader has not left yet', async () => {
    const user = userEvent.setup();
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByLabelText(/email/i));
    expect(screen.queryByText(/email address is needed/i)).not.toBeInTheDocument();
  });

  it('shows the error on blur and marks the field invalid', async () => {
    const user = userEvent.setup();
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByLabelText(/email/i));
    await user.tab();

    expect(await screen.findByText(/email address is needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('refuses to submit an invalid form and sends nothing', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/who you are/i)).toBeInTheDocument();
  });

  it('sends the filled-in values and shows the success state', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.email).toBe(valid.email);

    expect(await screen.findByText(/on its way/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/message/i)).not.toBeInTheDocument();
  });

  it('offers a way back to the form after a successful send', async () => {
    const user = userEvent.setup();
    mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));
    await user.click(await screen.findByRole('button', { name: /send another/i }));

    expect(screen.getByLabelText(/message/i)).toHaveValue('');
  });

  it('falls back to a mailto link carrying the message when the send fails', async () => {
    const user = userEvent.setup();
    mockFetch({ success: false, message: 'Invalid access key' }, 400);
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    const link = await screen.findByRole('link', { name: /email me directly/i });
    expect(link.getAttribute('href')).toContain(`mailto:${profile.email}`);
    expect(link.getAttribute('href')).toContain(encodeURIComponent(valid.message));
  });

  it('reaches the error state without a network call when no key is configured', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({ success: true });
    render(<ContactForm accessKey="" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByRole('link', { name: /email me directly/i })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the honeypot out of the tab order and out of the accessibility tree', () => {
    const { container } = render(<ContactForm accessKey="key-123" />);
    const honeypot = container.querySelector('input[name="botcheck"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces the outcome in a live region', async () => {
    const user = userEvent.setup();
    mockFetch({ success: true });
    render(<ContactForm accessKey="key-123" />);

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/on its way/i));
  });
});
