/* eslint-disable @typescript-eslint/unbound-method */
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { AppException } from '@/common/exceptions/app.exception';
import type { FeatureDocument } from '../schemas/feature.schema';
import type { PlanFeatureDocument } from '../schemas/plan-feature.schema';
import type { PlanDocument } from '../schemas/plan.schema';
import { PlanService } from './plan.service';

const query = (exec: jest.Mock) => ({
  sort: jest.fn(() => ({ lean: jest.fn(() => ({ exec })) })),
  populate: jest.fn(() => ({ lean: jest.fn(() => ({ exec })) })),
  lean: jest.fn(() => ({ exec })),
});

describe('PlanService', () => {
  const planExec = jest.fn();
  const planFindOneExec = jest.fn();
  const planFindByIdExec = jest.fn();
  const planUpdateExec = jest.fn();
  const planModel = {
    findOne: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: planFindOneExec })),
    })),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: planUpdateExec })),
    })),
    find: jest.fn(() => query(planExec)),
    findById: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: planFindByIdExec })),
    })),
  } as unknown as Model<PlanDocument>;

  const pfExec = jest.fn();
  const pfUpdateExec = jest.fn();
  const pfDeleteExec = jest.fn();
  const pfModel = {
    find: jest.fn(() => query(pfExec)),
    findOneAndUpdate: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: pfUpdateExec })),
    })),
    deleteOne: jest.fn(() => ({ exec: pfDeleteExec })),
  } as unknown as Model<PlanFeatureDocument>;

  const featureExec = jest.fn();
  const featureFindOneExec = jest.fn();
  const featureModel = {
    findOne: jest.fn(() => ({
      lean: jest.fn(() => ({ exec: featureFindOneExec })),
    })),
    create: jest.fn(),
    find: jest.fn(() => ({ lean: jest.fn(() => ({ exec: featureExec })) })),
  } as unknown as Model<FeatureDocument>;
  let service: PlanService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    planFindOneExec.mockResolvedValue(null);
    featureFindOneExec.mockResolvedValue(null);
    service = new PlanService(planModel, pfModel, featureModel);
  });

  it('creates a unique plan', async () => {
    const plan = { toObject: () => ({ _id: 'plan', name: 'GOLD' }) };
    (planModel.create as jest.Mock).mockResolvedValue(plan);

    await expect(
      service.createPlan({ name: 'GOLD' } as never),
    ).resolves.toEqual({
      _id: 'plan',
      name: 'GOLD',
    });
  });

  it('rejects a duplicate plan', async () => {
    planFindOneExec.mockResolvedValue({ _id: 'existing' });
    await expect(
      service.createPlan({ name: 'GOLD' } as never),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('updates an existing plan and rejects a missing plan', async () => {
    const updated = { _id: 'plan', name: 'UPDATED' };
    planUpdateExec.mockResolvedValueOnce(updated).mockResolvedValueOnce(null);

    await expect(service.updatePlan('plan', { name: 'UPDATED' })).resolves.toBe(
      updated,
    );
    await expect(service.updatePlan('missing', {})).rejects.toBeInstanceOf(
      AppException,
    );
  });

  it('lists active plans in configured order', async () => {
    planExec.mockResolvedValue([{ _id: 'plan' }]);
    await expect(service.getPlans()).resolves.toEqual([{ _id: 'plan' }]);
    expect(planModel.find).toHaveBeenCalledWith({ isActive: true });
  });

  it('groups only active plan features and supplies empty feature arrays', async () => {
    const first = new Types.ObjectId();
    const second = new Types.ObjectId();
    planExec.mockResolvedValue([{ _id: first }, { _id: second }]);
    pfExec.mockResolvedValue([
      { planId: first, value: 1 },
      { planId: first, value: 2 },
      { planId: new Types.ObjectId(), value: 3 },
    ]);

    await expect(service.getActivePlansWithFeatures()).resolves.toEqual([
      {
        _id: first,
        features: [
          { planId: first, value: 1 },
          { planId: first, value: 2 },
        ],
      },
      { _id: second, features: [] },
    ]);
  });

  it('returns a plan with populated features', async () => {
    const plan = { _id: new Types.ObjectId(), name: 'Gold' };
    planFindByIdExec.mockResolvedValue(plan);
    jest
      .spyOn(service, 'getPlanFeatures')
      .mockResolvedValue([{ value: 1 }] as never);

    await expect(service.getPlanById(String(plan._id))).resolves.toEqual({
      ...plan,
      features: [{ value: 1 }],
    });
  });

  it('rejects a missing plan lookup', async () => {
    planFindByIdExec.mockResolvedValue(null);
    await expect(service.getPlanById('missing')).rejects.toBeInstanceOf(
      AppException,
    );
  });

  it('creates a unique feature and rejects a duplicate', async () => {
    const feature = { toObject: () => ({ _id: 'feature', key: 'chat' }) };
    (featureModel.create as jest.Mock).mockResolvedValue(feature);

    await expect(
      service.createFeature({ key: 'chat' } as never),
    ).resolves.toEqual({
      _id: 'feature',
      key: 'chat',
    });

    featureFindOneExec.mockResolvedValue({ _id: 'existing' });
    await expect(
      service.createFeature({ key: 'chat' } as never),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('lists active features', async () => {
    featureExec.mockResolvedValue([{ key: 'chat' }]);
    await expect(service.getFeatures()).resolves.toEqual([{ key: 'chat' }]);
  });

  it('assigns a feature to a plan with upsert semantics', async () => {
    const planId = new Types.ObjectId().toString();
    const featureId = new Types.ObjectId().toString();
    pfUpdateExec.mockResolvedValue({ value: 5 });

    await expect(
      service.assignFeatureToPlan({ planId, featureId, value: 5 }),
    ).resolves.toEqual({ value: 5 });
    expect(pfModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        planId: new Types.ObjectId(planId),
        featureId: new Types.ObjectId(featureId),
      },
      { $set: { value: 5 } },
      { upsert: true, new: true, runValidators: true },
    );
  });

  it('removes and lists plan feature mappings', async () => {
    const planId = new Types.ObjectId().toString();
    const featureId = new Types.ObjectId().toString();
    pfDeleteExec.mockResolvedValue({ deletedCount: 1 });
    pfExec.mockResolvedValue([{ featureId }]);

    await expect(
      service.removeFeatureFromPlan(planId, featureId),
    ).resolves.toEqual({
      success: true,
    });
    await expect(service.getPlanFeatures(planId)).resolves.toEqual([
      { featureId },
    ]);
  });

  it('groups all plan features and keeps plans without mappings', async () => {
    const first = new Types.ObjectId();
    const second = new Types.ObjectId();
    planExec.mockResolvedValue([{ _id: first }, { _id: second }]);
    pfExec.mockResolvedValue([
      { planId: first, value: 1 },
      { planId: first, value: 2 },
    ]);

    await expect(service.getAllPlansWithFeatures()).resolves.toEqual([
      {
        _id: first,
        features: [
          { planId: first, value: 1 },
          { planId: first, value: 2 },
        ],
      },
      { _id: second, features: [] },
    ]);
  });
});
