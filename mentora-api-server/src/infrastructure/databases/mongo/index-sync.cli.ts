import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '@/app.module';
import { auditMongoIndexes } from './index-audit';

const json = process.argv.includes('--json');
const quiet = process.argv.includes('--quiet') || json;

const writeProgress = (message: string): void => {
  if (!quiet) console.log(message);
};

const run = async (): Promise<void> => {
  process.env.MONGO_AUTO_INDEX = 'false';
  process.env.MONGO_RETRY_ATTEMPTS = '0';
  process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = '5000';
  process.env.MONGO_SOCKET_TIMEOUT_MS = '15000';
  process.env.MONGO_WAIT_QUEUE_TIMEOUT_MS = '5000';
  process.env.MONGO_SLOW_QUERY_THRESHOLD_MS = '0';
  process.env.RUN_SEEDER = 'false';
  process.env.NOTIFICATION_QUEUE_ENABLED = 'false';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const models = Object.values(connection.models).sort((left, right) =>
      left.collection.collectionName.localeCompare(
        right.collection.collectionName,
      ),
    );
    const results: Array<{
      collection: string;
      createdIndexes: number;
      error?: string;
    }> = [];

    for (const model of models) {
      const collection = model.collection.collectionName;
      writeProgress(`[sync] ${collection} started`);
      try {
        const before = await model.collection.indexes();
        await model.createIndexes();
        const after = await model.collection.indexes();
        results.push({
          collection,
          createdIndexes: Math.max(after.length - before.length, 0),
        });
        writeProgress(
          `[sync] ${collection} created ${Math.max(
            after.length - before.length,
            0,
          )} index(es)`,
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          collection,
          createdIndexes: 0,
          error: message,
        });
        writeProgress(`[sync] ${collection} failed: ${message}`);
      }
    }

    writeProgress('[sync] running post-sync audit');
    const report = await auditMongoIndexes(connection);
    if (json) {
      console.log(JSON.stringify({ results, report }, null, 2));
    } else {
      for (const result of results) {
        const suffix = result.error
          ? ` failed: ${result.error}`
          : ` created ${result.createdIndexes} index(es)`;
        console.log(`[sync] ${result.collection}${suffix}`);
      }
      console.log(
        `Checked ${report.checkedCollections} collection(s): ${report.expectedIndexes} expected and ${report.actualIndexes} actual index(es).`,
      );
      for (const issue of report.issues) {
        console.log(
          `[${issue.type}] ${issue.collection}.${issue.index}${issue.details ? ` ${issue.details}` : ''}`,
        );
      }
    }

    const blockingIssues = report.issues.filter(
      ({ type }) => type !== 'unexpected',
    );
    const failures = results.filter(({ error }) => error);
    if (failures.length > 0 || blockingIssues.length > 0) {
      throw new Error(
        `Mongo index sync completed with ${failures.length} sync failure(s) and ${blockingIssues.length} blocking audit issue(s)`,
      );
    }
  } finally {
    await app.close();
  }
};

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
