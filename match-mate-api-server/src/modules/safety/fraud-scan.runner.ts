import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AppLogger } from '@/common/logger/logger.service';
import { FraudDetectionService } from './services/fraud-detection.service';

async function runFraudScan(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  try {
    const service = app.get(FraudDetectionService);
    const result = await service.runBatchScan({
      windowDays: Number(process.env.FRAUD_SCAN_WINDOW_DAYS ?? 14),
      limit: Number(process.env.FRAUD_SCAN_LIMIT ?? 100),
      highRiskThreshold: Number(
        process.env.FRAUD_SCAN_HIGH_RISK_THRESHOLD ?? 70,
      ),
    });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await app.close();
  }
}

runFraudScan().catch((error) => {
  process.stderr.write(`Fraud scan failed: ${String(error)}\n`);
  process.exit(1);
});
