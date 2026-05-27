import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '@/modules/app/app.module';
import { AppLogger } from '@/common/logger/logger.service';
import { MasterSeederService } from './services/master-seeder.service';

async function runSeeder(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  try {
    const configService = app.get(ConfigService);
    const env = configService.get<string>('env');

    if (
      env === 'production' &&
      process.env.SEEDER_CONFIRM !== 'MATCHMATE_PROD'
    ) {
      throw new Error(
        'Refusing to seed production without SEEDER_CONFIRM=MATCHMATE_PROD',
      );
    }

    await app.get(MasterSeederService).run();
  } finally {
    await app.close();
  }
}

runSeeder().catch((error) => {
  // Keep this as the last-resort startup failure path before the logger exists.
  process.stderr.write(`Seeder failed: ${String(error)}\n`);
  process.exit(1);
});
