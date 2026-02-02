import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ==========================================
  // SECURITY MIDDLEWARE
  // ==========================================

  // Helmet - Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
      'X-Client-Version',
      'X-Platform',
      'X-Device-ID',
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
  app.use(compression());

  // ==========================================
  // GLOBAL PIPES
  // ==========================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==========================================
  // GLOBAL FILTERS
  // ==========================================

  app.useGlobalFilters(new AllExceptionsFilter());

  // ==========================================
  // GLOBAL INTERCEPTORS
  // ==========================================

  app.useGlobalInterceptors(new LoggingInterceptor());

  // ==========================================
  // API PREFIX
  // ==========================================

  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('api.prefix');
  const apiVersion = configService.get<string>('api.version');

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  // ==========================================
  // SWAGGER DOCUMENTATION
  // ==========================================

  const config = new DocumentBuilder()
    .setTitle('Matrimony API')
    .setDescription('API documentation for Matrimonial App')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ==========================================
  // START SERVER
  // ==========================================

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
