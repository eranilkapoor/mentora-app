import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Preference,
  PreferenceDocument,
} from '../schemas/preference/preference.schema';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
} from '../dto/preference.dto';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,
  ) {}

  async findByUserId(userId: string) {
    return this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
  }

  async upsert(userId: string, data: Partial<Preference>) {
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: data },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async updateFilters(userId: string, filters: Partial<PartnerFiltersDto>) {
    // Merge at field level  don't overwrite the entire filters object
    const updateObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        updateObj[`filters.${key}`] = value;
      }
    }
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateObj },
      { upsert: true, new: true, runValidators: true },
    );
  }

  async updateSettings(userId: string, settings: Partial<MatchSettingsDto>) {
    const updateObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        updateObj[`settings.${key}`] = value;
      }
    }
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateObj },
      { upsert: true, new: true, runValidators: true },
    );
  }

  async updateWeights(userId: string, weights: Partial<MatchWeightsDto>) {
    const updateObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(weights)) {
      if (value !== undefined) {
        updateObj[`weights.${key}`] = value;
      }
    }
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateObj },
      { upsert: true, new: true, runValidators: true },
    );
  }

  async updateAboutPartner(userId: string, aboutPartner: string) {
    return this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { aboutPartner } },
      { upsert: true, new: true },
    );
  }
}
