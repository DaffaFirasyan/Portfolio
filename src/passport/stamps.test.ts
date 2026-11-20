import { initialsOf } from './stamps';

describe('initialsOf', () => {
  it('takes the first letter of each word, upper-cased', () => {
    expect(initialsOf('daffa  firasyan putra')).toBe('DFP');
  });
});
