import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configArray from '@/config';
import { ENV_VALIDATION_SCHEMA } from '@/config/validation';
import { MongoModule } from '@/infrastructure/databases/mongo/mongo.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './common/cache/cache.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { CorrelationIdMiddleware } from '@/common/middleware/correlation-id.middleware';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '@/common/guards/rate-limit.guard';
import { InternalApiKeyGuard } from '@/common/guards/internal-api-key.guard';
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
import { SuccessStoriesModule } from './modules/success-stories/success-stories.module';

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
      validationSchema: ENV_VALIDATION_SCHEMA,
    }),
    // ==========================================
    //  THROTTLER (GLOBAL BASE RATE LIMIT)
    // ==========================================
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            // Nest Throttler uses milliseconds; environment TTL is seconds.
            ttl: configService.get<number>('THROTTLE_TTL', 60) * 1_000,
            limit: configService.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
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
    SuccessStoriesModule,
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
    // 4 Internal service-to-service API key guard (opt-in by metadata)
    {
      provide: APP_GUARD,
      useClass: InternalApiKeyGuard,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('{*path}');
  }
}
