import { Test, TestingModule } from '@nestjs/testing';
import { PlanController } from './plan.controller';
import { PlanService } from './services/plan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

const mockPlanService = () => ({
  createPlan: jest.fn(),
  updatePlan: jest.fn(),
  getPlans: jest.fn(),
  getPlanById: jest.fn(),
  getAllPlansWithFeatures: jest.fn(),
  createFeature: jest.fn(),
  getFeatures: jest.fn(),
  assignFeatureToPlan: jest.fn(),
  removeFeatureFromPlan: jest.fn(),
});

describe('PlanController', () => {
  let controller: PlanController;
  let service: ReturnType<typeof mockPlanService>;

  beforeEach(async () => {
    service = mockPlanService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [{ provide: PlanService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PlanController>(PlanController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createPlan()', () => {
    it('should create and return a plan', () => {
      const plan = { _id: 'plan-1', name: 'Gold' };
      service.createPlan.mockReturnValue(plan);

      const result = controller.createPlan({ name: 'Gold', price: 999 } as any);
      expect(result).toEqual(plan);
    });
  });

  describe('updatePlan()', () => {
    it('should update a plan by id', () => {
      const updated = { _id: 'plan-1', name: 'Platinum' };
      service.updatePlan.mockReturnValue(updated);

      const result = controller.updatePlan('plan-1', { name: 'Platinum' } as any);
      expect(result).toEqual(updated);
      expect(service.updatePlan).toHaveBeenCalledWith('plan-1', { name: 'Platinum' });
    });
  });

  describe('getPlans()', () => {
    it('should return list of active plans', () => {
      const plans = [{ _id: 'plan-1', name: 'Gold' }];
      service.getPlans.mockReturnValue(plans);

      const result = controller.getPlans();
      expect(result).toEqual(plans);
    });
  });

  describe('getPlan()', () => {
    it('should return a plan by id with features', () => {
      const plan = { _id: 'plan-1', features: [] };
      service.getPlanById.mockReturnValue(plan);

      const result = controller.getPlan('plan-1');
      expect(result).toEqual(plan);
    });
  });

  describe('getAllPlansWithFeatures()', () => {
    it('should return all plans with features', () => {
      const plans = [{ _id: 'plan-1', features: [{ key: 'CHAT' }] }];
      service.getAllPlansWithFeatures.mockReturnValue(plans);

      const result = controller.getAllPlansWithFeatures();
      expect(result).toEqual(plans);
    });
  });

  describe('createFeature()', () => {
    it('should create a new feature', () => {
      const feature = { _id: 'feat-1', key: 'CHAT', label: 'Chat' };
      service.createFeature.mockReturnValue(feature);

      const result = controller.createFeature({ key: 'CHAT', label: 'Chat' } as any);
      expect(result).toEqual(feature);
    });
  });

  describe('getFeatures()', () => {
    it('should return all features', () => {
      service.getFeatures.mockReturnValue([{ key: 'CHAT' }]);
      const result = controller.getFeatures();
      expect(result).toEqual([{ key: 'CHAT' }]);
    });
  });

  describe('assignFeature()', () => {
    it('should assign feature to plan', () => {
      service.assignFeatureToPlan.mockReturnValue({ planId: 'plan-1', featureId: 'feat-1' });
      const result = controller.assignFeature({ planId: 'plan-1', featureId: 'feat-1' } as any);
      expect(result).toEqual({ planId: 'plan-1', featureId: 'feat-1' });
    });
  });

  describe('removeFeature()', () => {
    it('should remove feature from plan', () => {
      service.removeFeatureFromPlan.mockReturnValue({ success: true });
      const result = controller.removeFeature('plan-1', 'feat-1');
      expect(service.removeFeatureFromPlan).toHaveBeenCalledWith('plan-1', 'feat-1');
    });
  });
});
