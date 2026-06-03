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
  Profile,
  ProfileSchema,
} from '@/modules/profiles/schemas/profile/profile.schema';
import { StorageModule } from '@/modules/storage/storage.module';
import { KycController } from './controllers/kyc.controller';
import { KycService } from './services/kyc.service';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserProfileHide.name, schema: UserProfileHideSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: Verification.name, schema: VerificationSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [MongooseModule, KycService],
})
export class SafetyModule {}
