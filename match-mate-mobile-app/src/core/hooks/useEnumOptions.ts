import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEnumLabel } from '@/core/utils/format';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  searchText?: string;
}

export function useEnumOptions<T extends Record<string, string>>(
  enums: T,
  translationKey: string
): SelectOption<T[keyof T]>[] {
  const { t } = useTranslation();

  return useMemo(
    () =>
      (Object.values(enums) as T[keyof T][]).map((value) => {
        const rawValue = String(value);
        const label = formatEnumLabel(t, translationKey, rawValue, rawValue);

        return {
          value,
          label,
          searchText: [label, rawValue].join(' '),
        };
      }),
    [enums, translationKey, t]
  );
}
