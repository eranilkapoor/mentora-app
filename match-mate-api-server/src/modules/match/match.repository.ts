import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interest, InterestStatus } from './schemas/interest.schema';
import { Match } from './schemas/match.schema';

@Injectable()
export class MatchRepository {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<Interest>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<Match>,
  ) {}

  sendInterest(senderId: string, receiverId: string) {
    return this.interestModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
    });
  }

  getInterestById(id: string) {
    return this.interestModel.findById(id);
  }

  updateInterestStatus(id: string, status: InterestStatus) {
    return this.interestModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  createMatch(user1: string, user2: string) {
    const [leftUserId, rightUserId] = [user1, user2].sort();

    return this.matchModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(leftUserId),
        targetUserId: new Types.ObjectId(rightUserId),
      },
      {
        $set: {
          isActive: true,
          isMutual: true,
          matchedOn: new Date(),
        },
        $setOnInsert: {
          score: 100,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }

  getMatchesForUser(userId: string) {
    return this.matchModel.find({
      isActive: true,
      $or: [
        { userId: new Types.ObjectId(userId) },
        { targetUserId: new Types.ObjectId(userId) },
      ],
    });
  }
}
