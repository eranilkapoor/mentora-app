import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  RequestMethod,
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
import { StorageService } from './modules/storage/services/storage.service';
import { ErrorCode } from './common/constants';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const setUploadHeaders = (res: {
  setHeader(name: string, value: number | string | readonly string[]): unknown;
}): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
};

const browserAssetProbePaths = new Set([
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
]);

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
  monitoring.initialize();

  const trustedProxyHops = configService.get<number>('app.trustedProxyHops', 0);
  app.set('trust proxy', trustedProxyHops);

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
  app.use(
    (
      request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (
        !browserAssetProbePaths.has(request.path) ||
        (request.method !== 'GET' && request.method !== 'HEAD')
      ) {
        return next();
      }

      response.setHeader('Cache-Control', 'public, max-age=86400');
      response.status(204).end();
    },
  );

  const allowedOrigins = configService.get<string[]>('cors.origins') ?? [];
  const allowAnyOrigin = allowedOrigins.includes('*');
  const corsMaxAgeSeconds = configService.get<number>(
    'cors.maxAgeSeconds',
    86400,
  );

  const embeddableStaticPagePaths = new Set([
    '/account-deletion',
    '/privacy-policy',
    '/terms-conditions',
    '/community-guidelines',
    '/child-safety',
    '/ai-tutor-disclaimer',
    '/refund-policy',
    '/faqs',
  ]);
  app.use(
    (
      request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (embeddableStaticPagePaths.has(request.path)) {
        response.removeHeader('X-Frame-Options');
        response.setHeader('Content-Security-Policy', 'frame-ancestors *');
      }
      next();
    },
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
      'X-Environment',
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

  const acceptedClientEnvironments = new Set(
    env === 'staging' ? ['staging', 'preview'] : [env],
  );
  app.use(
    (
      request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      const platform = request.header('X-Platform');
      if (!platform) return next();

      const clientEnvironment = request.header('X-Environment');
      if (
        clientEnvironment &&
        acceptedClientEnvironments.has(clientEnvironment.toLowerCase())
      ) {
        return next();
      }

      response.status(403).json({
        statusCode: 403,
        message: 'Client environment is not authorized for this API.',
        error: 'Forbidden',
      });
    },
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
    prefix: false,
  });
  app.setGlobalPrefix(apiPrefix, {
    exclude: [
      { path: 'privacy-policy', method: RequestMethod.GET },
      { path: 'terms-conditions', method: RequestMethod.GET },
      { path: 'community-guidelines', method: RequestMethod.GET },
      { path: 'child-safety', method: RequestMethod.GET },
      { path: 'ai-tutor-disclaimer', method: RequestMethod.GET },
      { path: 'refund-policy', method: RequestMethod.GET },
      { path: 'faqs', method: RequestMethod.GET },
      { path: 'account-deletion', method: RequestMethod.GET },
    ],
  });

  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Mentora API')
      .setDescription('API documentation for AI Tutoring App')
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

  const storageDriver = configService.get<string>('storage.driver', 'local');
  const s3BaseUrl = configService
    .get<string>('storage.awsS3BaseUrl', '')
    .replace(/\/+$/, '');
  const uploadsPath = path.join(process.cwd(), 'uploads');

  app.use('/uploads/kyc', (_req: express.Request, res: express.Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(404).json({
      success: false,
      code: ErrorCode.FILE_NOT_FOUND,
      message: 'File not found',
    });
  });

  if (storageDriver === 's3' && s3BaseUrl) {
    const storageService = app.get(StorageService);
    app.use(
      '/uploads',
      express.static(uploadsPath, {
        maxAge: '7d',
        etag: true,
        lastModified: true,
        setHeaders: setUploadHeaders,
      }),
    );
    app.use(
      '/uploads',
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          return next();
        }

        const key = req.path.replace(/^\/+/, '');
        try {
          const object = await storageService.getS3Object(key);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader(
            'Cache-Control',
            object.cacheControl ?? 'public, max-age=604800',
          );

          if (object.contentType) {
            res.setHeader('Content-Type', object.contentType);
          }

          if (typeof object.contentLength === 'number') {
            res.setHeader('Content-Length', String(object.contentLength));
          }

          if (req.method === 'HEAD') {
            return res.end();
          }

          object.body.on('error', next);
          return object.body.pipe(res);
        } catch (error) {
          return next(error);
        }
      },
    );
  } else {
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads',
      maxAge: '7d',
      etag: true,
      lastModified: true,
      setHeaders: setUploadHeaders,
    });
  }

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
