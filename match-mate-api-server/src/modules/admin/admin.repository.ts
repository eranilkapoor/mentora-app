import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { User } from 'src/modules/auth/schemas/user.schema';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  findUsers(filter: FilterQuery<User>, skip = 0, limit = 20) {
    return this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  updateUserStatus(userId: string, data: UpdateQuery<User>) {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true });
  }
}
