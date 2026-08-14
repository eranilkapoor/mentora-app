import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { INestApplicationContext, Type } from '@nestjs/common';
import * as dns from 'dns/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { auditMongoIndexes } from './index-audit';

const strict = process.argv.includes('--strict');
const json = process.argv.includes('--json');
const quiet = process.argv.includes('--quiet') || json;
const bootstrapTimeoutMs = Number(
  process.env.INDEX_AUDIT_BOOTSTRAP_TIMEOUT_MS ?? 45000,
);
const dnsPreflightTimeoutMs = Number(
  process.env.INDEX_AUDIT_DNS_TIMEOUT_MS ?? 12000,
);

const writeProgress = (message: string): void => {
  if (!quiet) console.error(message);
};

const formatUnknownError = (error: unknown): string => {
  if (error instanceof AggregateError) {
    return [
      error.stack ?? error.message,
      ...error.errors.map(
        (nested, index) =>
          `\n[aggregate:${index}] ${formatUnknownError(nested)}`,
      ),
    ].join('');
  }

  if (error instanceof Error) {
    const details = [error.stack || error.message || error.name];
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause) {
      details.push(`\nCaused by: ${formatUnknownError(cause)}`);
    }
    return details.join('');
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error(
    `[index:audit] unhandled rejection\n${formatUnknownError(reason)}`,
  );
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(
    `[index:audit] uncaught exception\n${formatUnknownError(error)}`,
  );
  process.exit(1);
});

const withTimeout = async <T>(
  runPromise: () => Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const pending = runPromise();
    return await Promise.race([pending, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const readEnvFile = (filePath: string): Record<string, string> => {
  if (!fs.existsSync(filePath)) return {};
  return dotenv.parse(fs.readFileSync(filePath));
};

const getCliMongoUri = (): string | undefined => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const nodeEnv = process.env.NODE_ENV || 'development';
  const rootDir = process.cwd();
  const baseEnv = readEnvFile(path.join(rootDir, '.env'));
  const modeEnv =
    nodeEnv === 'production'
      ? readEnvFile(path.join(rootDir, '.env.production'))
      : readEnvFile(path.join(rootDir, `.env.${nodeEnv}`));

  return modeEnv.MONGO_URI ?? baseEnv.MONGO_URI;
};

const getSrvRecordName = (mongoUri: string): string | null => {
  if (!mongoUri.startsWith('mongodb+srv://')) return null;
  const withoutProtocol = mongoUri.slice('mongodb+srv://'.length);
  const authorityAndPath = withoutProtocol.split('/')[0] ?? '';
  const host = authorityAndPath.slice(authorityAndPath.lastIndexOf('@') + 1);
  return host ? `_mongodb._tcp.${host}` : null;
};

const preflightMongoDns = async (): Promise<void> => {
  const mongoUri = getCliMongoUri();
  if (!mongoUri) return;

  const srvRecordName = getSrvRecordName(mongoUri);
  if (!srvRecordName) return;

  writeProgress(`[index:audit] checking Mongo SRV DNS ${srvRecordName}`);
  await withTimeout(
    () => dns.resolveSrv(srvRecordName),
    dnsPreflightTimeoutMs,
    `Mongo SRV DNS lookup for ${srvRecordName}`,
  );
};

const importAppModule = async (): Promise<Type<unknown>> => {
  const appModulePath = path.resolve(process.cwd(), 'src', 'app.module');
  const moduleExports = (await import(appModulePath)) as {
    AppModule: Type<unknown>;
  };
  return moduleExports.AppModule;
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

  let app: INestApplicationContext | undefined;

  try {
    await preflightMongoDns();
    const AppModule = await importAppModule();
    writeProgress('[index:audit] bootstrapping application context');
    app = await withTimeout(
      () =>
        NestFactory.createApplicationContext(AppModule, {
          abortOnError: false,
          logger: quiet ? false : ['error', 'warn'],
        }),
      bootstrapTimeoutMs,
      'Mongo index audit bootstrap',
    );
    writeProgress('[index:audit] resolving Mongo connection');
    const connection = app.get<Connection>(getConnectionToken());
    writeProgress('[index:audit] auditing Mongo indexes');
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
    if (app) {
      writeProgress('[index:audit] closing application context');
      await app.close();
    }
  }
};

void run().catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exit(1);
});
