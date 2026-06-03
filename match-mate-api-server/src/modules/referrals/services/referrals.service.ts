import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwConflict,
} from '@/common/exceptions/throw-app-exception';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  ReferralReward,
  ReferralRewardDocument,
} from '../schemas/referral-reward.schema';
import { ReferralRewardStatus } from '../enums/referral-reward-status.enum';
import { ReferralSummary } from '../dto/referral-summary.dto';
import { WalletService } from './wallet.service';
import { WalletTransactionSource } from '../enums/wallet-transaction.enum';

const REGISTRATION_BONUS_POINTS = 100;
const SUBSCRIPTION_REWARD_RATE = 0.05;
const REDEMPTION_THRESHOLD = 1000;

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(ReferralReward.name)
    private readonly rewardModel: Model<ReferralRewardDocument>,
    private readonly walletService: WalletService,
  ) {}

  async getMySummary(userId: string): Promise<ReferralSummary> {
    const user = await this.ensureReferralCode(userId);
    const rewards = await this.rewardModel
      .find({ referrerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('referredUserId', 'email phone')
      .lean()
      .exec();

    const referredUserIds = rewards.map((reward) =>
      String(reward.referredUserId?._id ?? reward.referredUserId),
    );

    const profiles = await this.profileModel
      .find({
        userId: { $in: referredUserIds.map((id) => new Types.ObjectId(id)) },
      })
      .select('userId personal.firstName personal.lastName')
      .lean()
      .exec();

    const profileByUserId = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );

    const wallet = await this.walletService.getSummary(userId);

    const referredUsers = rewards.map((reward) => {
      const referredUser = reward.referredUserId as unknown as {
        _id?: Types.ObjectId;
        email?: string;
        phone?: { countryCode?: string; phone?: string };
      };
      const referredUserId = String(referredUser?._id ?? reward.referredUserId);
      const profile = profileByUserId.get(referredUserId);
      const fullName = [
        profile?.personal?.firstName,
        profile?.personal?.lastName,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        userId: referredUserId,
        name: fullName || referredUser.email || 'New member',
        email: referredUser.email,
        phone: referredUser.phone?.phone
          ? `+${referredUser.phone.countryCode ?? ''} ${referredUser.phone.phone}`.trim()
          : undefined,
        joinedAt: reward.joinedAt,
        status: reward.status,
        registrationPoints: reward.registrationPoints,
        subscriptionPoints: reward.subscriptionPoints,
        totalPoints: reward.totalPoints,
        subscribedAt: reward.subscribedAt,
      };
    });

    return {
      referralCode: user.referralCode!,
      totalPoints: wallet.balance,
      redeemablePoints: wallet.redeemablePoints,
      pendingPoints: wallet.pendingPoints,
      redemptionThreshold: REDEMPTION_THRESHOLD,
      registrationBonusPoints: REGISTRATION_BONUS_POINTS,
      subscriptionRewardRate: SUBSCRIPTION_REWARD_RATE,
      wallet,
      referredUsers,
    };
  }

  getWallet(userId: string) {
    return this.walletService.getSummary(userId);
  }

  redeemWallet(userId: string, points: number) {
    return this.walletService.redeem(userId, points);
  }

  async getLeaderboard(limit = 25) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const leaders = await this.rewardModel.aggregate<{
      _id: Types.ObjectId;
      totalPoints: number;
      referredCount: number;
      subscriptionPoints: number;
    }>([
      {
        $group: {
          _id: '$referrerId',
          totalPoints: { $sum: '$totalPoints' },
          referredCount: { $sum: 1 },
          subscriptionPoints: { $sum: '$subscriptionPoints' },
        },
      },
      { $sort: { totalPoints: -1, referredCount: -1 } },
      { $limit: safeLimit },
    ]);

    const userIds = leaders.map((leader) => leader._id);
    const profiles = await this.profileModel
      .find({ userId: { $in: userIds } })
      .select('userId personal.firstName personal.lastName')
      .lean()
      .exec();
    const profileByUserId = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );

    return leaders.map((leader, index) => {
      const profile = profileByUserId.get(String(leader._id));
      return {
        rank: index + 1,
        userId: String(leader._id),
        name:
          [profile?.personal?.firstName, profile?.personal?.lastName]
            .filter(Boolean)
            .join(' ') || 'Match Mate member',
        totalPoints: leader.totalPoints,
        referredCount: leader.referredCount,
        subscriptionPoints: leader.subscriptionPoints,
      };
    });
  }

  async ensureReferralCode(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      return throwBadRequest(ErrorCode.USER_NOT_FOUND);
    }

    if (user.referralCode) {
      return user;
    }

    user.referralCode = await this.generateUniqueReferralCode(user);
    await user.save();

    return user;
  }

  async applyRegistrationReferral(
    referredUserId: string,
    referralCode?: string,
  ): Promise<void> {
    const normalizedCode = this.normalizeReferralCode(referralCode);
    const referredUser = await this.ensureReferralCode(referredUserId);

    if (!normalizedCode) {
      return;
    }

    if (referredUser.referredBy) {
      return throwConflict(ErrorCode.REFERRAL_ALREADY_APPLIED);
    }

    const referrer = await this.userModel
      .findOne({ referralCode: normalizedCode })
      .exec();

    if (!referrer) {
      return throwBadRequest(ErrorCode.REFERRAL_CODE_INVALID);
    }

    if (String(referrer._id) === String(referredUser._id)) {
      return throwBadRequest(ErrorCode.REFERRAL_SELF_NOT_ALLOWED);
    }

    referredUser.referredBy = referrer._id;
    await referredUser.save();

    const reward = await this.rewardModel.findOneAndUpdate(
      { referredUserId: referredUser._id },
      {
        $setOnInsert: {
          referrerId: referrer._id,
          referredUserId: referredUser._id,
          referralCode: normalizedCode,
          status: ReferralRewardStatus.REGISTERED,
          registrationPoints: REGISTRATION_BONUS_POINTS,
          subscriptionPoints: 0,
          totalPoints: REGISTRATION_BONUS_POINTS,
          joinedAt: new Date(),
          subscriptionRewardRate: SUBSCRIPTION_REWARD_RATE,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await this.recalculateUserReferralPoints(String(referrer._id));
    await this.walletService.credit({
      userId: referrer._id,
      points: REGISTRATION_BONUS_POINTS,
      source: WalletTransactionSource.REFERRAL_REGISTRATION,
      referenceId: reward._id.toString(),
      metadata: {
        referredUserId: referredUser._id.toString(),
        referralCode: normalizedCode,
      },
    });

    if (reward.referrerId.toString() !== referrer._id.toString()) {
      return throwConflict(ErrorCode.REFERRAL_ALREADY_APPLIED);
    }
  }

  async validateReferralCodeForRegistration(
    referralCode?: string,
  ): Promise<void> {
    const normalizedCode = this.normalizeReferralCode(referralCode);
    if (!normalizedCode) {
      return;
    }

    const exists = await this.userModel.exists({
      referralCode: normalizedCode,
    });
    if (!exists) {
      return throwBadRequest(ErrorCode.REFERRAL_CODE_INVALID);
    }
  }

  async awardSubscriptionReward(
    referredUserId: string,
    payment: {
      paymentId?: string;
      netAmount?: number;
    },
  ): Promise<void> {
    const reward = await this.rewardModel
      .findOne({ referredUserId: new Types.ObjectId(referredUserId) })
      .exec();

    if (!reward || reward.subscriptionPaymentId) {
      return;
    }

    const netAmount = Number(payment.netAmount ?? 0);
    const subscriptionPoints = Math.max(
      0,
      Math.round(netAmount * SUBSCRIPTION_REWARD_RATE),
    );

    reward.status = ReferralRewardStatus.SUBSCRIBED;
    reward.subscriptionPoints = subscriptionPoints;
    reward.subscriptionAmount = netAmount;
    reward.subscriptionRewardRate = SUBSCRIPTION_REWARD_RATE;
    reward.subscriptionPaymentId = payment.paymentId;
    reward.subscribedAt = new Date();
    reward.totalPoints = reward.registrationPoints + subscriptionPoints;
    await reward.save();

    await this.recalculateUserReferralPoints(String(reward.referrerId));
    await this.walletService.credit({
      userId: reward.referrerId,
      points: subscriptionPoints,
      source: WalletTransactionSource.REFERRAL_SUBSCRIPTION,
      referenceId: payment.paymentId,
      metadata: {
        referredUserId,
        subscriptionAmount: netAmount,
        subscriptionRewardRate: SUBSCRIPTION_REWARD_RATE,
      },
    });
  }

  private normalizeReferralCode(code?: string): string | undefined {
    const normalized = code?.trim().toUpperCase();
    return normalized || undefined;
  }

  private async generateUniqueReferralCode(
    user: UserDocument,
  ): Promise<string> {
    const prefix = (user.email?.split('@')[0] ?? 'MM')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, 'M');

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const suffix = randomBytes(3).toString('hex').toUpperCase();
      const code = `${prefix}${suffix}`.slice(0, 9);
      const exists = await this.userModel.exists({ referralCode: code });
      if (!exists) {
        return code;
      }
    }

    return randomBytes(5).toString('hex').toUpperCase();
  }

  private async recalculateUserReferralPoints(userId: string): Promise<void> {
    const result = await this.rewardModel.aggregate<{ totalPoints: number }>([
      { $match: { referrerId: new Types.ObjectId(userId) } },
      { $group: { _id: '$referrerId', totalPoints: { $sum: '$totalPoints' } } },
    ]);

    await this.userModel.findByIdAndUpdate(userId, {
      $set: { referralPoints: result[0]?.totalPoints ?? 0 },
    });
  }
}
