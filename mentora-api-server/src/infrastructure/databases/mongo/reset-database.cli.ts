import * as dotenv from 'dotenv';
import { createConnection } from 'mongoose';

const run = async (): Promise<void> => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  dotenv.config({ path: [`.env.${nodeEnv}`, '.env'], quiet: true });

  const uri = process.env.MONGO_URI?.trim();
  if (!uri || process.env.DB_DRIVER === 'local') {
    throw new Error('Mongo reset requires DB_DRIVER=mongo and MONGO_URI');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to reset production database');
  }

  if (process.env.RESET_DATABASE_CONFIRM !== 'MENTORA_RESET') {
    throw new Error(
      'Refusing to reset database without RESET_DATABASE_CONFIRM=MENTORA_RESET',
    );
  }

  const connection = await createConnection(uri, {
    serverSelectionTimeoutMS: 10_000,
  }).asPromise();

  try {
    const dbName = connection.db?.databaseName ?? 'unknown';
    try {
      await connection.dropDatabase();
      console.log(`Dropped Mongo database: ${dbName}`);
      return;
    } catch (error) {
      console.warn(
        `dropDatabase denied for ${dbName}; purging collections instead. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const collections = await connection.db?.listCollections().toArray();
    for (const collection of collections ?? []) {
      await connection.db?.collection(collection.name).deleteMany({});
      console.log(`Purged collection: ${collection.name}`);
    }
    console.log(`Purged Mongo database collections: ${dbName}`);
  } finally {
    await connection.close();
  }
};

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
