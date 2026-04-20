import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { PlanService } from './plan.service';
import { Plan } from '../schemas/plan.schema';
import { Feature } from '../schemas/feature.schema';
import { PlanFeature } from '../schemas/plan-feature.schema';

const buildModel = () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  aggregate: jest.fn(),
});

describe('PlanService', () => {
  let service: PlanService;
  let planModel: ReturnType<typeof buildModel>;
  let featureModel: ReturnType<typeof buildModel>;
  let pfModel: ReturnType<typeof buildModel>;

  beforeEach(async () => {
    planModel = buildModel();
    featureModel = buildModel();
    pfModel = buildModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        { provide: getModelToken(Plan.name), useValue: planModel },
        { provide: getModelToken(Feature.name), useValue: featureModel },
        { provide: getModelToken(PlanFeature.name), useValue: pfModel },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createPlan()', () => {
    it('should throw ConflictException when plan name already exists', async () => {
      planModel.findOne.mockResolvedValue({ name: 'Gold' });

      await expect(
        service.createPlan({ name: 'Gold', price: 999 } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create plan when name is unique', async () => {
      planModel.findOne.mockResolvedValue(null);
      const created = { _id: 'plan-1', name: 'Gold' };
      planModel.create.mockResolvedValue(created);

      const result = await service.createPlan({
        name: 'Gold',
        price: 999,
      } as any);
      expect(result).toEqual(created);
    });
  });

  describe('updatePlan()', () => {
    it('should throw NotFoundException when plan does not exist', async () => {
      planModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.updatePlan('nonexistent', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update and return plan', async () => {
      const updated = { _id: 'plan-1', name: 'Updated' };
      planModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updatePlan('plan-1', {
        name: 'Updated',
      } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('getPlans()', () => {
    it('should return active plans', async () => {
      const plans = [{ _id: 'plan-1', isActive: true }];
      planModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(plans),
      });

      const result = await service.getPlans();
      expect(result).toEqual(plans);
      expect(planModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('getPlanById()', () => {
    it('should throw NotFoundException when plan not found', async () => {
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getPlanById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return plan with features', async () => {
      const plan = { _id: 'plan-1', name: 'Gold' };
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(plan),
      });

      // Mock getPlanFeatures (called internally)
      jest
        .spyOn(service, 'getPlanFeatures')
        .mockResolvedValue([{ key: 'CHAT' }] as any);

      const result = await service.getPlanById('plan-1');
      expect(result).toMatchObject({ ...plan, features: [{ key: 'CHAT' }] });
    });
  });

  describe('createFeature()', () => {
    it('should throw ConflictException when feature key already exists', async () => {
      featureModel.findOne.mockResolvedValue({ key: 'CHAT' });

      await expect(
        service.createFeature({ key: 'CHAT' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create feature when key is unique', async () => {
      featureModel.findOne.mockResolvedValue(null);
      const created = { _id: 'feat-1', key: 'CHAT' };
      featureModel.create.mockResolvedValue(created);

      const result = await service.createFeature({ key: 'CHAT' } as any);
      expect(result).toEqual(created);
    });
  });

  describe('getFeatures()', () => {
    it('should return all features', async () => {
      featureModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ key: 'CHAT' }]),
      });
      const result = await service.getFeatures();
      expect(result).toEqual([{ key: 'CHAT' }]);
    });
  });
});
