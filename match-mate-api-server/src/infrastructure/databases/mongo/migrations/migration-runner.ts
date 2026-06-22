import { randomUUID } from 'node:crypto';
import type { Connection } from 'mongoose';
import type {
  AppliedMongoMigration,
  MongoMigration,
} from './migration.interface';

const MIGRATIONS_COLLECTION = 'schema_migrations';
const LOCKS_COLLECTION = 'schema_migration_locks';
const LOCK_ID = 'global';
const LOCK_TTL_MS = 10 * 60 * 1000;

interface MigrationLock {
  _id: string;
  owner: string;
  acquiredAt: Date;
  expiresAt: Date;
}

type MongoDatabase = NonNullable<Connection['db']>;

const getDatabase = (connection: Connection): MongoDatabase => {
  if (!connection.db) throw new Error('MongoDB connection is not ready');
  return connection.db;
};

export function validateMigrationManifest(
  migrations: readonly MongoMigration[],
): void {
  const ids = new Set<string>();
  let previousId = '';

  for (const migration of migrations) {
    if (!/^\d{12}$/.test(migration.id)) {
      throw new Error(`Invalid migration id: ${migration.id}`);
    }
    if (ids.has(migration.id)) {
      throw new Error(`Duplicate migration id: ${migration.id}`);
    }
    if (previousId && migration.id <= previousId) {
      throw new Error('Migrations must be ordered by ascending id');
    }
    if (!migration.name.trim() || !migration.checksum.trim()) {
      throw new Error(`Migration ${migration.id} requires name and checksum`);
    }

    ids.add(migration.id);
    previousId = migration.id;
  }
}

async function acquireLock(db: MongoDatabase): Promise<string> {
  const owner = randomUUID();
  const now = new Date();
  const lock: MigrationLock = {
    _id: LOCK_ID,
    owner,
    acquiredAt: now,
    expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
  };
  const collection = db.collection<MigrationLock>(LOCKS_COLLECTION);

  try {
    await collection.insertOne(lock);
    return owner;
  } catch (error: unknown) {
    if (!isDuplicateKeyError(error)) throw error;
  }

  const takeover = await collection.updateOne(
    { _id: LOCK_ID, expiresAt: { $lte: now } },
    {
      $set: {
        owner: lock.owner,
        acquiredAt: lock.acquiredAt,
        expiresAt: lock.expiresAt,
      },
    },
  );
  if (takeover.modifiedCount !== 1) {
    throw new Error('Another migration process currently holds the lock');
  }

  return owner;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000,
  );

async function releaseLock(db: MongoDatabase, owner: string): Promise<void> {
  await db
    .collection<MigrationLock>(LOCKS_COLLECTION)
    .deleteOne({ _id: LOCK_ID, owner });
}

const startLockHeartbeat = (db: MongoDatabase, owner: string): (() => void) => {
  const timer = setInterval(
    () => {
      void db
        .collection<MigrationLock>(LOCKS_COLLECTION)
        .updateOne(
          { _id: LOCK_ID, owner },
          { $set: { expiresAt: new Date(Date.now() + LOCK_TTL_MS) } },
        )
        .catch(() => undefined);
    },
    Math.floor(LOCK_TTL_MS / 3),
  );
  timer.unref();
  return () => clearInterval(timer);
};

export async function getMigrationStatus(
  connection: Connection,
  migrations: readonly MongoMigration[],
): Promise<Array<MongoMigration & { applied: boolean; appliedAt?: Date }>> {
  validateMigrationManifest(migrations);
  const applied = await getDatabase(connection)
    .collection<AppliedMongoMigration>(MIGRATIONS_COLLECTION)
    .find({})
    .toArray();
  const appliedById = new Map(applied.map((item) => [item._id, item]));

  return migrations.map((migration) => {
    const record = appliedById.get(migration.id);
    if (record && record.checksum !== migration.checksum) {
      throw new Error(
        `Checksum mismatch for applied migration ${migration.id}`,
      );
    }
    return {
      ...migration,
      applied: Boolean(record),
      ...(record?.appliedAt ? { appliedAt: record.appliedAt } : {}),
    };
  });
}

export async function migrateUp(
  connection: Connection,
  migrations: readonly MongoMigration[],
): Promise<number> {
  const db = getDatabase(connection);
  const owner = await acquireLock(db);
  const stopHeartbeat = startLockHeartbeat(db, owner);
  let appliedCount = 0;

  try {
    const status = await getMigrationStatus(connection, migrations);
    const records = db.collection<AppliedMongoMigration>(MIGRATIONS_COLLECTION);

    for (const migration of status.filter((item) => !item.applied)) {
      const startedAt = Date.now();
      await migration.up(connection);
      await records.insertOne({
        _id: migration.id,
        name: migration.name,
        checksum: migration.checksum,
        appliedAt: new Date(),
        executionMs: Date.now() - startedAt,
      });
      appliedCount += 1;
    }
  } finally {
    stopHeartbeat();
    await releaseLock(db, owner);
  }

  return appliedCount;
}

export async function migrateDown(
  connection: Connection,
  migrations: readonly MongoMigration[],
): Promise<string | null> {
  const db = getDatabase(connection);
  const owner = await acquireLock(db);
  const stopHeartbeat = startLockHeartbeat(db, owner);

  try {
    const record = await db
      .collection<AppliedMongoMigration>(MIGRATIONS_COLLECTION)
      .findOne({}, { sort: { _id: -1 } });
    if (!record) return null;

    const migration = migrations.find((item) => item.id === record._id);
    if (!migration) {
      throw new Error(`Applied migration ${record._id} is not in the manifest`);
    }
    if (!migration.down) {
      throw new Error(`Migration ${migration.id} is irreversible`);
    }

    await migration.down(connection);
    await db
      .collection<AppliedMongoMigration>(MIGRATIONS_COLLECTION)
      .deleteOne({ _id: migration.id });
    return migration.id;
  } finally {
    stopHeartbeat();
    await releaseLock(db, owner);
  }
}
