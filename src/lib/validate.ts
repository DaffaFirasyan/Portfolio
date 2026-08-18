export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

/** Short enough not to nag, long enough that "hi" does not reach the inbox. */
export const MESSAGE_MIN = 20;

/**
 * The same shape the profile invariant uses. It is deliberately loose: the only
 * address that can be proved deliverable is one that has received mail, and a
 * stricter pattern rejects real addresses.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Every problem with the form, not the first one.
 *
 * Returning them all at once is what lets the component decide when to show
 * each — on blur for a field the reader has left, on submit for all of them.
 */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name === '') errors.name = 'Please tell me who you are.';

  if (email === '') errors.email = 'An email address is needed for a reply.';
  else if (!EMAIL.test(email)) errors.email = 'That does not look like an email address.';

  if (message === '') errors.message = 'The message is empty.';
  else if (message.length < MESSAGE_MIN) {
    errors.message = `A little more detail would help — ${MESSAGE_MIN} characters or more.`;
  }

  return errors;
}
