import { formatCamelCase, formatEnumLabel } from './format';

const translations: Record<string, string> = {
  'options.caste.any': 'Any',
  'options.caste.general': 'General',
  'options.caste.obc': 'OBC',
  'options.caste.sc': 'SC',
  'options.caste.st': 'ST',
  'options.caste.not_applicable': 'Not Applicable',
};

const t = (key: string, options: { defaultValue: string }): string =>
  translations[key] ?? options.defaultValue;

describe('enum formatting', () => {
  it('preserves short caste acronyms in fallback labels', () => {
    expect(formatCamelCase('obc')).toBe('OBC');
    expect(formatCamelCase('sc')).toBe('SC');
    expect(formatCamelCase('st')).toBe('ST');
  });

  it('uses normalized translation keys for enum labels', () => {
    expect(formatEnumLabel(t, 'options.caste', 'Any')).toBe('Any');
    expect(formatEnumLabel(t, 'options.caste', 'OBC')).toBe('OBC');
    expect(formatEnumLabel(t, 'options.caste', 'not applicable')).toBe(
      'Not Applicable'
    );
  });
});
