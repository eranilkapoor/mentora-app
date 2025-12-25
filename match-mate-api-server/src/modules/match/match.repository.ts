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
    return this.interestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }

  createMatch(user1: string, user2: string) {
    return this.matchModel.create({
      users: [
        new Types.ObjectId(user1),
        new Types.ObjectId(user2),
      ],
    });
  }

  getMatchesForUser(userId: string) {
    return this.matchModel.find({
      users: new Types.ObjectId(userId),
      isActive: true,
    });
  }
}