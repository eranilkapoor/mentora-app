import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionService } from './subscription.service';
import { UserRepository } from '../auth/repositories/user.repository';

const mockUserRepository = () => ({
  updateMembership: jest.fn(),
});

const buildModel = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let userRepo: ReturnType<typeof mockUserRepository>;
  let subModel: ReturnType<typeof buildModel>;
  let planModel: ReturnType<typeof buildModel>;

  beforeEach(async () => {
    userRepo = mockUserRepository();
    subModel = buildModel();
    planModel = buildModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: UserRepository, useValue: userRepo },
        { provide: getModelToken('Subscription'), useValue: subModel },
        { provide: getModelToken('Plan'), useValue: planModel },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('purchasePlan()', () => {
    it('should throw error when plan not found', async () => {
      planModel.findById.mockResolvedValue(null);

      await expect(service.purchasePlan('user-1', 'plan-999')).rejects.toThrow('Plan not found');
    });

    it('should create subscription and update user membership', async () => {
      const plan = {
        _id: 'plan-1',
        durationDays: 30,
        tier: 'premium',
      };
      planModel.findById.mockResolvedValue(plan);
      subModel.create.mockResolvedValue({ _id: 'sub-1' });
      userRepo.updateMembership.mockResolvedValue(undefined);

      const result = await service.purchasePlan('user-1', 'plan-1');

      expect(result).toEqual({ success: true });
      expect(subModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', planId: 'plan-1' }),
      );
      expect(userRepo.updateMembership).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ tier: 'premium', status: 'active' }),
      );
    });

    it('should default tier to FREE when plan has no tier', async () => {
      const plan = { _id: 'plan-1', durationDays: 7, tier: undefined };
      planModel.findById.mockResolvedValue(plan);
      subModel.create.mockResolvedValue({});
      userRepo.updateMembership.mockResolvedValue(undefined);

      await service.purchasePlan('user-1', 'plan-1');

      expect(userRepo.updateMembership).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ tier: expect.any(String) }),
      );
    });
  });
});
