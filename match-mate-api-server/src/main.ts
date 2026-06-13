import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import Redis from 'ioredis';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppLogger } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { ErrorMonitoringService } from './common/monitoring/error-monitoring.service';
import { HybridSocketIoAdapter } from './common/adapters/hybrid-socket-io.adapter';
import {
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from '@/common/cache/cache.constants';
import { AppService } from './app.service';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function shutdown(
  signal: string,
  app: NestExpressApplication,
  wsAdapter: HybridSocketIoAdapter,
  logger: AppLogger,
): Promise<void> {
  const appService = app.get(AppService, { strict: false });
  const configService = app.get(ConfigService);
  const drainMs = configService.get<number>('app.shutdownDrainMs', 5000);

  logger.log(`Received ${signal} - starting graceful shutdown`);
  appService.markShuttingDown();
  logger.log(`Readiness disabled; draining traffic for ${drainMs}ms`);

  if (drainMs > 0) {
    await sleep(drainMs);
  }

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out - forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExit.unref();

  try {
    await app.close();
    await wsAdapter.close();

    logger.log('Graceful shutdown complete');
    clearTimeout(forceExit);
    process.exit(0);
  } catch (err: unknown) {
    logger.error(
      'Error during shutdown',
      err instanceof Error ? err.stack : String(err),
    );
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  const monitoring = app.get(ErrorMonitoringService);

  app.useLogger(logger);

  app.disable('x-powered-by');

  app.use(compression({ level: 6 }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());

  const allowedOrigins = configService.get<string[]>('cors.origins') ?? [];
  const allowAnyOrigin = allowedOrigins.includes('*');
  const corsMaxAgeSeconds = configService.get<number>(
    'cors.maxAgeSeconds',
    86400,
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowAnyOrigin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    maxAge: corsMaxAgeSeconds,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
      'X-Client-Version',
      'X-Platform',
      'X-Device-ID',
      'X-Refresh-Token',
      'X-API-Key',
    ],
    exposedHeaders: [
      'X-Correlation-ID',
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) =>
        new BadRequestException({ message: 'Validation failed', errors }),
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger, monitoring));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const pubClient = app.get<Redis | null>(REDIS_PUB_CLIENT, { strict: false });
  const subClient = app.get<Redis | null>(REDIS_SUB_CLIENT, { strict: false });

  const wsAdapter = new HybridSocketIoAdapter(
    app,
    pubClient,
    subClient,
    configService,
    logger,
  );

  await wsAdapter.connect();
  app.useWebSocketAdapter(wsAdapter);

  const apiPrefix = configService.getOrThrow<string>('api.prefix');
  const apiVersion = configService.getOrThrow<string>('api.version');
  const env = configService.get<string>('env', 'development');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
    prefix: false,
  });
  app.setGlobalPrefix(apiPrefix);

  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Matrimony API')
      .setDescription('API documentation for Matrimonial App')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res: express.Response): void => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.once(signal, () => {
      void shutdown(signal, app, wsAdapter, logger);
    });
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');

  logger.log(
    `Server running -> http://localhost:${port}/${apiPrefix}/${apiVersion}`,
  );
  if (env !== 'production') {
    logger.log(`Swagger docs -> http://localhost:${port}/${apiPrefix}/docs`);
  }
}

bootstrap().catch((err: unknown) => {
  process.stderr.write(
    `Application failed to start: ${
      err instanceof Error ? (err.stack ?? err.message) : String(err)
    }\n`,
  );
  process.exit(1);
});
