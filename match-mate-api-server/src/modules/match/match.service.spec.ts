import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchRepository } from './match.repository';
import { InterestStatus } from './schemas/interest.schema';

const mockMatchRepository = () => ({
  sendInterest: jest.fn(),
  getInterestById: jest.fn(),
  updateInterestStatus: jest.fn(),
  createMatch: jest.fn(),
  getMatchesForUser: jest.fn(),
});

describe('MatchService', () => {
  let service: MatchService;
  let repo: ReturnType<typeof mockMatchRepository>;

  beforeEach(async () => {
    repo = mockMatchRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: MatchRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendInterest()', () => {
    it('should throw BadRequestException when sender === receiver', () => {
      expect(() => service.sendInterest('same-id', 'same-id')).toThrow(
        BadRequestException,
      );
    });

    it('should call repo.sendInterest when sender !== receiver', () => {
      const interest = { _id: 'interest-1', status: 'PENDING' };
      repo.sendInterest.mockReturnValue(interest);

      const result = service.sendInterest('sender-1', 'receiver-1');
      expect(result).toEqual(interest);
      expect(repo.sendInterest).toHaveBeenCalledWith('sender-1', 'receiver-1');
    });
  });

  describe('respondToInterest()', () => {
    it('should throw BadRequestException when interest not found', async () => {
      repo.getInterestById.mockResolvedValue(null);

      await expect(
        service.respondToInterest('user-1', 'interest-1', 'ACCEPT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is not the receiver', async () => {
      repo.getInterestById.mockResolvedValue({
        receiverId: { toString: () => 'other-user' },
        senderId: { toString: () => 'sender-1' },
      });

      await expect(
        service.respondToInterest('user-1', 'interest-1', 'ACCEPT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept interest and create a match', async () => {
      repo.getInterestById.mockResolvedValue({
        receiverId: { toString: () => 'user-1' },
        senderId: { toString: () => 'sender-1' },
      });
      const updated = { _id: 'interest-1', status: InterestStatus.ACCEPTED };
      repo.updateInterestStatus.mockResolvedValue(updated);
      repo.createMatch.mockResolvedValue({ _id: 'match-1' });

      const result = await service.respondToInterest('user-1', 'interest-1', 'ACCEPT');

      expect(repo.updateInterestStatus).toHaveBeenCalledWith('interest-1', InterestStatus.ACCEPTED);
      expect(repo.createMatch).toHaveBeenCalledWith('sender-1', 'user-1');
      expect(result).toEqual(updated);
    });

    it('should reject interest without creating a match', async () => {
      repo.getInterestById.mockResolvedValue({
        receiverId: { toString: () => 'user-1' },
        senderId: { toString: () => 'sender-1' },
      });
      const updated = { _id: 'interest-1', status: InterestStatus.REJECTED };
      repo.updateInterestStatus.mockResolvedValue(updated);

      const result = await service.respondToInterest('user-1', 'interest-1', 'REJECT');

      expect(repo.updateInterestStatus).toHaveBeenCalledWith('interest-1', InterestStatus.REJECTED);
      expect(repo.createMatch).not.toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('getMyMatches()', () => {
    it('should return matches for user', () => {
      const matches = [{ _id: 'match-1' }];
      repo.getMatchesForUser.mockReturnValue(matches);

      const result = service.getMyMatches('user-1');
      expect(result).toEqual(matches);
      expect(repo.getMatchesForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
