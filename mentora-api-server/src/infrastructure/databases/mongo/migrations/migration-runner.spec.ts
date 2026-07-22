import type { MongoMigration } from './migration.interface';
import { validateMigrationManifest } from './migration-runner';

const migration = (id: string): MongoMigration => ({
  id,
  name: `migration-${id}`,
  checksum: `checksum-${id}`,
  up: jest.fn(),
});

describe('validateMigrationManifest', () => {
  it('accepts ordered unique migration ids', () => {
    expect(() =>
      validateMigrationManifest([
        migration('202606220001'),
        migration('202606220002'),
      ]),
    ).not.toThrow();
  });

  it('rejects duplicate migration ids', () => {
    expect(() =>
      validateMigrationManifest([
        migration('202606220001'),
        migration('202606220001'),
      ]),
    ).toThrow('Duplicate migration id');
  });

  it('rejects migrations that are out of order', () => {
    expect(() =>
      validateMigrationManifest([
        migration('202606220002'),
        migration('202606220001'),
      ]),
    ).toThrow('ordered by ascending id');
  });
});
