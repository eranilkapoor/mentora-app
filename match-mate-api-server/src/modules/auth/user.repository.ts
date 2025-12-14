import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(data: Partial<User>) {
    return this.model.create(data);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).lean();
  }
}