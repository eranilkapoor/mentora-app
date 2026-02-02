import { Injectable, BadRequestException } from '@nestjs/common';
import { MatchRepository } from './match.repository';
import { InterestStatus } from './schemas/interest.schema';

@Injectable()
export class MatchService {
  constructor(private readonly repo: MatchRepository) {}

  sendInterest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send interest to yourself');
    }
    return this.repo.sendInterest(senderId, receiverId);
  }

  async respondToInterest(
    userId: string,
    interestId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const interest = await this.repo.getInterestById(interestId);

    if (!interest) {
      throw new BadRequestException('Interest not found');
    }

    if (interest.receiverId.toString() !== userId) {
      throw new BadRequestException('Unauthorized action');
    }

    const status =
      action === 'ACCEPT' ? InterestStatus.ACCEPTED : InterestStatus.REJECTED;

    const updated = await this.repo.updateInterestStatus(interestId, status);

    if (status === InterestStatus.ACCEPTED) {
      await this.repo.createMatch(
        interest.senderId.toString(),
        interest.receiverId.toString(),
      );
    }

    return updated;
  }

  getMyMatches(userId: string) {
    return this.repo.getMatchesForUser(userId);
  }
}
