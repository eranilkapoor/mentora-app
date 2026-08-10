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
import { ActivitiesModule } from './modules/activities/activities.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { ChatModule } from './modules/chat/chat.module';
import { CallCenterModule } from './modules/call-center/call-center.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SupportModule } from './modules/support/support.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { FieldForceModule } from './modules/field-force/field-force.module';
import { FinanceLedgersModule } from './modules/finance-ledgers/finance-ledgers.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { LearningModule } from './modules/learning/learning.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { ContextsModule } from './modules/contexts/contexts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EventsModule } from './modules/events/events.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ImportsExportsModule } from './modules/imports-exports/imports-exports.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ModuleRecordsModule } from './modules/module-records/module-records.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ScholarshipsModule } from './modules/scholarships/scholarships.module';
import { SecurityPoliciesModule } from './modules/security-policies/security-policies.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TagsModule } from './modules/tags/tags.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';

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
    ActivitiesModule,
    AdmissionsModule,
    ChatModule,
    CallCenterModule,
    NotificationsModule,
    PaymentsModule,
    ReferralsModule,
    FieldForceModule,
    FinanceLedgersModule,
    FollowUpsModule,
    LearningModule,
    ContextsModule,
    OrganizationsModule,
    LeadsModule,
    ApplicationsModule,
    TasksModule,
    CampaignsModule,
    CommunicationsModule,
    DocumentsModule,
    EventsModule,
    InterviewsModule,
    IntegrationsModule,
    ImportsExportsModule,
    MeetingsModule,
    ProgramsModule,
    ModuleRecordsModule,
    ScholarshipsModule,
    SecurityPoliciesModule,
    WhatsappModule,
    TagsModule,
    DashboardModule,
    WorkflowsModule,
    ReportsModule,
    SettingsModule,
    SupportModule,
    FeatureFlagsModule,
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
