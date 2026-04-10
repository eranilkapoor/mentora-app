import { PASSWORD_MIN_LENGTH } from '@/core/constants';

export const PASSWORD_RULES = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'One special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];