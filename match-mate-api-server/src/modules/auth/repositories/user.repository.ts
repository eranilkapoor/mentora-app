import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ authAccounts: { $elemMatch: { provider, providerId } } })
      .select('+authAccounts.passwordHash')
      .exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findByIdWithRoles(userId: string) {
    return this.userModel.findById(userId).populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });
  }

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async updateMembership(userId: string, membership: User['membership']) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { membership } },
      { new: true },
    );
  }

  async expireMemberships(userIds: string[], expiredAt: Date) {
    if (userIds.length === 0) return { modifiedCount: 0 };

    return this.userModel.updateMany(
      {
        _id: { $in: userIds },
        'membership.expiresAt': { $lte: expiredAt },
      },
      {
        $set: {
          'membership.tier': 'free',
          'membership.status': 'expired',
          'membership.autoRenew': false,
          'membership.expiresAt': expiredAt,
        },
        $unset: { 'membership.planId': '' },
      },
    );
  }
}
