import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('api.prefix');
  const apiVersion = configService.get<string>('api.version');

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  const config = new DocumentBuilder().setTitle('Matrimony API').setVersion('1.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doc);
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
