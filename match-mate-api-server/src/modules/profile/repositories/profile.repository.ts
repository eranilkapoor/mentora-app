import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../schemas/profile.schema';
import {
  CreateProfileDto,
  EducationDto,
  FamilyDto,
  PersonalDto,
  PhysicalDto,
  PreferencesDto,
} from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) { }

  async createProfile(userId: string, data: CreateProfileDto, images: { url: string; isPrimary: boolean; isActive: boolean; uploadedAt: Date }[] = []) {
    try {
      return await this.profileModel.create({
        userId: new Types.ObjectId(userId),
        ...data,
        images
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create profile: ${message}`);
    }
  }

  async addImages(
    userId: string,
    images: { url: string; isPrimary: boolean; isActive: boolean; uploadedAt: Date }[],
  ) {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { $push: { images: { $each: images } } },
      { new: true },
    );
  }

  async setPrimaryImage(userId: string, imageId: string) {
    // First unset all primary flags, then set the target one
    await this.profileModel.findOneAndUpdate(
      { userId },
      { $set: { 'images.$[].isPrimary': false } },
    );
    return this.profileModel.findOneAndUpdate(
      { userId, 'images._id': imageId },
      { $set: { 'images.$.isPrimary': true } },
      { new: true },
    );
  }

  async removeImage(userId: string, imageId: string) {
    return this.profileModel.findOneAndUpdate(
      { userId },
      { $pull: { images: { _id: imageId } } },
      { new: true },
    );
  }

  async getImages(userId: string) {
    const profile = await this.profileModel
      .findOne({ userId })
      .select('images')
      .lean();
    return profile?.images ?? [];
  }


  async findByUserId(userId: string) {
    try {
      return await this.profileModel.findOne(
        {
          userId: new Types.ObjectId(userId),
          isActive: false,
        },
        {
          __v: 0,
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find profile: ${message}`);
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      return await this.profileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: data },
        { new: true },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update profile: ${message}`);
    }
  }

  async updatePersonalInfo(userId: string, data: PersonalDto) {
    try {
      return await this.updateProfile(userId, { personal: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update personal info: ${message}`);
    }
  }

  async updatePhysicalInfo(userId: string, data: PhysicalDto) {
    try {
      return await this.updateProfile(userId, { physical: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update physical info: ${message}`);
    }
  }

  async updateEducationInfo(userId: string, data: EducationDto) {
    try {
      return await this.updateProfile(userId, { education: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update education info: ${message}`);
    }
  }

  async updateFamilyInfo(userId: string, data: FamilyDto) {
    try {
      return await this.updateProfile(userId, { family: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update family info: ${message}`);
    }
  }

  async updatePreferences(userId: string, data: PreferencesDto) {
    try {
      return await this.updateProfile(userId, { preferences: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update preferences: ${message}`);
    }
  }
}
