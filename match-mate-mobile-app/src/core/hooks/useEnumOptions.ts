import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  searchText?: string;
}

const humanizeEnumValue = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export function useEnumOptions<T extends Record<string, string>>(
  enums: T,
  translationKey: string
): SelectOption<T[keyof T]>[] {
  const { t } = useTranslation();

  return useMemo(
    () =>
      (Object.values(enums) as T[keyof T][]).map((value) => {
        const rawValue = String(value);
        const fallbackLabel = humanizeEnumValue(rawValue);
        const label = t(`${translationKey}.${rawValue}`, {
          defaultValue: fallbackLabel,
        });

        return {
          value,
          label,
          searchText: [label, rawValue, fallbackLabel].join(' '),
        };
      }),
    [enums, translationKey, t]
  );
}
