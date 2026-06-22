import type { Connection, IndexDefinition, IndexOptions } from 'mongoose';

interface DatabaseIndex {
  key: Record<string, unknown>;
  name?: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
  partialFilterExpression?: Record<string, unknown>;
  collation?: Record<string, unknown>;
}

interface ComparableIndexOptions {
  unique?: unknown;
  sparse?: unknown;
  expireAfterSeconds?: unknown;
  partialFilterExpression?: unknown;
  collation?: unknown;
}

export interface MongoIndexIssue {
  collection: string;
  index: string;
  type: 'missing' | 'options-mismatch' | 'unexpected';
  details?: string;
}

export interface MongoIndexAuditReport {
  checkedCollections: number;
  expectedIndexes: number;
  actualIndexes: number;
  issues: MongoIndexIssue[];
}

const stableSerialize = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${key}:${stableSerialize(nested)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const keySignature = (key: Record<string, unknown>): string =>
  Object.entries(key)
    .map(([field, direction]) => `${field}:${String(direction)}`)
    .join('|');

const optionSignature = (options: ComparableIndexOptions): string =>
  stableSerialize({
    unique: Boolean(options.unique),
    sparse: Boolean(options.sparse),
    expireAfterSeconds: options.expireAfterSeconds ?? null,
    partialFilterExpression: options.partialFilterExpression ?? null,
    collation: options.collation ?? null,
  });

const expectedName = (key: IndexDefinition, options: IndexOptions): string =>
  options.name ?? keySignature(key);

export function compareCollectionIndexes(
  collection: string,
  expected: Array<[IndexDefinition, IndexOptions]>,
  actual: DatabaseIndex[],
): MongoIndexIssue[] {
  const issues: MongoIndexIssue[] = [];
  const remainingActual = actual.filter(({ name }) => name !== '_id_');

  for (const [key, options] of expected) {
    const signature = keySignature(key);
    const actualPosition = remainingActual.findIndex(
      (index) => keySignature(index.key) === signature,
    );
    if (actualPosition < 0) {
      issues.push({
        collection,
        index: expectedName(key, options),
        type: 'missing',
      });
      continue;
    }

    const [matched] = remainingActual.splice(actualPosition, 1);
    if (optionSignature(options) !== optionSignature(matched)) {
      issues.push({
        collection,
        index: expectedName(key, options),
        type: 'options-mismatch',
        details: `expected=${optionSignature(options)} actual=${optionSignature(matched)}`,
      });
    }
  }

  for (const index of remainingActual) {
    issues.push({
      collection,
      index: index.name ?? keySignature(index.key),
      type: 'unexpected',
    });
  }

  return issues;
}

const isMissingCollectionError = (error: unknown): boolean =>
  Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === 26,
  );

export async function auditMongoIndexes(
  connection: Connection,
): Promise<MongoIndexAuditReport> {
  const modelsByCollection = new Map(
    Object.values(connection.models).map((model) => [
      model.collection.collectionName,
      model,
    ]),
  );
  const report: MongoIndexAuditReport = {
    checkedCollections: modelsByCollection.size,
    expectedIndexes: 0,
    actualIndexes: 0,
    issues: [],
  };

  for (const [collection, model] of modelsByCollection) {
    const expected = model.schema.indexes();
    report.expectedIndexes += expected.length;

    let actual: DatabaseIndex[] = [];
    try {
      actual = (await model.collection.indexes()) as DatabaseIndex[];
    } catch (error: unknown) {
      if (!isMissingCollectionError(error)) throw error;
    }

    report.actualIndexes += actual.filter(({ name }) => name !== '_id_').length;
    report.issues.push(
      ...compareCollectionIndexes(collection, expected, actual),
    );
  }

  return report;
}
