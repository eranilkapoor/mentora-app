import { AGE_RANGE, HEIGHT_RANGE, INCOME_RANGE } from '@/core/constants';
import {
  formatRangeInputValue,
  getIncompleteRangeLabel,
  getRangeFieldLabelKey,
  normalizeFilterRanges,
  normalizeRange,
  parseRangeInputValue,
} from './preferenceRanges.utils';
import type { PartnerFilters } from '../EditPreference.types';

const createFilters = (
  overrides: Partial<PartnerFilters> = {}
): PartnerFilters => ({
  childPreference: 'does_not_matter',
  residencyPreference: 'does_not_matter',
  ...overrides,
});

describe('preference range utilities', () => {
  it('normalizes min/max order and falls back for invalid values', () => {
    expect(normalizeRange({ min: 40, max: 25 }, AGE_RANGE)).toEqual({
      min: 25,
      max: 40,
    });
    expect(normalizeRange({ min: undefined, max: 172 }, HEIGHT_RANGE)).toEqual({
      min: HEIGHT_RANGE.min,
      max: 172,
    });
    expect(normalizeRange(undefined, INCOME_RANGE)).toEqual(INCOME_RANGE);
  });

  it('keeps only complete ranges when normalizing filters', () => {
    const filters = createFilters({
      age: { min: 21, max: 30 },
      height: { min: 165 },
      annualIncome: { min: 1200000, max: 600000 },
      religion: ['hindu'],
      city: ['Mumbai'],
    });

    expect(normalizeFilterRanges(filters)).toEqual({
      age: { min: 21, max: 30 },
      annualIncome: { min: 600000, max: 1200000 },
      childPreference: 'does_not_matter',
      residencyPreference: 'does_not_matter',
      religion: ['hindu'],
      city: ['Mumbai'],
    });
  });

  it('resolves first incomplete range label in age-height-income order', () => {
    expect(
      getIncompleteRangeLabel({
        childPreference: 'does_not_matter',
        residencyPreference: 'does_not_matter',
        age: { min: 25 },
        height: { min: 160 },
        annualIncome: { min: 1000000 },
      })
    ).toBe('age');

    expect(
      getIncompleteRangeLabel({
        childPreference: 'does_not_matter',
        residencyPreference: 'does_not_matter',
        age: { min: 25, max: 30 },
        height: { max: 180 },
      })
    ).toBe('height');

    expect(
      getIncompleteRangeLabel({
        childPreference: 'does_not_matter',
        residencyPreference: 'does_not_matter',
        age: { min: 25, max: 30 },
        height: { min: 165, max: 175 },
        annualIncome: { max: 1000000 },
      })
    ).toBe('annualIncome');

    expect(
      getIncompleteRangeLabel({
        childPreference: 'does_not_matter',
        residencyPreference: 'does_not_matter',
        age: { min: 25, max: 30 },
        height: { min: 165, max: 175 },
        annualIncome: { min: 300000, max: 1000000 },
      })
    ).toBeNull();
  });

  it('maps range field keys for localization labels', () => {
    expect(getRangeFieldLabelKey('age')).toBe('preference.fields.age');
    expect(getRangeFieldLabelKey('height')).toBe('preference.fields.height');
    expect(getRangeFieldLabelKey('annualIncome')).toBe(
      'preference.fields.annual_income'
    );
  });

  it('formats and parses range input values safely', () => {
    expect(formatRangeInputValue(27)).toBe('27');
    expect(formatRangeInputValue(undefined)).toBe('');
    expect(formatRangeInputValue(null)).toBe('');

    expect(parseRangeInputValue(' 42 ')).toBe(42);
    expect(parseRangeInputValue('42cm')).toBe(42);
    expect(parseRangeInputValue('')).toBeNull();
    expect(parseRangeInputValue('abc')).toBeNull();
  });
});
