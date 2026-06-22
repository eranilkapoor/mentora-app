import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '@/app.module';
import { auditMongoIndexes } from './index-audit';

const strict = process.argv.includes('--strict');
const json = process.argv.includes('--json');

const run = async (): Promise<void> => {
  process.env.MONGO_AUTO_INDEX = 'false';
  process.env.RUN_SEEDER = 'false';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const report = await auditMongoIndexes(connection);

    if (json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
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
      ({ type }) => strict || type !== 'unexpected',
    );
    if (blockingIssues.length > 0) {
      throw new Error(
        `Mongo index audit failed with ${blockingIssues.length} blocking issue(s)`,
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
