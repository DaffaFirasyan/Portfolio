import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { validateContact, type ContactErrors, type ContactValues } from '@/lib/validate';
import { sendContact } from '@/lib/web3forms';
import StarButton from '@/motion/StarButton';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldName = keyof ContactValues;

const EMPTY: ContactValues = { name: '', email: '', message: '' };

const CONTROL =
  'mt-2 block min-h-11 w-full rounded-lg border border-edge bg-surface px-4 py-3 text-primary placeholder:text-muted';

function mailtoHref(values: ContactValues, email: string): string {
  const subject = encodeURIComponent(`Portfolio message from ${values.name || 'a visitor'}`);
  const body = encodeURIComponent(values.message);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function Field({
  htmlFor,
  label,
  error,
  errorId,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The contact form, in three states.
 *
 * Validation and submission are pure functions elsewhere, so what is left here
 * is state and markup. `accessKey` arrives as a prop rather than a direct read
 * of import.meta.env, so the unconfigured case can be tested.
 */
export default function ContactForm({ accessKey }: { accessKey: string }) {
  const { profile, t } = useLanguage();
  const id = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');
  const honeypot = useRef<HTMLInputElement>(null);
  const announcement = useRef<HTMLDivElement>(null);

  const fieldId = (name: FieldName) => `${id}-${name}`;
  const errorId = (name: FieldName) => `${id}-${name}-error`;
  const shown = (name: FieldName) => (touched[name] ? errors[name] : undefined);

  // Focus after the render that shows the outcome, not before it. React batches
  // the state updates across the await, so the panel does not exist yet at the
  // moment the send resolves.
  useEffect(() => {
    if (status === 'sent' || status === 'error') announcement.current?.focus();
  }, [status]);

  const change = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // Only re-validate a field the reader has already left. Correcting an error
    // should clear it as you type; a field still being filled in should not
    // start complaining mid-word.
    if (touched[name]) setErrors(validateContact(next));
  };

  const blur = (name: FieldName) => {
    setTouched((was) => ({ ...was, [name]: true }));
    setErrors(validateContact(values));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setFailure('');
    setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    const result = await sendContact(values, {
      accessKey,
      honeypot: honeypot.current?.value ?? '',
    });

    if (result.ok) {
      setStatus('sent');
      return;
    }

    setFailure(result.message);
    setStatus('error');
  };

  return (
    <div>
      <div
        ref={announcement}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={
          status === 'sent' || status === 'error'
            ? 'mb-6 rounded-xl border border-edge bg-surface p-5'
            : undefined
        }
      >
        {status === 'sent' && (
          <p className="text-primary">
            {t.sentMessage}
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="text-danger">{failure}</p>
            <a href={mailtoHref(values, profile.email)} className="mt-2 inline-block text-sm text-accent">
              {t.emailDirectly}
            </a>
          </>
        )}
      </div>

      {status === 'sent' ? (
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full border border-edge px-5 text-sm font-semibold text-muted"
        >
          {t.sendAnother}
        </button>
      ) : (
        <form noValidate onSubmit={submit} aria-busy={status === 'sending'} className="space-y-5">
          <Field
            htmlFor={fieldId('name')}
            label={t.nameLabel}
            error={shown('name')}
            errorId={errorId('name')}
          >
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => change('name', event.target.value)}
              onBlur={() => blur('name')}
              aria-invalid={shown('name') ? true : undefined}
              aria-describedby={shown('name') ? errorId('name') : undefined}
              className={CONTROL}
            />
          </Field>

          <Field
            htmlFor={fieldId('email')}
            label={t.emailLabel}
            error={shown('email')}
            errorId={errorId('email')}
          >
            <input
              id={fieldId('email')}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => change('email', event.target.value)}
              onBlur={() => blur('email')}
              aria-invalid={shown('email') ? true : undefined}
              aria-describedby={shown('email') ? errorId('email') : undefined}
              className={CONTROL}
            />
          </Field>

          <Field
            htmlFor={fieldId('message')}
            label={t.messageLabel}
            error={shown('message')}
            errorId={errorId('message')}
          >
            <textarea
              id={fieldId('message')}
              name="message"
              rows={6}
              value={values.message}
              onChange={(event) => change('message', event.target.value)}
              onBlur={() => blur('message')}
              aria-invalid={shown('message') ? true : undefined}
              aria-describedby={shown('message') ? errorId('message') : undefined}
              className={CONTROL}
            />
          </Field>

          {/* Bait. Hidden from sight, from the tab order and from the
              accessibility tree, so only a bot filling every input finds it. */}
          <input
            ref={honeypot}
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          {/* StarButton forwards no `disabled`, and a submit that stays live
              while a send is in flight would queue a second one. The plain
              button carries the sending state; the decorated one carries the
              idle state. */}
          {status === 'sending' ? (
            <button
              type="submit"
              disabled
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-void opacity-60"
            >
              {t.sendingButton}
            </button>
          ) : (
            <StarButton
              as="button"
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-void"
            >
              {t.sendButton}
            </StarButton>
          )}
        </form>
      )}
    </div>
  );
}
