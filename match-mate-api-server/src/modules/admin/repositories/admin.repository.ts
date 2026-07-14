import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { Status } from '@/common/enums';

export interface UserStatusUpdate {
  status?: Status;
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
      .select('-password -refreshToken -authAccounts.passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  }

  findUsersForBroadcast(filter: FilterQuery<UserDocument>, limit = 1000) {
    return this.userModel
      .find(filter)
      .select('_id email phone membership status')
      .limit(limit)
      .lean();
  }

  countUsers(filter: FilterQuery<UserDocument>) {
    return this.userModel.countDocuments(filter);
  }

  createUser(data: Partial<User>) {
    return this.userModel.create(data);
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findUserByPhone(countryCode: string | undefined, phone: string) {
    const filter: FilterQuery<UserDocument> = { 'phone.phone': phone };
    if (countryCode) filter['phone.countryCode'] = countryCode;
    return this.userModel.findOne(filter).exec();
  }

  findUserById(userId: string) {
    return this.userModel
      .findById(userId)
      .select('-password -refreshToken -authAccounts.passwordHash')
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
