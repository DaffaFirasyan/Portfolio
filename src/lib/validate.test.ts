import { MESSAGE_MIN, validateContact } from './validate';

const valid = {
  name: 'Rita Halim',
  email: 'rita@example.com',
  message: 'I read your thesis work on knowledge graphs and would like to talk about a role.',
};

describe('validateContact', () => {
  it('accepts a filled-in form', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('rejects a blank name, including one that is only whitespace', () => {
    expect(validateContact({ ...valid, name: '' }).name).toBeTruthy();
    expect(validateContact({ ...valid, name: '   ' }).name).toBeTruthy();
  });

  it('rejects a blank email and a malformed one, with different messages', () => {
    const blank = validateContact({ ...valid, email: '' }).email;
    const malformed = validateContact({ ...valid, email: 'rita@example' }).email;
    expect(blank).toBeTruthy();
    expect(malformed).toBeTruthy();
    expect(blank).not.toBe(malformed);
  });

  it('rejects a message shorter than the minimum but accepts one at it', () => {
    expect(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MIN - 1) }).message).toBeTruthy();
    expect(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).message).toBeUndefined();
  });

  it('does not count surrounding whitespace towards the minimum', () => {
    const padded = `  ${'a'.repeat(MESSAGE_MIN - 1)}  `;
    expect(validateContact({ ...valid, message: padded }).message).toBeTruthy();
  });

  it('reports every bad field at once rather than the first', () => {
    expect(Object.keys(validateContact({ name: '', email: '', message: '' })).sort()).toEqual([
      'email',
      'message',
      'name',
    ]);
  });
});
