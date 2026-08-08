import {
  getPasswordStrength,
  getPasswordStrengthRules,
  isPasswordStrongEnough,
} from './passwordStrength';

describe('passwordStrength', () => {
  it('evaluates each enterprise password rule independently', () => {
    const rules = getPasswordStrengthRules('Mentora2026!');

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
    expect(getPasswordStrength('Mentora')).toBe('fair');
    expect(getPasswordStrength('mentorapassx')).toBe('strong');
    expect(getPasswordStrength('Mentora2026!')).toBe('very_strong');
  });

  it('requires every enterprise password rule for submit flows', () => {
    expect(isPasswordStrongEnough('short')).toBe(false);
    expect(isPasswordStrongEnough('mentorapass')).toBe(false);
    expect(isPasswordStrongEnough('Mentora2026!')).toBe(true);
  });
});
