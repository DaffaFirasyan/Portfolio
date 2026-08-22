import type { ContactValues } from './validate';

/** Web3Forms has one endpoint and no SDK. */
export const ENDPOINT = 'https://api.web3forms.com/submit';

export type SendResult = { ok: true } | { ok: false; message: string };

export interface SendOptions {
  accessKey: string;
  /** The honeypot field's value. Anything non-empty means a bot filled it. */
  honeypot?: string;
  signal?: AbortSignal;
}

const NO_KEY =
  'The form is not connected to its mail service yet. Email me directly and it reaches me the same way.';

const UNREACHABLE =
  'The message could not be sent. The service may be down, or the connection dropped on the way.';

/**
 * The API reference documents `body.message`; the JavaScript examples in the
 * same documentation read `message` at the top level. Accept either, and never
 * let the message decide whether the send succeeded.
 */
function readMessage(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const shape = payload as { message?: unknown; body?: { message?: unknown } };
  if (typeof shape.message === 'string') return shape.message;
  if (typeof shape.body?.message === 'string') return shape.body.message;
  return undefined;
}

function succeeded(response: Response, payload: unknown): boolean {
  if (!response.ok) return false;
  if (typeof payload !== 'object' || payload === null) return false;
  return (payload as { success?: unknown }).success === true;
}

export async function sendContact(
  values: ContactValues,
  options: SendOptions,
): Promise<SendResult> {
  // A filled honeypot is a bot. Report success and send nothing — telling it
  // that it failed is how it learns which field gave it away.
  if ((options.honeypot ?? '') !== '') return { ok: true };

  if (options.accessKey === '') return { ok: false, message: NO_KEY };

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: options.signal,
      body: JSON.stringify({
        access_key: options.accessKey,
        subject: `Portfolio message from ${values.name}`,
        from_name: 'Portfolio site',
        replyto: values.email,
        name: values.name,
        email: values.email,
        message: values.message,
        botcheck: '',
      }),
    });
  } catch {
    return { ok: false, message: UNREACHABLE };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (succeeded(response, payload)) return { ok: true };
  return { ok: false, message: readMessage(payload) ?? UNREACHABLE };
}
