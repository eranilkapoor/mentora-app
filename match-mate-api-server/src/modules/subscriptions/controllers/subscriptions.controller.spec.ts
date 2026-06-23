import { SubscriptionsController } from './subscriptions.controller';
import { SuccessCode } from '@/common/constants';

describe('SubscriptionsController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;

  const planService = {
    getActivePlansWithFeatures: jest.fn(),
  };
  const subscriptionsService = {
    getActiveSubscription: jest.fn(),
    getBillingSummary: jest.fn(),
    startFreeTrial: jest.fn(),
    cancelSubscription: jest.fn(),
  };
  const profileBoostService = {
    getMyBoosts: jest.fn(),
  };

  let controller: SubscriptionsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SubscriptionsController(
      planService as never,
      subscriptionsService as never,
      profileBoostService as never,
    );
  });

  it('fetches plans, current subscription, billing, and boosts', async () => {
    planService.getActivePlansWithFeatures.mockResolvedValue([
      { id: 'plan-1' },
    ]);
    subscriptionsService.getActiveSubscription.mockResolvedValue({
      id: 'sub-1',
    });
    subscriptionsService.getBillingSummary.mockResolvedValue({ total: 499 });
    profileBoostService.getMyBoosts.mockResolvedValue([{ id: 'boost-1' }]);

    const plans = await controller.getPlans();
    const current = await controller.getCurrentSubscription(req);
    const billing = await controller.getBillingSummary(req);
    const boosts = await controller.getMyBoosts(req);

    expect(planService.getActivePlansWithFeatures).toHaveBeenCalledTimes(1);
    expect(subscriptionsService.getActiveSubscription).toHaveBeenCalledWith(
      userId,
    );
    expect(subscriptionsService.getBillingSummary).toHaveBeenCalledWith(userId);
    expect(profileBoostService.getMyBoosts).toHaveBeenCalledWith(userId);
    expect(plans.code).toBe(SuccessCode.PLANS_FETCHED);
    expect(current.code).toBe(SuccessCode.SUBSCRIPTION_ACTIVATED);
    expect(billing.code).toBe(SuccessCode.SUBSCRIPTION_BILLING_FETCHED);
    expect(boosts.code).toBe(SuccessCode.SUBSCRIPTION_BILLING_FETCHED);
  });

  it('starts trials and cancels subscriptions for the current user', async () => {
    subscriptionsService.startFreeTrial.mockResolvedValue({ id: 'sub-1' });
    subscriptionsService.cancelSubscription.mockResolvedValue({
      cancelled: true,
    });

    const trial = await controller.startFreeTrial(req, {
      planId: 'plan-1',
      trialDays: 7,
    });
    const cancelled = await controller.cancelSubscription(req, 'too_expensive');

    expect(subscriptionsService.startFreeTrial).toHaveBeenCalledWith(
      userId,
      'plan-1',
      7,
    );
    expect(subscriptionsService.cancelSubscription).toHaveBeenCalledWith(
      userId,
      'too_expensive',
    );
    expect(trial.code).toBe(SuccessCode.SUBSCRIPTION_CREATED);
    expect(cancelled.code).toBe(SuccessCode.SUBSCRIPTION_CANCELLED);
  });
});
