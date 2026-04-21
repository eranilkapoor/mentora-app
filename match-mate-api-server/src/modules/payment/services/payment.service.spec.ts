import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { SubscriptionService } from '../subscription/subscription.service';
import { Plan } from '../../plan/schemas/plan.schema';
import { mockMongooseModel } from 'src/test/helpers/mock-factory';

const mockPaymentRepository = () => ({
  create: jest.fn(),
  findByOrderId: jest.fn(),
  findByOrderIdAndUser: jest.fn(),
  findByGatewayOrderId: jest.fn(),
  markSuccess: jest.fn(),
  markFailed: jest.fn(),
  markRefunded: jest.fn(),
  findUserPayments: jest.fn(),
  findPaymentByOrderId: jest.fn(),
  findAdminPayments: jest.fn(),
  getStatusSummary: jest.fn(),
  countStalePending: jest.fn(),
  findByIdempotencyKey: jest.fn(),
});

const mockSubscriptionService = () => ({
  purchasePlan: jest.fn(),
});

const USER_ID = '507f1f77bcf86cd799439011';
const PLAN_ID = '507f191e810c19729de860ea';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: ReturnType<typeof mockPaymentRepository>;
  let subscriptionService: ReturnType<typeof mockSubscriptionService>;
  let planModel: ReturnType<typeof mockMongooseModel>;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    paymentRepo = mockPaymentRepository();
    subscriptionService = mockSubscriptionService();
    planModel = mockMongooseModel();
    configService = { get: jest.fn().mockReturnValue('18') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentRepository, useValue: paymentRepo },
        { provide: ConfigService, useValue: configService },
        { provide: SubscriptionService, useValue: subscriptionService },
        { provide: getModelToken(Plan.name), useValue: planModel },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createOrder()', () => {
    it('should throw BadRequestException when userId is empty', async () => {
      await expect(service.createOrder('', {} as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when plan not found', async () => {
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createOrder(USER_ID, { planId: 'nonexistent' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when plan is inactive', async () => {
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue({ _id: 'plan-1', isActive: false, price: 999 }),
      });

      await expect(
        service.createOrder(USER_ID, { planId: PLAN_ID } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return idempotent replay when key already used', async () => {
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue({ _id: 'plan-1', isActive: true, price: 999 }),
      });
      const existing = { orderId: 'ord-1' };
      paymentRepo.findByIdempotencyKey.mockResolvedValue(existing);

      const result = await service.createOrder(USER_ID, {
        planId: PLAN_ID,
        idempotencyKey: 'idem-key-1',
      } as any);

      expect(result).toEqual({ isIdempotentReplay: true, payment: existing });
    });

    it('should create a new order successfully', async () => {
      planModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue({ _id: 'plan-1', isActive: true, price: 999 }),
      });
      paymentRepo.findByIdempotencyKey.mockResolvedValue(null);
      const created = { orderId: 'ord-123', gatewayOrderId: 'rz-ord-123' };
      paymentRepo.create.mockResolvedValue(created);

      const result = await service.createOrder(USER_ID, {
        planId: PLAN_ID,
        idempotencyKey: 'idem-1',
      } as any);

      expect(result).toHaveProperty('orderId');
      expect(paymentRepo.create).toHaveBeenCalled();
    });
  });

  describe('getUserPayments()', () => {
    it('should return user payments from repository', async () => {
      const payments = { payments: [{ orderId: 'ord-1' }], total: 1 };
      paymentRepo.findUserPayments.mockResolvedValue(payments);

      const result = await service.getUserPayments(USER_ID, {} as any);
      expect(result).toEqual(payments);
    });
  });

  describe('getUserPaymentDetail()', () => {
    it('should return payment detail from repository', async () => {
      const detail = { orderId: 'ord-1', status: 'SUCCESS' };
      paymentRepo.findByOrderIdAndUser.mockResolvedValue(detail);

      const result = await service.getUserPaymentDetail(USER_ID, 'ord-1');
      expect(result).toEqual(detail);
    });
  });
});
