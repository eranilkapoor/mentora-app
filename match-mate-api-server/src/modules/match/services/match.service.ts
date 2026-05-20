import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MatchRepository } from '../repositories/match.repository';
import { InterestStatus } from '../schemas/interest.schema';

@Injectable()
export class MatchService {
  constructor(private readonly repo: MatchRepository) {}

  async sendInterest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send interest to yourself');
    }

    // Prevent duplicate
    const existing = await this.repo.getExistingInterest(senderId, receiverId);
    if (existing) {
      throw new BadRequestException('Interest already sent to this profile');
    }

    return this.repo.sendInterest(senderId, receiverId);
  }

  async respondToInterest(
    userId: string,
    interestId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const interest = await this.repo.getInterestById(interestId);

    if (!interest) throw new NotFoundException('Interest not found');

    if (interest.receiverId.toString() !== userId) {
      throw new BadRequestException('Unauthorized action');
    }

    if (interest.status !== InterestStatus.PENDING) {
      throw new BadRequestException(`Interest is already ${interest.status}`);
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

    return { success: true, data: updated };
  }

  async getMyMatches(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [matches, total] = await Promise.all([
      this.repo.getMatchesForUser(userId, skip, limit),
      this.repo.countMatchesForUser(userId),
    ]);
    return {
      success: true,
      data: matches,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReceivedInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [interests, total] = await Promise.all([
      this.repo.getReceivedInterests(userId, skip, limit),
      this.repo.countReceivedInterests(userId),
    ]);
    return {
      success: true,
      data: interests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSentInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [interests, total] = await Promise.all([
      this.repo.getSentInterests(userId, skip, limit),
      this.repo.countSentInterests(userId),
    ]);
    return {
      success: true,
      data: interests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async withdrawInterest(senderId: string, interestId: string) {
    const interest = await this.repo.getInterestById(interestId);
    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.senderId.toString() !== senderId) {
      throw new BadRequestException('Unauthorized');
    }
    if (interest.status !== InterestStatus.PENDING) {
      throw new BadRequestException('Only pending interests can be withdrawn');
    }
    return this.repo.deleteInterest(interestId);
  }
}
