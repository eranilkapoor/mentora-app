import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export function useEnumOptions<T extends Record<string, string>>(
  enums: T,
  translationKey: string
): SelectOption<T[keyof T]>[] {
  const { t } = useTranslation();

  return useMemo(
    () =>
      (Object.values(enums) as T[keyof T][]).map((value) => ({
        value,
        label: t(`${translationKey}.${value}`),
      })),
    [enums, translationKey, t]
  );
}
