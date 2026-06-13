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
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';
import { ReferralsController } from './controllers/referrals.controller';
import { WalletController } from './controllers/wallet.controller';
import { ReferralsService } from './services/referrals.service';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: ReferralReward.name, schema: ReferralRewardSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  controllers: [ReferralsController, WalletController],
  providers: [ReferralsService, WalletService],
  exports: [ReferralsService, WalletService],
})
export class ReferralsModule {}
