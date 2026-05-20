import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import {
  Interest,
  InterestDocument,
  InterestStatus,
} from '../schemas/interest.schema';
import { Match, MatchDocument } from '../schemas/match.schema';

// ─── Explicit lean types ──────────────────────────────────────────────────────

type LeanInterest = FlattenMaps<Interest> & {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
};

type LeanMatch = FlattenMaps<Match> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetUserId: Types.ObjectId;
};

@Injectable()
export class MatchRepository {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<InterestDocument>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,
  ) {}

  async sendInterest(
    senderId: string,
    receiverId: string,
  ): Promise<LeanInterest> {
    const doc = await this.interestModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      status: InterestStatus.PENDING,
    });
    return doc.toObject() as LeanInterest;
  }

  async getExistingInterest(
    senderId: string,
    receiverId: string,
  ): Promise<LeanInterest | null> {
    return this.interestModel
      .findOne({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
      })
      .lean<LeanInterest>()
      .exec();
  }

  async getInterestById(id: string): Promise<LeanInterest | null> {
    return this.interestModel.findById(id).lean<LeanInterest>().exec();
  }

  async updateInterestStatus(
    id: string,
    status: InterestStatus,
  ): Promise<LeanInterest | null> {
    return this.interestModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean<LeanInterest>()
      .exec();
  }

  async deleteInterest(id: string): Promise<LeanInterest | null> {
    return this.interestModel.findByIdAndDelete(id).lean<LeanInterest>().exec();
  }

  async createMatch(user1: string, user2: string): Promise<LeanMatch> {
    const [leftUserId, rightUserId] = [user1, user2].sort();
    const doc = await this.matchModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(leftUserId),
        targetUserId: new Types.ObjectId(rightUserId),
      },
      {
        $set: { isActive: true, isMutual: true, matchedOn: new Date() },
        $setOnInsert: { score: 100 },
      },
      { new: true, upsert: true },
    );
    return doc.toObject() as LeanMatch;
  }

  async getMatchesForUser(
    userId: string,
    skip = 0,
    limit = 20,
  ): Promise<LeanMatch[]> {
    return this.matchModel
      .find({
        isActive: true,
        $or: [
          { userId: new Types.ObjectId(userId) },
          { targetUserId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ matchedOn: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanMatch[]>()
      .exec();
  }

  async countMatchesForUser(userId: string): Promise<number> {
    return this.matchModel.countDocuments({
      isActive: true,
      $or: [
        { userId: new Types.ObjectId(userId) },
        { targetUserId: new Types.ObjectId(userId) },
      ],
    });
  }

  async getReceivedInterests(
    userId: string,
    skip = 0,
    limit = 20,
  ): Promise<LeanInterest[]> {
    return this.interestModel
      .find({ receiverId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanInterest[]>()
      .exec();
  }

  async countReceivedInterests(userId: string): Promise<number> {
    return this.interestModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
    });
  }

  async getSentInterests(
    userId: string,
    skip = 0,
    limit = 20,
  ): Promise<LeanInterest[]> {
    return this.interestModel
      .find({ senderId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanInterest[]>()
      .exec();
  }

  async countSentInterests(userId: string): Promise<number> {
    return this.interestModel.countDocuments({
      senderId: new Types.ObjectId(userId),
    });
  }
}
