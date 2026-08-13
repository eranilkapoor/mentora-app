import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBlock, UserBlockSchema } from './schemas/user-block.schema';
import {
  UserProfileHide,
  UserProfileHideSchema,
} from './schemas/user-profile-hide.schema';
import { UserReport, UserReportSchema } from './schemas/user-report.schema';
import {
  Verification,
  VerificationSchema,
} from './schemas/verification.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '@/modules/learning/schemas/learning.schemas';
import {
  ActivityLog,
  ActivityLogSchema,
} from '@/common/schemas/activity-log.schema';
import {
  Payment,
  PaymentSchema,
} from '@/modules/payments/schemas/payment.schema';
import {
  UserSession,
  UserSessionSchema,
} from '@/modules/auth/schemas/user-session.schema';
import { StorageModule } from '@/modules/storage/storage.module';
import { KycController } from './controllers/kyc.controller';
import { KycService } from './services/kyc.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { FraudDetectionTask } from './tasks/fraud-detection.task';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserProfileHide.name, schema: UserProfileHideSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: Verification.name, schema: VerificationSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [KycController],
  providers: [KycService, FraudDetectionService, FraudDetectionTask],
  exports: [MongooseModule, KycService, FraudDetectionService],
})
export class SafetyModule {}
