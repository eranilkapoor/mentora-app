import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configArray from '@/config';
import { envValidationSchema } from '@/config/validation';
import { MongoModule } from '@/infrastructure/databases/mongo/mongo.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './common/cache/cache.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { CorrelationIdMiddleware } from '@/common/middleware/correlation-id.middleware';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '@/common/guards/rate-limit.guard';
import { LoggerModule } from '@/common/logger/logger.module';
import { MonitoringModule } from '@/common/monitoring/monitoring.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ChatModule } from './modules/chat/chat.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SupportModule } from './modules/support/support.module';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    // ==========================================
    // CONFIG
    // ==========================================
    ConfigModule.forRoot({
      isGlobal: true,
      //  KEY PART
      envFilePath: [`.env.${nodeEnv}`, '.env'],
      load: configArray,
      validationSchema: envValidationSchema,
    }),
    // ==========================================
    //  THROTTLER (GLOBAL BASE RATE LIMIT)
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
    MonitoringModule,
    CacheModule,
    StorageModule,
    MongoModule,
    SeederModule,
    AuthModule,
    ProfilesModule,
    AdminModule,
    AnalyticsModule,
    ChatModule,
    MatchesModule,
    NotificationsModule,
    PaymentsModule,
    ReferralsModule,
    SettingsModule,
    SupportModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    // ==========================================
    //  ORDER MATTERS (TOP - BOTTOM)
    // ==========================================

    // 1 Throttler (first line of defense - IP based)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 2 JWT Auth (auth check)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 3 Custom Rate Limit (business logic - user based)
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('{*path}');
  }
}
