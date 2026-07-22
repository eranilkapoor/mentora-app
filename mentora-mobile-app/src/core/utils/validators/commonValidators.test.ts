import { isEmpty, minLength } from './commonValidators';

describe('commonValidators', () => {
  it('treats null, undefined, and whitespace-only strings as empty', () => {
    expect(isEmpty()).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty(' value ')).toBe(false);
  });

  it('checks trimmed minimum length', () => {
    expect(minLength('  mentora  ', 9)).toBe(true);
    expect(minLength(' short ', 6)).toBe(false);
  });
});
