import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  findUsers(filter: any, skip = 0, limit = 20) {
    return this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  updateUserStatus(userId: string, data: any) {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true });
  }
}
