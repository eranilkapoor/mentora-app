import * as dotenv from 'dotenv';
import { createConnection } from 'mongoose';
import { MONGO_MIGRATIONS } from './index';
import {
  getMigrationStatus,
  migrateDown,
  migrateUp,
  validateMigrationManifest,
} from './migration-runner';

type MigrationCommand = 'down' | 'status' | 'up' | 'validate';

const command = (process.argv[2] ?? 'status') as MigrationCommand;
const supportedCommands: MigrationCommand[] = [
  'up',
  'down',
  'status',
  'validate',
];

if (!supportedCommands.includes(command)) {
  throw new Error(`Unsupported migration command: ${command}`);
}

const run = async (): Promise<void> => {
  validateMigrationManifest(MONGO_MIGRATIONS);

  if (command === 'validate') {
    console.log(`Validated ${MONGO_MIGRATIONS.length} Mongo migration(s).`);
    return;
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  dotenv.config({ path: [`.env.${nodeEnv}`, '.env'], quiet: true });
  const uri = process.env.MONGO_URI?.trim();
  if (!uri || process.env.DB_DRIVER === 'local') {
    throw new Error('Mongo migrations require DB_DRIVER=mongo and MONGO_URI');
  }

  const connection = await createConnection(uri, {
    serverSelectionTimeoutMS: 10_000,
  }).asPromise();

  try {
    if (command === 'up') {
      const count = await migrateUp(connection, MONGO_MIGRATIONS);
      console.log(`Applied ${count} Mongo migration(s).`);
      return;
    }

    if (command === 'down') {
      const id = await migrateDown(connection, MONGO_MIGRATIONS);
      console.log(
        id ? `Reverted migration ${id}.` : 'No migrations to revert.',
      );
      return;
    }

    const status = await getMigrationStatus(connection, MONGO_MIGRATIONS);
    for (const migration of status) {
      console.log(
        `${migration.applied ? '[applied]' : '[pending]'} ${migration.id} ${migration.name}`,
      );
    }
  } finally {
    await connection.close();
  }
};

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
