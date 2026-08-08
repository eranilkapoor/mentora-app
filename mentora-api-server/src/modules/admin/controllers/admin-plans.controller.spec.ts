import { Types } from 'mongoose';
import { SuccessCode } from '@/common/constants';
import { AdminPlansController } from './admin-plans.controller';

describe('AdminPlansController', () => {
  const planService = {
    getPlans: jest.fn(),
    getAllPlansWithFeatures: jest.fn(),
    getFeatures: jest.fn(),
    createPlan: jest.fn(),
    updatePlan: jest.fn(),
    createFeature: jest.fn(),
    assignFeatureToPlan: jest.fn(),
    removeFeatureFromPlan: jest.fn(),
    getPlanById: jest.fn(),
  };

  const auditService = {
    write: jest.fn(),
  };

  const subscriptionsService = {
    getOrganizationBillingSummary: jest.fn(),
    assignOrganizationSubscription: jest.fn(),
  };

  let controller: AdminPlansController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlansController(
      planService as never,
      subscriptionsService as never,
      auditService as never,
    );
  });

  it('returns read-only plans and features endpoints', async () => {
    planService.getPlans.mockResolvedValue([]);
    planService.getAllPlansWithFeatures.mockResolvedValue([]);
    planService.getFeatures.mockResolvedValue([]);
    planService.getPlanById.mockResolvedValue({ _id: 'p1' });

    const plans = await controller.getPlans();
    const full = await controller.getAllPlansWithFeatures();
    const features = await controller.getFeatures();
    const one = await controller.getPlan('p1');

    expect(plans.code).toBe(SuccessCode.PLANS_FETCHED);
    expect(full.code).toBe(SuccessCode.PLANS_FETCHED);
    expect(features.code).toBe(SuccessCode.FEATURES_FETCHED);
    expect(one.code).toBe(SuccessCode.PLAN_FETCHED);
  });

  it('creates and updates plans with audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    planService.createPlan.mockResolvedValue({ _id: new Types.ObjectId() });
    planService.updatePlan.mockResolvedValue({ _id: 'p1' });

    const created = await controller.createPlan(
      req as never,
      {
        name: 'Pro',
        price: 100,
        durationInDays: 30,
        type: 'monthly',
      } as never,
    );

    const updated = await controller.updatePlan(req as never, 'p1', {
      name: 'Pro Plus',
    });

    expect(created.code).toBe(SuccessCode.PLAN_CREATED);
    expect(updated.code).toBe(SuccessCode.PLAN_UPDATED);
    expect(auditService.write).toHaveBeenCalledTimes(2);
  });

  it('creates, assigns, and removes features with audit', async () => {
    const req = { user: { sub: 'admin-1' } };
    planService.createFeature.mockResolvedValue({ _id: new Types.ObjectId() });
    planService.assignFeatureToPlan.mockResolvedValue({ ok: true });
    planService.removeFeatureFromPlan.mockResolvedValue({ ok: true });

    const feature = await controller.createFeature(
      req as never,
      {
        code: 'spotlight',
        name: 'Spotlight',
      } as never,
    );
    const assign = await controller.assignFeature(
      req as never,
      {
        planId: 'p1',
        featureId: 'f1',
        enabled: true,
      } as never,
    );
    const remove = await controller.removeFeature(req as never, 'p1', 'f1');

    expect(feature.code).toBe(SuccessCode.FEATURE_CREATED);
    expect(assign.code).toBe(SuccessCode.FEATURE_ASSIGNED);
    expect(remove.code).toBe(SuccessCode.FEATURE_REMOVED);
    expect(auditService.write).toHaveBeenCalledTimes(3);
  });
});
