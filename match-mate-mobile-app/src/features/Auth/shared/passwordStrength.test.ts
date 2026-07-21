import {
  getPasswordStrength,
  getPasswordStrengthRules,
  isPasswordStrongEnough,
} from './passwordStrength';

describe('passwordStrength', () => {
  it('evaluates each enterprise password rule independently', () => {
    const rules = getPasswordStrengthRules('MatchMate12!');

    expect(rules).toEqual([
      { key: 'length', passed: true },
      { key: 'lowercase', passed: true },
      { key: 'uppercase', passed: true },
      { key: 'number', passed: true },
      { key: 'special', passed: true },
    ]);
  });

  it('grades weak, fair, strong and very strong passwords', () => {
    expect(getPasswordStrength('')).toBe('weak');
    expect(getPasswordStrength('short')).toBe('weak');
    expect(getPasswordStrength('matchmatepass')).toBe('strong');
    expect(getPasswordStrength('Matchmatepass')).toBe('very_strong');
    expect(getPasswordStrength('Matchmate2026!')).toBe('very_strong');
  });

  it('requires every enterprise password rule for submit flows', () => {
    expect(isPasswordStrongEnough('short')).toBe(false);
    expect(isPasswordStrongEnough('matchmatepass')).toBe(false);
    expect(isPasswordStrongEnough('Matchmate2026!')).toBe(true);
  });
});
