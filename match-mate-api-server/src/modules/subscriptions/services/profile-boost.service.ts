import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProfileBoost,
  ProfileBoostDocument,
} from '../schemas/profile-boost.schema';
import { ProfileBoostStatus } from '../enums/profile-boost-status.enum';

@Injectable()
export class ProfileBoostService {
  constructor(
    @InjectModel(ProfileBoost.name)
    private readonly boostModel: Model<ProfileBoostDocument>,
  ) {}

  async activateBoost(params: {
    userId: string;
    paymentId?: string;
    planId?: string;
    durationHours?: number;
    multiplier?: number;
    source?: string;
  }) {
    const startsAt = new Date();
    const durationHours = Math.max(1, params.durationHours ?? 24);
    const endsAt = new Date(startsAt.getTime() + durationHours * 3_600_000);

    return this.boostModel.create({
      userId: new Types.ObjectId(params.userId),
      paymentId: params.paymentId
        ? new Types.ObjectId(params.paymentId)
        : undefined,
      planId: params.planId ? new Types.ObjectId(params.planId) : undefined,
      source: params.source ?? 'purchase',
      startsAt,
      endsAt,
      multiplier: params.multiplier ?? 1.25,
      status: ProfileBoostStatus.ACTIVE,
    });
  }

  getMyBoosts(userId: string) {
    return this.boostModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ startsAt: -1 })
      .limit(25)
      .lean()
      .exec();
  }

  async getActiveBoostMap(userIds: string[]) {
    const objectIds = userIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) return new Map<string, ProfileBoost>();

    const boosts = await this.boostModel
      .find({
        userId: { $in: objectIds },
        status: ProfileBoostStatus.ACTIVE,
        startsAt: { $lte: new Date() },
        endsAt: { $gt: new Date() },
      })
      .sort({ multiplier: -1, endsAt: -1 })
      .lean<Array<ProfileBoost & { userId: Types.ObjectId }>>()
      .exec();

    const map = new Map<string, ProfileBoost>();
    boosts.forEach((boost) => {
      const key = boost.userId.toString();
      if (!map.has(key)) map.set(key, boost);
    });

    return map;
  }

  async expireOverdueBoosts() {
    const result = await this.boostModel.updateMany(
      {
        status: ProfileBoostStatus.ACTIVE,
        endsAt: { $lte: new Date() },
      },
      { $set: { status: ProfileBoostStatus.EXPIRED } },
    );

    return { expiredCount: result.modifiedCount };
  }
}
