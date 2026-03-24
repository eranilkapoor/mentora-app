import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../schemas/profile.schema';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async createProfile(userId: string, data: any) {
    try {
      return await this.profileModel.create({
        userId: new Types.ObjectId(userId),
        ...data,
      });
    } catch (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  }

  async findByUserId(userId: string) {
    try {
      return await this.profileModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: false,
      },
      {
        __v: 0,
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
      });
    } catch (error) {
      throw new Error(`Failed to find profile: ${error.message}`);
    }
  }

  async updateProfile(userId: string, data: any) {
    try {
      return await this.profileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: data },
        { new: true },
      );
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  async updatePersonalInfo(userId: string, data: any) {
    try {
      return await this.updateProfile(userId, { personal: data });
    } catch (error) {
      throw new Error(`Failed to update personal info: ${error.message}`);
    }
  }

  async updatePhysicalInfo(userId: string, data: any) {
    try {
      return await this.updateProfile(userId, { physical: data });
    } catch (error) {
      throw new Error(`Failed to update physical info: ${error.message}`);
    }
  }

  async updateEducationInfo(userId: string, data: any) {
    try {
      return await this.updateProfile(userId, { education: data });
    } catch (error) {
      throw new Error(`Failed to update education info: ${error.message}`);
    }
  }

  async updateFamilyInfo(userId: string, data: any) {
    try {
      return await this.updateProfile(userId, { family: data });
    } catch (error) {
      throw new Error(`Failed to update family info: ${error.message}`);
    }
  }

  async updatePreferences(userId: string, data: any) {
    try {
      return await this.updateProfile(userId, { preferences: data });
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }
}
