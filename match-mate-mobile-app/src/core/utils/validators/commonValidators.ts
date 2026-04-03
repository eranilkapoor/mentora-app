export const isEmpty = (value?: string | null): boolean => {
  return !value || value.trim().length === 0;
};

export const minLength = (value: string, length: number): boolean => {
  return value.trim().length >= length;
};
