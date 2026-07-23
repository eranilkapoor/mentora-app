/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { PlanTier, PlanType, SubscriptionStatus } from '@/common/enums';
import { PaymentGateway } from '@/modules/payments/enums/payment-gateway.enum';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  const subModel = {
    updateMany: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    distinct: jest.fn(),
  };
  const planModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const paymentModel = {
    exists: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };
  const userRepo = {
    updateMembership: jest.fn(),
    expireMemberships: jest.fn(),
  };

  let service: SubscriptionsService;
  let userId: string;
  let planId: string;
  let subscriptionId: Types.ObjectId;

  const leanExec = (value: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(value) }),
  });
  const basePlan = (overrides: Record<string, unknown> = {}) => ({
    _id: new Types.ObjectId(planId),
    isActive: true,
    price: 499,
    durationDays: 30,
    tier: PlanTier.GOLD,
    planType: PlanType.SELF_SERVICE,
    autoRenewDefault: true,
    trialDays: 7,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    planId = new Types.ObjectId().toString();
    subscriptionId = new Types.ObjectId();
    planModel.findById.mockReturnValue(leanExec(basePlan()));
    planModel.findOne.mockReturnValue(leanExec(null));
    subModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
    subModel.create.mockResolvedValue({
      _id: subscriptionId,
      startDate: new Date(),
    });
    userRepo.updateMembership.mockResolvedValue(undefined);
    userRepo.expireMemberships.mockResolvedValue({ modifiedCount: 0 });
    subModel.distinct.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    service = new SubscriptionsService(
      subModel as never,
      planModel as never,
      paymentModel as never,
      userRepo as never,
    );
  });

  it('rejects missing and inactive plans', async () => {
    planModel.findById.mockReturnValue(leanExec(null));
    await expect(service.purchasePlan(userId, planId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });
    planModel.findById.mockReturnValue(leanExec(basePlan({ isActive: false })));
    await expect(service.purchasePlan(userId, planId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });
  });

  it('purchases plans using defaults and explicit store options', async () => {
    await expect(service.purchasePlan(userId, planId)).resolves.toMatchObject({
      success: true,
    });
    expect(subModel.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoRenew: true }),
    );
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.GOLD, autoRenew: true }),
    );

    planModel.findById.mockReturnValue(
      leanExec(basePlan({ tier: undefined, autoRenewDefault: false })),
    );
    const trialEndsAt = new Date();
    await service.purchasePlan(userId, planId, {
      paymentId: new Types.ObjectId().toString(),
      paymentProvider: PaymentGateway.GOOGLE_PLAY,
      autoRenew: false,
      trialEndsAt,
      storeProductId: 'gold.monthly',
      storeTransactionId: 'tx',
      storeOriginalTransactionId: 'original',
    });
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.FREE, autoRenew: false }),
    );
  });

  it('reconciles store subscriptions idempotently or purchases a new one', async () => {
    const options = {
      planId,
      paymentProvider: PaymentGateway.APPLE_IAP,
      storeProductId: 'gold.monthly',
      storeTransactionId: 'tx',
      storeOriginalTransactionId: 'original',
    };
    const existing = {
      _id: subscriptionId,
      autoRenew: true,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(),
      storeLastVerifiedAt: new Date(),
      save: jest.fn(),
    };
    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(existing),
    });
    await expect(
      service.reconcileStoreSubscription(userId, options),
    ).resolves.toEqual({
      success: true,
      subscription: existing,
      reconciled: true,
    });
    expect(existing.save).toHaveBeenCalled();
    expect(userRepo.updateMembership).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
    );

    planModel.findById.mockReturnValue(leanExec(null));
    await service.reconcileStoreSubscription(userId, options);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.FREE }),
    );

    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    const purchase = jest
      .spyOn(service, 'purchasePlan')
      .mockResolvedValue({ created: true } as never);
    await expect(
      service.reconcileStoreSubscription(userId, options),
    ).resolves.toEqual({
      created: true,
    });
    expect(purchase).toHaveBeenCalledWith(
      userId,
      planId,
      expect.objectContaining({ autoRenew: true }),
    );
  });

  it('reconciles Google Play lifecycle changes by purchase token', async () => {
    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.reconcileGooglePlayLifecycle('token', {
        productId: 'mentora_gold',
        expiresAt: new Date(),
        autoRenew: false,
        status: SubscriptionStatus.EXPIRED,
        providerPayload: {},
      }),
    ).resolves.toBeNull();

    const subscription = {
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      startDate: new Date(),
      endDate: new Date(),
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
      storeProductId: 'mentora_gold',
      storeBasePlanId: 'monthly',
      storeOfferId: 'trial',
      storeLastVerifiedAt: new Date(),
      storeTransactionId: 'old-order',
      cancelledAt: undefined as Date | undefined,
      cancelledReason: undefined as string | undefined,
      save: jest.fn(),
    };
    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(subscription),
    });
    const expiresAt = new Date(Date.now() + 86_400_000);
    await service.reconcileGooglePlayLifecycle('token', {
      productId: 'mentora_gold',
      basePlanId: 'monthly',
      offerId: 'trial-7-days',
      transactionId: 'new-order',
      expiresAt,
      autoRenew: true,
      status: SubscriptionStatus.ACTIVE,
      providerPayload: {},
    });
    expect(subscription).toMatchObject({
      endDate: expiresAt,
      storeTransactionId: 'new-order',
      status: SubscriptionStatus.ACTIVE,
    });
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.GOLD }),
    );

    const upgradedPlanId = new Types.ObjectId();
    planModel.findOne.mockReturnValue(
      leanExec(
        basePlan({
          _id: upgradedPlanId,
          tier: PlanTier.PLATINUM,
        }),
      ),
    );
    await service.reconcileGooglePlayLifecycle('token', {
      productId: 'mentora_platinum',
      basePlanId: 'monthly',
      expiresAt,
      autoRenew: true,
      status: SubscriptionStatus.ACTIVE,
      providerPayload: {},
    });
    expect(planModel.findOne).toHaveBeenLastCalledWith({
      isActive: true,
      'storeProducts.android.productId': 'mentora_platinum',
      'storeProducts.android.basePlanId': 'monthly',
    });
    expect(subscription.planId).toEqual(upgradedPlanId);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({
        tier: PlanTier.PLATINUM,
        planId: upgradedPlanId.toString(),
      }),
    );

    planModel.findOne.mockReturnValue(leanExec(null));
    await service.reconcileGooglePlayLifecycle('token', {
      productId: 'mentora_gold',
      expiresAt,
      autoRenew: false,
      status: SubscriptionStatus.EXPIRED,
      subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED',
      providerPayload: {},
    });
    expect(subscription.cancelledAt).toEqual(expect.any(Date));
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.FREE }),
    );
  });

  it('revokes Google Play entitlements after refunds or chargebacks', async () => {
    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.revokeGooglePlayEntitlement('token', 'voided'),
    ).resolves.toBeNull();

    const subscription = {
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      startDate: new Date(),
      endDate: new Date(Date.now() + 86_400_000),
      status: SubscriptionStatus.ACTIVE,
      autoRenew: true,
      cancelledAt: undefined as Date | undefined,
      cancelledReason: undefined as string | undefined,
      storeLastVerifiedAt: new Date(),
      save: jest.fn(),
    };
    subModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(subscription),
    });
    await service.revokeGooglePlayEntitlement('token', 'voided');

    expect(subscription).toMatchObject({
      status: SubscriptionStatus.CANCELLED,
      autoRenew: false,
      cancelledReason: 'voided',
    });
    expect(subscription.save).toHaveBeenCalled();
    expect(userRepo.updateMembership).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        tier: PlanTier.FREE,
        status: SubscriptionStatus.CANCELLED,
      }),
    );
  });

  it.each([
    [null, 'missing'],
    [basePlan({ isActive: false }), 'inactive'],
    [basePlan({ price: 0 }), 'free'],
    [basePlan({ planType: PlanType.LEARNING_BOOST }), 'boost'],
    [basePlan({ isCustom: true }), 'custom'],
  ])('rejects unavailable trial plan: %s (%s)', async (plan, label) => {
    expect(label).toEqual(expect.any(String));
    planModel.findById.mockReturnValue(leanExec(plan));
    await expect(service.startFreeTrial(userId, planId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });
  });

  it('rejects trials after a prior paid subscription or payment', async () => {
    planModel.find.mockReturnValue({
      select: () => leanExec([{ _id: new Types.ObjectId(planId) }]),
    });
    subModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(true),
    });
    paymentModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(false),
    });
    await expect(service.startFreeTrial(userId, planId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });

    subModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(false),
    });
    paymentModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(true),
    });
    await expect(service.startFreeTrial(userId, planId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });
  });

  it('starts trials using explicit, plan, and fallback durations', async () => {
    planModel.find.mockReturnValue({ select: () => leanExec([]) });
    subModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(false),
    });
    paymentModel.exists.mockReturnValue({
      exec: jest.fn().mockResolvedValue(false),
    });
    subModel.findByIdAndUpdate.mockResolvedValue({
      status: SubscriptionStatus.TRIAL,
    });

    await expect(
      service.startFreeTrial(userId, planId, 14),
    ).resolves.toMatchObject({
      success: true,
    });
    await service.startFreeTrial(userId, planId);
    planModel.findById.mockReturnValue(
      leanExec(basePlan({ trialDays: undefined, tier: undefined })),
    );
    await service.startFreeTrial(userId, planId);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({
        tier: PlanTier.FREE,
        status: SubscriptionStatus.TRIAL,
      }),
    );
  });

  it('returns active subscriptions through the populated lean query', async () => {
    const active = { _id: subscriptionId };
    subModel.findOne.mockReturnValue({
      populate: () => leanExec(active),
    });
    await expect(service.getActiveSubscription(userId)).resolves.toBe(active);
  });

  it('returns the canonical free plan fallback when no paid entitlement is active', async () => {
    const freePlan = basePlan({
      _id: new Types.ObjectId(),
      price: 0,
      tier: PlanTier.FREE,
    });
    subModel.findOne.mockReturnValue({
      populate: () => leanExec(null),
    });
    planModel.findOne.mockReturnValue(leanExec(freePlan));

    await expect(service.getActiveSubscription(userId)).resolves.toMatchObject({
      planId: expect.objectContaining({ tier: PlanTier.FREE }),
      status: SubscriptionStatus.ACTIVE,
      autoRenew: false,
      isFallback: true,
    });
  });

  it('builds billing summaries with totals, payment, and default fallbacks', async () => {
    jest.spyOn(service, 'getActiveSubscription').mockResolvedValue({
      autoRenew: true,
      endDate: new Date(Date.now() + 86_400_000),
    } as never);
    subModel.find.mockReturnValue({
      populate: () => ({
        sort: () => ({ limit: () => leanExec([{ id: 1 }]) }),
      }),
    });
    paymentModel.find.mockReturnValue({
      populate: () => ({
        sort: () => ({
          limit: () => ({ select: () => leanExec([{ currency: 'USD' }]) }),
        }),
      }),
    });
    paymentModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'EUR',
          totalPaid: 100,
          paymentCount: 2,
          lastPaymentAt: new Date(),
        },
      ]),
    });
    await expect(service.getBillingSummary(userId)).resolves.toMatchObject({
      billing: {
        currency: 'EUR',
        totalPaid: 100,
        successfulPayments: 2,
        nextRenewalAt: expect.any(Date),
        autoRenew: true,
      },
    });

    jest.spyOn(service, 'getActiveSubscription').mockResolvedValue(null);
    paymentModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    await expect(service.getBillingSummary(userId)).resolves.toMatchObject({
      billing: {
        currency: 'USD',
        totalPaid: 0,
        successfulPayments: 0,
        nextRenewalAt: null,
      },
    });
    paymentModel.find.mockReturnValue({
      populate: () => ({
        sort: () => ({ limit: () => ({ select: () => leanExec([]) }) }),
      }),
    });
    await expect(service.getBillingSummary(userId)).resolves.toMatchObject({
      billing: { currency: 'INR' },
    });
  });

  it('cancels active and trial subscriptions with membership fallbacks', async () => {
    subModel.findOne.mockResolvedValue(null);
    await expect(service.cancelSubscription(userId)).rejects.toMatchObject({
      code: ErrorCode.SUBSCRIPTION_NOT_FOUND,
    });

    const active = {
      planId: new Types.ObjectId(planId),
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(),
      save: jest.fn(),
    };
    subModel.findOne.mockResolvedValue(active);
    planModel.findById.mockReturnValue(leanExec(basePlan()));
    await service.cancelSubscription(userId, 'requested');
    expect(active.status).toBe(SubscriptionStatus.ACTIVE);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.GOLD }),
    );

    planModel.findById.mockReturnValue(leanExec(null));
    await service.cancelSubscription(userId);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.FREE }),
    );

    const trial = {
      ...active,
      status: SubscriptionStatus.TRIAL,
      save: jest.fn(),
    };
    subModel.findOne.mockResolvedValue(trial);
    planModel.findById.mockReturnValue(leanExec(null));
    await service.cancelSubscription(userId);
    expect(trial.status).toBe(SubscriptionStatus.CANCELLED);
    expect(userRepo.updateMembership).toHaveBeenLastCalledWith(
      userId,
      expect.objectContaining({ tier: PlanTier.FREE }),
    );
  });

  it('expires overdue subscriptions and marks reminder windows', async () => {
    const expiredUserId = new Types.ObjectId();
    subModel.distinct.mockReturnValue({
      exec: jest.fn().mockResolvedValue([expiredUserId]),
    });
    subModel.updateMany
      .mockResolvedValueOnce({ modifiedCount: 3 })
      .mockResolvedValueOnce({ modifiedCount: 2 })
      .mockResolvedValueOnce({ modifiedCount: 1 });
    await expect(service.expireOverdueSubscriptions()).resolves.toEqual({
      expiredCount: 3,
    });
    expect(userRepo.expireMemberships).toHaveBeenCalledWith(
      [expiredUserId.toString()],
      expect.any(Date),
    );
    await expect(service.markExpiryRemindersDue([7, 1])).resolves.toEqual({
      reminders: [
        { offsetDays: 7, markedCount: 2 },
        { offsetDays: 1, markedCount: 1 },
      ],
    });
  });
});
