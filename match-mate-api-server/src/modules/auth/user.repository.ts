import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.model.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.model.findById(userId).exec();
  }

  async updateRefreshToken(userId: string, token: string | null) {
    return this.model.updateOne({ _id: userId }, { refreshToken: token });
  }

  async findByProvider(provider: string, providerId: string): Promise<UserDocument | null> {
    return this.model.findOne({ provider, providerId }).exec();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone }).exec();
  }
}
