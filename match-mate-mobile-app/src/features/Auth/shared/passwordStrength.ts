import { PASSWORD_MIN_LENGTH } from '@/core/constants';

export type PasswordStrengthLevel = 'weak' | 'fair' | 'strong' | 'very_strong';

export type PasswordRuleKey =
  'length' | 'lowercase' | 'uppercase' | 'number' | 'special';

export type PasswordStrengthRule = {
  key: PasswordRuleKey;
  passed: boolean;
};

export const getPasswordStrengthRules = (
  password: string
): PasswordStrengthRule[] => [
  {
    key: 'length',
    passed: password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'lowercase',
    passed: /[a-z]/.test(password),
  },
  {
    key: 'uppercase',
    passed: /[A-Z]/.test(password),
  },
  {
    key: 'number',
    passed: /[0-9]/.test(password),
  },
  {
    key: 'special',
    passed: /[^A-Za-z0-9]/.test(password),
  },
];

export const getPasswordStrength = (
  password: string
): PasswordStrengthLevel => {
  if (!password) return 'weak';

  const passed = getPasswordStrengthRules(password).filter(
    (rule) => rule.passed
  ).length;
  const hasLongBonus = password.length >= 12;
  const score = passed + (hasLongBonus ? 1 : 0);

  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'strong';
  return 'very_strong';
};

export const isPasswordStrongEnough = (password: string): boolean =>
  getPasswordStrengthRules(password).every((rule) => rule.passed);
