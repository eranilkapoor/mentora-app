import { Injectable } from '@nestjs/common';
import { PlanService } from './plan.service';

@Injectable()
export class FeatureAccessService {
  constructor(private readonly planService: PlanService) {}

  async getFeaturesForUser(user: any) {
    const planId = user.membership.planId;
    const features = await this.planService.getPlanFeatures(planId);

    const map: Record<string, any> = {};

    features.forEach((f: any) => {
      map[f.featureId.key] = f.value ?? true;
    });

    return map;
  }

  hasFeature(features: any, key: string) {
    return !!features[key];
  }
}