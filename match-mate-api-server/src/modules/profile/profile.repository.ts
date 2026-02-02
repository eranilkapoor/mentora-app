import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile } from './schemas/profile.schema';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<Profile>,
  ) {}

  createProfile(userId: string, data: any) {
    return this.profileModel.create({
      userId: new Types.ObjectId(userId),
      ...data,
    });
  }

  findByUserId(userId: string) {
    return this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }

  updateProfile(userId: string, data: any) {
    return this.profileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true },
    );
  }
}
