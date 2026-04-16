import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configArray from './config';
import { envValidationSchema } from './config/validation';
import { MongoModule } from './infrastructure/databases/mongo/mongo.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    // ==========================================
    // CONFIG
    // ==========================================
    ConfigModule.forRoot({
      isGlobal: true,
      load: configArray,
      validationSchema: envValidationSchema,
    }),
    // ==========================================
    // ✅ THROTTLER (GLOBAL BASE RATE LIMIT)
    // ==========================================
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    // ==========================================
    // OTHER MODULES
    // ==========================================
    LoggerModule,
    CacheModule,
    StorageModule,
    MongoModule,
    AuthModule,
    ProfileModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [
    // ==========================================
    // ✅ ORDER MATTERS (TOP → BOTTOM)
    // ==========================================

    // 1️⃣ Throttler (first line of defense - IP based)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 2️⃣ JWT Auth (auth check)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 3️⃣ Custom Rate Limit (business logic - user based)
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
