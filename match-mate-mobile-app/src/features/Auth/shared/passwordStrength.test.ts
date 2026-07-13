import {
  getPasswordStrength,
  getPasswordStrengthRules,
  isPasswordStrongEnough,
} from './passwordStrength';

describe('passwordStrength', () => {
  it('evaluates each enterprise password rule independently', () => {
    const rules = getPasswordStrengthRules('MatchMate1!');

    expect(rules).toEqual([
      { key: 'length', passed: true },
      { key: 'uppercase', passed: true },
      { key: 'number', passed: true },
      { key: 'special', passed: true },
    ]);
  });

  it('grades weak, fair, strong and very strong passwords', () => {
    expect(getPasswordStrength('')).toBe('weak');
    expect(getPasswordStrength('short')).toBe('weak');
    expect(getPasswordStrength('Matchmate')).toBe('fair');
    expect(getPasswordStrength('Matchmate1')).toBe('strong');
    expect(getPasswordStrength('Matchmate2026!')).toBe('very_strong');
  });

  it('blocks only weak passwords from submit flows', () => {
    expect(isPasswordStrongEnough('short')).toBe(false);
    expect(isPasswordStrongEnough('Matchmate')).toBe(true);
  });
});
