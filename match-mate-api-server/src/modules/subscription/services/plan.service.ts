import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Plan } from '../schemas/plan.schema';
import { PlanFeature } from '../schemas/plan-feature.schema';
import { Feature } from '../schemas/feature.schema';

import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { CreateFeatureDto } from '../dto/create-feature.dto';
import { AssignFeatureDto } from '../dto/assign-feature.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<Plan>,
    @InjectModel(PlanFeature.name) private pfModel: Model<PlanFeature>,
    @InjectModel(Feature.name) private featureModel: Model<Feature>,
  ) {}

  // ==========================================
  // PLAN CRUD
  // ==========================================

  async createPlan(dto: CreatePlanDto) {
    const exists = await this.planModel.findOne({ name: dto.name });

    if (exists) {
      throw new ConflictException('Plan already exists');
    }

    return this.planModel.create(dto);
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    const plan = await this.planModel.findByIdAndUpdate(planId, dto, {
      new: true,
    });

    if (!plan) throw new NotFoundException('Plan not found');

    return plan;
  }

  async getPlans() {
    return this.planModel.find({ isActive: true }).lean();
  }

  async getPlanById(planId: string) {
    const plan = await this.planModel.findById(planId).lean();

    if (!plan) throw new NotFoundException('Plan not found');

    const features = await this.getPlanFeatures(planId);

    return {
      ...plan,
      features,
    };
  }

  // ==========================================
  // FEATURE CRUD
  // ==========================================

  async createFeature(dto: CreateFeatureDto) {
    const exists = await this.featureModel.findOne({ key: dto.key });

    if (exists) {
      throw new ConflictException('Feature already exists');
    }

    return this.featureModel.create(dto);
  }

  async getFeatures() {
    return this.featureModel.find().lean();
  }

  // ==========================================
  // PLAN FEATURE MAPPING
  // ==========================================

  async assignFeatureToPlan(dto: AssignFeatureDto) {
    const { planId, featureId, value } = dto;

    const exists = await this.pfModel.findOne({
      planId,
      featureId,
    });

    if (exists) {
      // update instead
      exists.value = value;
      return exists.save();
    }

    return this.pfModel.create({
      planId: new Types.ObjectId(planId),
      featureId: new Types.ObjectId(featureId),
      value,
    });
  }

  async removeFeatureFromPlan(planId: string, featureId: string) {
    await this.pfModel.deleteOne({ planId, featureId });
    return { success: true };
  }

  async getPlanFeatures(planId: string) {
    return this.pfModel.find({ planId }).populate('featureId').lean();
  }

  // ==========================================
  // ADVANCED (VERY IMPORTANT)
  // ==========================================

  async getAllPlansWithFeatures() {
    const plans = await this.planModel.find().lean();

    const result = await Promise.all(
      plans.map(async (plan) => {
        const features = await this.getPlanFeatures(plan._id.toString());

        return {
          ...plan,
          features,
        };
      }),
    );

    return result;
  }
}
