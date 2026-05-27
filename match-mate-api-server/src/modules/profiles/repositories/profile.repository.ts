import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../schemas/profile/profile.schema';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async create(userId: string, data: Record<string, unknown>) {
    try {
      return await this.profileModel.create({
        userId: new Types.ObjectId(userId),
        ...data,
      });
    } catch (error) {
      throw new Error(
        `Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByUserId(userId: string) {
    try {
      return await this.profileModel
        .findOne(
          { userId: new Types.ObjectId(userId), deletedAt: { $exists: false } },
          { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 },
        )
        .lean();
    } catch (error) {
      throw new Error(
        `Failed to find profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    userId: string,
    data: UpdateProfileDto | Record<string, unknown>,
  ) {
    try {
      return await this.profileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), deletedAt: { $exists: false } },
        { $set: data },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.profileModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: { $exists: false },
    });
    return count > 0;
  }

  async softDelete(userId: string) {
    return this.profileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { deletedAt: new Date(), status: 'deleted' } },
      { new: true },
    );
  }
}
