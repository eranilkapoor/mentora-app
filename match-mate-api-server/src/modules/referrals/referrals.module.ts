import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileSchema,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  ReferralReward,
  ReferralRewardSchema,
} from './schemas/referral-reward.schema';
import { ReferralsController } from './controllers/referrals.controller';
import { ReferralsService } from './services/referrals.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: ReferralReward.name, schema: ReferralRewardSchema },
    ]),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
