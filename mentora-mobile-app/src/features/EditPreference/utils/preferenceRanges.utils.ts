import { AGE_RANGE, HEIGHT_RANGE, INCOME_RANGE } from '@/core/constants';
import { parseDigitsOrNull } from '@/core/utils/inputSanitizers';
import type { PartnerFilters } from '../EditPreference.types';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export type RangeFilterKey = 'age' | 'height' | 'annualIncome';
export type RangeBound = 'min' | 'max';

export const normalizeRange = (
  range: PartnerFilters['age'],
  fallback: { min: number; max: number }
): Required<NonNullable<PartnerFilters['age']>> => {
  const rawMin = range?.min;
  const rawMax = range?.max;
  const min =
    typeof rawMin === 'number' && Number.isFinite(rawMin)
      ? rawMin
      : fallback.min;
  const max =
    typeof rawMax === 'number' && Number.isFinite(rawMax)
      ? rawMax
      : fallback.max;

  if (typeof min !== 'number' || typeof max !== 'number') {
    return fallback;
  }

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
};

const hasAnyRangeBound = (range: PartnerFilters['age']): boolean =>
  isFiniteNumber(range?.min) || isFiniteNumber(range?.max);

export const hasCompleteRange = (range: PartnerFilters['age']): boolean =>
  isFiniteNumber(range?.min) && isFiniteNumber(range?.max);

export const normalizeFilterRanges = (
  filters: PartnerFilters
): PartnerFilters => {
  const rest: PartnerFilters = { ...filters };
  delete rest.age;
  delete rest.height;
  delete rest.annualIncome;

  return {
    ...rest,
    ...(hasCompleteRange(filters.age)
      ? { age: normalizeRange(filters.age, AGE_RANGE) }
      : {}),
    ...(hasCompleteRange(filters.height)
      ? { height: normalizeRange(filters.height, HEIGHT_RANGE) }
      : {}),
    ...(hasCompleteRange(filters.annualIncome)
      ? { annualIncome: normalizeRange(filters.annualIncome, INCOME_RANGE) }
      : {}),
  };
};

export const getIncompleteRangeLabel = (
  filters: PartnerFilters
): RangeFilterKey | null => {
  if (hasAnyRangeBound(filters.age) && !hasCompleteRange(filters.age)) {
    return 'age';
  }

  if (hasAnyRangeBound(filters.height) && !hasCompleteRange(filters.height)) {
    return 'height';
  }

  if (
    hasAnyRangeBound(filters.annualIncome) &&
    !hasCompleteRange(filters.annualIncome)
  ) {
    return 'annualIncome';
  }

  return null;
};

export const getRangeFieldLabelKey = (field: RangeFilterKey): string => {
  if (field === 'annualIncome') {
    return 'preference.fields.annual_income';
  }

  return `preference.fields.${field}`;
};

export const formatRangeInputValue = (
  value: number | null | undefined
): string => (isFiniteNumber(value) ? String(value) : '');

export const parseRangeInputValue = (text: string): number | null => {
  return parseDigitsOrNull(text);
};
