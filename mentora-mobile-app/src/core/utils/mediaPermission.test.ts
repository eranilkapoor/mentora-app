import { hasMediaLibraryPermission } from './mediaPermission';

describe('media library permission', () => {
  it.each(['denied', 'undetermined', 'limited'])(
    'rejects %s access',
    (status) => {
      expect(hasMediaLibraryPermission(status)).toBe(false);
    }
  );

  it('accepts granted access', () => {
    expect(hasMediaLibraryPermission('granted')).toBe(true);
  });
});
