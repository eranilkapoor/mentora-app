import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

const mockMatchService = () => ({
  sendInterest: jest.fn(),
  respondToInterest: jest.fn(),
  getMyMatches: jest.fn(),
});

describe('MatchController', () => {
  let controller: MatchController;
  let service: ReturnType<typeof mockMatchService>;

  beforeEach(async () => {
    service = mockMatchService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [{ provide: MatchService, useValue: service }],
    }).compile();

    controller = module.get<MatchController>(MatchController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendInterest()', () => {
    it('should call matchService.sendInterest', () => {
      const interest = { _id: 'interest-1', status: 'PENDING' };
      service.sendInterest.mockReturnValue(interest);

      const result = controller.sendInterest({
        receiverId: 'receiver-1',
      } as any);
      expect(result).toEqual(interest);
      expect(service.sendInterest).toHaveBeenCalledWith(
        'USER_ID_FROM_AUTH',
        'receiver-1',
      );
    });
  });

  describe('respond()', () => {
    it('should call matchService.respondToInterest', async () => {
      const updated = { _id: 'interest-1', status: 'ACCEPTED' };
      service.respondToInterest.mockResolvedValue(updated);

      const result = await controller.respond({
        interestId: 'interest-1',
        action: 'ACCEPT',
      } as any);

      expect(result).toEqual(updated);
      expect(service.respondToInterest).toHaveBeenCalledWith(
        'USER_ID_FROM_AUTH',
        'interest-1',
        'ACCEPT',
      );
    });
  });

  describe('getMyMatches()', () => {
    it('should return list of matches', () => {
      const matches = [{ _id: 'match-1' }, { _id: 'match-2' }];
      service.getMyMatches.mockReturnValue(matches);

      const result = controller.getMyMatches();
      expect(result).toEqual(matches);
      expect(service.getMyMatches).toHaveBeenCalledWith('USER_ID_FROM_AUTH');
    });
  });
});
