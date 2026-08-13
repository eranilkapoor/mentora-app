import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { AdminController } from './controllers/admin.controller';
import { RbacController } from './controllers/rbac.controller';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { AdminPlansController } from './controllers/admin-plans.controller';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminIamController } from './controllers/admin-iam.controller';

// Services
import { AdminService } from './services/admin.service';
import { RbacService } from './services/rbac.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminIamService } from './services/admin-iam.service';

// Repository
import { AdminRepository } from './repositories/admin.repository';

// Schemas
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import {
  AdminAuditLog,
  AdminAuditLogSchema,
} from './schemas/admin-audit-log.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from '@/modules/auth/schemas/user-session.schema';
import {
  UserMembership,
  UserMembershipSchema,
} from '@/modules/contexts/schemas/contexts.schema';
import { Media, MediaSchema } from '@/common/schemas/user-media.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '@/modules/learning/schemas/learning.schemas';
import {
  Verification,
  VerificationSchema,
} from '@/modules/safety/schemas/verification.schema';
import {
  UserReport,
  UserReportSchema,
} from '@/modules/safety/schemas/user-report.schema';
import {
  Payment,
  PaymentSchema,
} from '@/modules/payments/schemas/payment.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '@/modules/subscriptions/schemas/subscription.schema';
import { SafetyModule } from '../safety/safety.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ChatModule } from '../chat/chat.module';
import { SettingsModule } from '../settings/settings.module';
import { UserMediaRepository } from '@/common/repositories/user-media.repository';
import { UserMediaModerationService } from '@/common/services/user-media-moderation.service';
import { UserMediaService } from '@/common/services/user-media.service';
import { VideoThumbnailService } from '@/common/services/video-thumbnail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      // User registered once  shared by both AdminService and RbacService
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AdminAuditLog.name, schema: AdminAuditLogSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Verification.name, schema: VerificationSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    SafetyModule,
    AnalyticsModule,
    NotificationsModule,
    PaymentsModule,
    SubscriptionsModule,
    SettingsModule,
    ChatModule,
  ],
  controllers: [
    AdminController,
    RbacController,
    AdminModerationController,
    AdminPaymentsController,
    AdminPlansController,
    AdminNotificationsController,
    AdminAnalyticsController,
    AdminIamController,
  ],
  providers: [
    AdminService,
    RbacService,
    AdminRepository,
    AdminAuditService,
    AdminIamService,
    UserMediaRepository,
    UserMediaModerationService,
    UserMediaService,
    VideoThumbnailService,
  ],
  exports: [
    RbacService, // export so other modules can check permissions if needed
    AdminAuditService,
  ],
})
export class AdminModule {}
