import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';

export interface UserStatusUpdate {
  isBlocked?: boolean;
  isVerified?: boolean;
}

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  findUsers(filter: FilterQuery<UserDocument>, skip = 0, limit = 20) {
    return this.userModel
      .find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  }

  countUsers(filter: FilterQuery<UserDocument>) {
    return this.userModel.countDocuments(filter);
  }

  findUserById(userId: string) {
    return this.userModel
      .findById(userId)
      .select('-password -refreshToken')
      .lean();
  }

  updateUserStatus(userId: string, data: UserStatusUpdate) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    );
  }
}
