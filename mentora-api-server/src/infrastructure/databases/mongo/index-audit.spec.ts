import type { IndexDefinition, IndexOptions } from 'mongoose';
import { compareCollectionIndexes } from './index-audit';

const expected = (
  key: IndexDefinition,
  options: IndexOptions = {},
): Array<[IndexDefinition, IndexOptions]> => [[key, options]];

describe('Mongo index audit', () => {
  it('accepts an equivalent database index', () => {
    expect(
      compareCollectionIndexes(
        'profiles',
        expected({ userId: 1 }, { unique: true }),
        [{ key: { userId: 1 }, name: 'userId_1', unique: true }],
      ),
    ).toEqual([]);
  });

  it('reports missing and mismatched indexes', () => {
    expect(
      compareCollectionIndexes(
        'profiles',
        expected({ userId: 1 }, { unique: true }),
        [{ key: { userId: 1 }, name: 'userId_1' }],
      ),
    ).toEqual([
      expect.objectContaining({
        collection: 'profiles',
        type: 'options-mismatch',
      }),
    ]);

    expect(
      compareCollectionIndexes('profiles', expected({ status: 1 }), []),
    ).toEqual([
      expect.objectContaining({ collection: 'profiles', type: 'missing' }),
    ]);
  });

  it('reports indexes that are no longer declared by the schema', () => {
    expect(
      compareCollectionIndexes(
        'profiles',
        [],
        [
          { key: { legacy: 1 }, name: 'legacy_1' },
          { key: { _id: 1 }, name: '_id_' },
        ],
      ),
    ).toEqual([
      {
        collection: 'profiles',
        index: 'legacy_1',
        type: 'unexpected',
      },
    ]);
  });
});
