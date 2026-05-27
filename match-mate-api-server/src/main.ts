import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import * as path from 'path';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { AppLogger } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/logger/logger.interceptor';
import { HybridSocketIoAdapter } from './common/adapters/hybrid-socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  // ==========================================
  // BASIC HARDENING
  // ==========================================
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  // ==========================================
  // SECURITY MIDDLEWARE
  // ==========================================
  // Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Swagger compatibility
      crossOriginResourcePolicy: false, // IMPORTANT
    }),
  );

  // Body Size Limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser()); // MUST be before any routes

  // CORS (secure)
  const allowedOrigins = configService.get<string[]>('cors.origins') ?? [];
  const allowAnyOrigin = allowedOrigins.includes('*');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile apps / postman
      if (allowAnyOrigin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
      'X-Client-Version',
      'X-Platform',
      'X-Device-ID',
      'X-Device-Id',
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

  // Compression
  app.use(compression({ level: 6 }));

  // ==========================================
  // GLOBAL PIPES
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, //safer
      },
      exceptionFactory: (errors) => {
        return new BadRequestException({
          message: 'Validation failed',
          errors,
        });
      },
    }),
  );

  const logger = app.get(AppLogger);

  app.useLogger(logger);

  // ==========================================
  // GLOBAL FILTERS
  // ==========================================
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // ==========================================
  // GLOBAL INTERCEPTORS
  // ==========================================
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const wsAdapter = new HybridSocketIoAdapter(app, configService, logger);
  await wsAdapter.connectToRedis();
  app.useWebSocketAdapter(wsAdapter);

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.once(signal, () => {
      void wsAdapter.close();
    });
  }

  // ==========================================
  // VERSIONING + PREFIX
  // ==========================================
  const apiPrefix = configService.getOrThrow<string>('api.prefix');
  const apiVersion = configService.getOrThrow<string>('api.version');
  const env = configService.get<string>('env');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
    prefix: false,
  });

  app.setGlobalPrefix(apiPrefix);

  // ==========================================
  // SWAGGER (ONLY NON-PROD)
  // ==========================================
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Matrimony API')
      .setDescription('API documentation for Matrimonial App')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // ==========================================
  // STATIC FILES ( consider S3 in future)
  // ==========================================
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const uploadsPath = path.join(process.cwd(), 'uploads');

  app.use(
    '/uploads',
    express.static(uploadsPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true,

      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  // ==========================================
  // START SERVER
  // ==========================================
  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port, '0.0.0.0');

  logger.log(
    ` Server running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`,
  );

  if (env !== 'production') {
    logger.log(` Swagger Docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((err) => {
  process.stderr.write(`Application failed to start: ${String(err)}\n`);
  process.exit(1);
});
