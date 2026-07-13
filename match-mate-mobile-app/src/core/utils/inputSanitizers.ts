export const sanitizeDigits = (value: string): string =>
  value.replace(/\D/g, '');

export const parseDigitsOrNull = (value: string): number | null => {
  const digits = sanitizeDigits(value);
  return digits ? Number(digits) : null;
};
