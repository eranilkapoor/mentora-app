import { en, hi } from './locales';

type LocaleValue =
  string | number | boolean | null | LocaleTree | LocaleValue[];

interface LocaleTree {
  [key: string]: LocaleValue;
}

const flattenKeys = (
  value: LocaleValue,
  prefix = '',
  output: string[] = []
): string[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    if (prefix) output.push(prefix);
    return output;
  }

  for (const [key, child] of Object.entries(value)) {
    flattenKeys(child, prefix ? `${prefix}.${key}` : key, output);
  }

  return output.sort();
};

describe('locale resources', () => {
  it('keeps Hindi namespaces aligned with English namespaces', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });

  it('keeps Hindi translation keys aligned with English translation keys', () => {
    for (const namespace of Object.keys(en) as Array<keyof typeof en>) {
      expect(flattenKeys(hi[namespace] as LocaleTree)).toEqual(
        flattenKeys(en[namespace] as LocaleTree)
      );
    }
  });
});
