/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { ReferralRewardStatus } from '../enums/referral-reward-status.enum';
import { WalletTransactionSource } from '../enums/wallet-transaction.enum';
import { ReferralsService } from './referrals.service';

describe('ReferralsService', () => {
  const userModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const profileModel = { find: jest.fn() };
  const rewardModel = {
    find: jest.fn(),
    aggregate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  };
  const walletService = {
    getSummary: jest.fn(),
    redeem: jest.fn(),
    credit: jest.fn(),
  };

  let service: ReferralsService;
  let userId: string;
  let referredId: string;
  let referrerId: string;

  const createUser = (
    id: string,
    overrides: Record<string, unknown> = {},
  ): any => ({
    _id: new Types.ObjectId(id),
    email: 'member@test.com',
    referralCode: 'MEM123456',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });
  const profileQuery = (value: unknown) => ({
    select: () => ({
      lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
    }),
  });
  const rewardFindQuery = (value: unknown) => ({
    sort: () => ({
      populate: () => ({
        lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
      }),
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    referredId = new Types.ObjectId().toString();
    referrerId = new Types.ObjectId().toString();
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(createUser(userId)),
    });
    userModel.exists.mockResolvedValue(false);
    userModel.findByIdAndUpdate.mockResolvedValue({});
    profileModel.find.mockReturnValue(profileQuery([]));
    rewardModel.find.mockReturnValue(rewardFindQuery([]));
    rewardModel.aggregate.mockResolvedValue([]);
    walletService.getSummary.mockResolvedValue({
      balance: 100,
      redeemablePoints: 50,
      pendingPoints: 50,
      redemptionThreshold: 1000,
      transactions: [],
    });
    walletService.redeem.mockResolvedValue({ redeemed: true });
    walletService.credit.mockResolvedValue({ credited: true });
    service = new ReferralsService(
      userModel as never,
      profileModel as never,
      rewardModel as never,
      walletService as never,
    );
  });

  it('builds referral summaries with profile, email, phone, and member fallbacks', async () => {
    const populatedId = new Types.ObjectId(referredId);
    const secondId = new Types.ObjectId();
    const thirdId = new Types.ObjectId();
    const fourthId = new Types.ObjectId();
    rewardModel.find.mockReturnValue(
      rewardFindQuery([
        {
          referredUserId: {
            _id: populatedId,
            email: 'asha@test.com',
            phone: { countryCode: '91', phone: '9999999999' },
          },
          status: ReferralRewardStatus.REGISTERED,
          registrationPoints: 100,
          subscriptionPoints: 0,
          totalPoints: 100,
        },
        {
          referredUserId: { _id: secondId, email: 'email@test.com' },
          status: ReferralRewardStatus.REGISTERED,
          registrationPoints: 100,
          subscriptionPoints: 0,
          totalPoints: 100,
        },
        {
          referredUserId: thirdId.toString(),
          status: ReferralRewardStatus.REGISTERED,
          registrationPoints: 100,
          subscriptionPoints: 0,
          totalPoints: 100,
        },
        {
          referredUserId: { _id: fourthId, phone: { phone: '8888888888' } },
          status: ReferralRewardStatus.REGISTERED,
          registrationPoints: 100,
          subscriptionPoints: 0,
          totalPoints: 100,
        },
      ]),
    );
    profileModel.find.mockReturnValue(
      profileQuery([
        {
          userId: populatedId,
          personal: { firstName: 'Asha', lastName: 'Rao' },
        },
      ]),
    );
    await expect(service.getMySummary(userId)).resolves.toMatchObject({
      referralCode: 'MEM123456',
      totalPoints: 100,
      redemptionThreshold: 1000,
      registrationBonusPoints: 100,
      subscriptionRewardRate: 0.05,
      referredUsers: [
        expect.objectContaining({ name: 'Asha Rao', phone: '+91 9999999999' }),
        expect.objectContaining({ name: 'email@test.com', phone: undefined }),
        expect.objectContaining({ name: 'New member' }),
        expect.objectContaining({ name: 'New member', phone: '+ 8888888888' }),
      ],
    });
  });

  it('delegates wallet reads and redemption', async () => {
    await expect(service.getWallet(userId)).resolves.toMatchObject({
      balance: 100,
    });
    await expect(service.redeemWallet(userId, 1000)).resolves.toEqual({
      redeemed: true,
    });
  });

  it('builds bounded leaderboards with name fallbacks', async () => {
    const first = new Types.ObjectId(referrerId);
    const second = new Types.ObjectId();
    rewardModel.aggregate.mockResolvedValue([
      {
        _id: first,
        totalPoints: 500,
        referredCount: 2,
        subscriptionPoints: 300,
      },
      {
        _id: second,
        totalPoints: 100,
        referredCount: 1,
        subscriptionPoints: 0,
      },
    ]);
    profileModel.find.mockReturnValue(
      profileQuery([
        { userId: first, personal: { firstName: 'Asha', lastName: 'Rao' } },
      ]),
    );
    await expect(service.getLeaderboard(500)).resolves.toEqual([
      expect.objectContaining({ rank: 1, name: 'Asha Rao' }),
      expect.objectContaining({ rank: 2, name: 'Mentora member' }),
    ]);
    await service.getLeaderboard(0);
    await service.getLeaderboard();
  });

  it('ensures referral codes for existing/new users and rejects missing users', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(service.ensureReferralCode(userId)).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
    const existing = createUser(userId);
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(existing),
    });
    await expect(service.ensureReferralCode(userId)).resolves.toBe(existing);

    const fresh = createUser(userId, {
      referralCode: undefined,
      email: 'a-b@test.com',
    });
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(fresh),
    });
    userModel.exists.mockResolvedValue(false);
    await expect(service.ensureReferralCode(userId)).resolves.toBe(fresh);
    expect(fresh.referralCode).toMatch(/^ABM/);
    expect(fresh.save).toHaveBeenCalled();

    const fallback = createUser(userId, {
      referralCode: undefined,
      email: undefined,
    });
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(fallback),
    });
    userModel.exists.mockClear();
    userModel.exists.mockResolvedValue(true);
    await service.ensureReferralCode(userId);
    expect(fallback.referralCode).toHaveLength(10);
    expect(userModel.exists).toHaveBeenCalledTimes(10);
  });

  it('ignores blank registration codes and rejects duplicate/invalid/self referrals', async () => {
    const referred = createUser(referredId);
    jest
      .spyOn(service, 'ensureReferralCode')
      .mockResolvedValue(referred as never);
    await expect(
      service.applyRegistrationReferral(referredId, ' '),
    ).resolves.toBeUndefined();
    referred.referredBy = new Types.ObjectId(referrerId);
    await expect(
      service.applyRegistrationReferral(referredId, ' code '),
    ).rejects.toMatchObject({ code: ErrorCode.REFERRAL_ALREADY_APPLIED });
    referred.referredBy = undefined;
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.applyRegistrationReferral(referredId, ' code '),
    ).rejects.toMatchObject({ code: ErrorCode.REFERRAL_CODE_INVALID });
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(referred),
    });
    await expect(
      service.applyRegistrationReferral(referredId, ' code '),
    ).rejects.toMatchObject({ code: ErrorCode.REFERRAL_SELF_NOT_ALLOWED });
  });

  it('applies registration referrals, recalculates totals, and detects reward ownership conflicts', async () => {
    const referred = createUser(referredId);
    const referrer = createUser(referrerId, { referralCode: 'CODE' });
    jest
      .spyOn(service, 'ensureReferralCode')
      .mockResolvedValue(referred as never);
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(referrer),
    });
    rewardModel.aggregate.mockResolvedValue([{ totalPoints: 100 }]);
    const reward = {
      _id: new Types.ObjectId(),
      referrerId: referrer._id,
    };
    rewardModel.findOneAndUpdate.mockResolvedValue(reward);
    await service.applyRegistrationReferral(referredId, ' code ');
    expect(referred.referredBy).toBe(referrer._id);
    expect(walletService.credit).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(referrerId, {
      $set: { referralPoints: 100 },
    });

    rewardModel.findOneAndUpdate.mockResolvedValue({
      ...reward,
      referrerId: new Types.ObjectId(),
    });
    referred.referredBy = undefined;
    await expect(
      service.applyRegistrationReferral(referredId, 'CODE'),
    ).rejects.toMatchObject({ code: ErrorCode.REFERRAL_ALREADY_APPLIED });
  });

  it('credits registration rewards once after referred profile completion', async () => {
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.awardProfileCompletionReward(referredId),
    ).resolves.toBeUndefined();

    const reward = {
      _id: new Types.ObjectId(),
      referrerId: new Types.ObjectId(referrerId),
      referralCode: 'CODE',
      registrationPoints: 100,
      subscriptionPoints: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(reward),
    });
    rewardModel.aggregate.mockResolvedValue([{ totalPoints: 100 }]);

    await service.awardProfileCompletionReward(referredId);

    expect(reward).toMatchObject({
      totalPoints: 100,
      profileCompletedAt: expect.any(Date),
      registrationRewardedAt: expect.any(Date),
    });
    expect(walletService.credit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        points: 100,
        source: WalletTransactionSource.REFERRAL_REGISTRATION,
      }),
    );

    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...reward,
        registrationRewardedAt: new Date(),
      }),
    });
    await service.awardProfileCompletionReward(referredId);
    expect(walletService.credit).toHaveBeenCalledTimes(1);
  });

  it('validates optional referral codes', async () => {
    await expect(
      service.validateReferralCodeForRegistration(),
    ).resolves.toBeUndefined();
    userModel.exists.mockResolvedValue(false);
    await expect(
      service.validateReferralCodeForRegistration(' code '),
    ).rejects.toMatchObject({ code: ErrorCode.REFERRAL_CODE_INVALID });
    userModel.exists.mockResolvedValue(true);
    await expect(
      service.validateReferralCodeForRegistration(' code '),
    ).resolves.toBeUndefined();
  });

  it('awards one subscription reward with amount/default/negative handling', async () => {
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.awardSubscriptionReward(referredId, {}),
    ).resolves.toBeUndefined();
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ subscriptionPaymentId: 'paid' }),
    });
    await expect(
      service.awardSubscriptionReward(referredId, {}),
    ).resolves.toBeUndefined();

    const reward = {
      referrerId: new Types.ObjectId(referrerId),
      registrationPoints: 100,
      save: jest.fn().mockResolvedValue(undefined),
    };
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(reward),
    });
    rewardModel.aggregate.mockResolvedValue([]);
    await service.awardSubscriptionReward(referredId, {
      paymentId: 'payment',
      netAmount: 1000,
    });
    expect(reward).toMatchObject({
      status: ReferralRewardStatus.SUBSCRIBED,
      subscriptionPoints: 50,
      totalPoints: 150,
    });
    expect(walletService.credit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        points: 50,
        source: WalletTransactionSource.REFERRAL_SUBSCRIPTION,
      }),
    );
    expect(userModel.findByIdAndUpdate).toHaveBeenLastCalledWith(referrerId, {
      $set: { referralPoints: 0 },
    });

    const negativeReward: any = {
      referrerId: new Types.ObjectId(referrerId),
      registrationPoints: 100,
      save: jest.fn(),
    };
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(negativeReward),
    });
    await service.awardSubscriptionReward(referredId, { netAmount: -100 });
    expect(negativeReward.subscriptionPoints).toBe(0);

    const defaultReward: any = {
      referrerId: new Types.ObjectId(referrerId),
      registrationPoints: 100,
      save: jest.fn(),
    };
    rewardModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(defaultReward),
    });
    await service.awardSubscriptionReward(referredId, {});
    expect(defaultReward.subscriptionAmount).toBe(0);
  });

  it('normalizes referral codes and recalculates missing totals', async () => {
    const privateService = service as any;
    expect(privateService.normalizeReferralCode()).toBeUndefined();
    expect(privateService.normalizeReferralCode(' code ')).toBe('CODE');
    rewardModel.aggregate.mockResolvedValue([]);
    await privateService.recalculateUserReferralPoints(userId);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      $set: { referralPoints: 0 },
    });
  });
});
