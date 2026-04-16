import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from './schemas/plan.schema';
import { PlanFeature } from './schemas/plan-feature.schema';
import { Feature } from './schemas/feature.schema';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel('Plan') private planModel: Model<Plan>,
    @InjectModel('PlanFeature') private pfModel: Model<PlanFeature>,
    @InjectModel('Feature') private featureModel: Model<Feature>,
  ) {}

  async getPlanFeatures(planId: string) {
    return this.pfModel
      .find({ planId })
      .populate('featureId')
      .lean();
  }
}