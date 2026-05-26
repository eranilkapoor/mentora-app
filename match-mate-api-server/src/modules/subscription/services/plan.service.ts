import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';

import { Plan, PlanDocument } from '../schemas/plan.schema';
import {
  PlanFeature,
  PlanFeatureDocument,
} from '../schemas/plan-feature.schema';
import { Feature, FeatureDocument } from '../schemas/feature.schema';

import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { CreateFeatureDto } from '../dto/create-feature.dto';
import { AssignFeatureDto } from '../dto/assign-feature.dto';
import { ErrorCode } from 'src/common/constants';
import {
  throwConflict,
  throwNotFound,
} from 'src/common/exceptions/throw-app-exception';

type LeanPlan = FlattenMaps<Plan> & { _id: Types.ObjectId };
type LeanFeature = FlattenMaps<Feature> & { _id: Types.ObjectId };
@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>,
    @InjectModel(PlanFeature.name)
    private pfModel: Model<PlanFeatureDocument>,
    @InjectModel(Feature.name)
    private featureModel: Model<FeatureDocument>,
  ) {}

  // ==========================================
  // PLAN CRUD
  // ==========================================

  async createPlan(dto: CreatePlanDto): Promise<LeanPlan> {
    const exists = await this.planModel
      .findOne({ name: dto.name })
      .lean()
      .exec();
    if (exists)
      return throwConflict(ErrorCode.SUBSCRIPTION_ALREADY_ACTIVE, {
        reason: 'plan_already_exists',
      });
    const plan = await this.planModel.create(dto);
    return plan.toObject() as LeanPlan;
  }

  async updatePlan(planId: string, dto: UpdatePlanDto): Promise<LeanPlan> {
    const plan = await this.planModel
      .findByIdAndUpdate(
        planId,
        { $set: dto },
        { new: true, runValidators: true },
      )
      .lean<LeanPlan>()
      .exec();
    if (!plan)
      return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND, {
        reason: 'plan_not_found',
      });
    return plan;
  }

  async getPlans(): Promise<LeanPlan[]> {
    return this.planModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean<LeanPlan[]>()
      .exec();
  }

  async getActivePlansWithFeatures() {
    const [plans, allPlanFeatures] = await Promise.all([
      this.planModel
        .find({ isActive: true })
        .sort({ sortOrder: 1 })
        .lean<LeanPlan[]>()
        .exec(),
      this.pfModel.find().populate('featureId').lean().exec(),
    ]);

    const activePlanIds = new Set(plans.map((plan) => String(plan._id)));
    const featuresByPlan = new Map<string, unknown[]>();

    for (const pf of allPlanFeatures) {
      const key = String(pf.planId);
      if (!activePlanIds.has(key)) {
        continue;
      }

      const existing = featuresByPlan.get(key) ?? [];
      existing.push(pf);
      featuresByPlan.set(key, existing);
    }

    return plans.map((plan) => ({
      ...plan,
      features: featuresByPlan.get(String(plan._id)) ?? [],
    }));
  }

  async getPlanById(
    planId: string,
  ): Promise<LeanPlan & { features: unknown[] }> {
    const plan = await this.planModel.findById(planId).lean<LeanPlan>().exec();
    if (!plan)
      return throwNotFound(ErrorCode.SUBSCRIPTION_NOT_FOUND, {
        reason: 'plan_not_found',
      });
    const features = await this.getPlanFeatures(planId);
    return { ...plan, features };
  }

  // ==========================================
  // FEATURE CRUD
  // ==========================================

  async createFeature(dto: CreateFeatureDto): Promise<LeanFeature> {
    const exists = await this.featureModel
      .findOne({ key: dto.key })
      .lean()
      .exec();
    if (exists)
      return throwConflict(ErrorCode.SUBSCRIPTION_FEATURE_NOT_AVAILABLE, {
        reason: 'feature_already_exists',
      });
    const feature = await this.featureModel.create(dto);
    return feature.toObject() as LeanFeature;
  }

  async getFeatures(): Promise<LeanFeature[]> {
    return this.featureModel
      .find({ isActive: true })
      .lean<LeanFeature[]>()
      .exec();
  }

  // ==========================================
  // PLAN FEATURE MAPPING
  // ==========================================

  async assignFeatureToPlan(dto: AssignFeatureDto) {
    const { planId, featureId, value } = dto;

    return this.pfModel
      .findOneAndUpdate(
        {
          planId: new Types.ObjectId(planId),
          featureId: new Types.ObjectId(featureId),
        },
        { $set: { value } },
        { upsert: true, new: true, runValidators: true },
      )
      .lean()
      .exec();
  }

  async removeFeatureFromPlan(planId: string, featureId: string) {
    await this.pfModel
      .deleteOne({
        planId: new Types.ObjectId(planId),
        featureId: new Types.ObjectId(featureId),
      })
      .exec();
    return { success: true };
  }

  async getPlanFeatures(planId: string) {
    return this.pfModel
      .find({ planId: new Types.ObjectId(planId) })
      .populate('featureId')
      .lean()
      .exec();
  }

  // ==========================================
  // ADVANCED (VERY IMPORTANT)
  // ==========================================

  async getAllPlansWithFeatures() {
    const [plans, allPlanFeatures] = await Promise.all([
      this.planModel.find().sort({ sortOrder: 1 }).lean<LeanPlan[]>().exec(),
      this.pfModel.find().populate('featureId').lean().exec(),
    ]);

    const featuresByPlan = new Map<string, unknown[]>();

    for (const pf of allPlanFeatures) {
      const key = String(pf.planId);
      const existing = featuresByPlan.get(key) ?? [];
      existing.push(pf);
      featuresByPlan.set(key, existing);
    }

    return plans.map((plan) => ({
      ...plan,
      features: featuresByPlan.get(String(plan._id)) ?? [],
    }));
  }
}
