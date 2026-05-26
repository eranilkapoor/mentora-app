import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBlock, UserBlockSchema } from './schemas/user-block.schema';
import { UserReport, UserReportSchema } from './schemas/user-report.schema';
import {
  Verification,
  VerificationSchema,
} from './schemas/verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SafetyModule {}
