import {
  BillingCycle,
  FeatureCategory,
  FeatureKey,
  Permission,
  PlanTier,
  PlanType,
  Role,
} from '@/common/enums';
import {
  CUSTOM_ASSISTED_FEATURE_MAPPINGS,
  CUSTOM_ASSISTED_FEATURE_VALUE,
} from './custom-assisted-features.seed-data';
import { FEATURE_SEEDS } from './features.seed-data';
import { PLAN_SEEDS } from './plans.seed-data';
import { FIXED_PLAN_LIMITS } from './fixed-plan-limits.seed-data';
import {
  ROLE_PERMISSION_POLICIES,
  resolveRolePermissions,
} from './role-permissions.seed-data';
import { StoreProductType } from '@/modules/subscriptions/enums/store-product-type.enum';

describe('plan and feature seed invariants', () => {
  it('defines every feature key exactly once', () => {
    const seededKeys = FEATURE_SEEDS.map(({ key }) => key);

    expect(new Set(seededKeys).size).toBe(seededKeys.length);
    seededKeys.forEach((key) =>
      expect(Object.values(FeatureKey)).toContain(key),
    );
  });

  it('defines one quote-based custom assisted plan', () => {
    const customAssistedPlans = PLAN_SEEDS.filter(
      ({ planType, isCustom }) => planType === PlanType.ASSISTED && isCustom,
    );

    expect(customAssistedPlans).toHaveLength(1);
    expect(customAssistedPlans[0]).toMatchObject({
      name: 'ASSISTED_CUSTOM',
      planType: PlanType.ASSISTED,
      billingCycle: BillingCycle.CUSTOM,
      price: 0,
      durationDays: 0,
      trialDays: 0,
      autoRenewDefault: false,
      isCustom: true,
    });
  });

  it('maps every capability to a custom assisted value', () => {
    const mappedKeys = CUSTOM_ASSISTED_FEATURE_MAPPINGS.map(
      ({ featureKey }) => featureKey,
    );

    expect(new Set(mappedKeys)).toEqual(
      new Set(FEATURE_SEEDS.map(({ key }) => key)),
    );
    expect(
      CUSTOM_ASSISTED_FEATURE_MAPPINGS.every(
        ({ value }) => value === CUSTOM_ASSISTED_FEATURE_VALUE,
      ),
    ).toBe(true);
  });

  it('marks fixed plans as non-custom', () => {
    expect(
      PLAN_SEEDS.filter(({ isCustom }) => !isCustom).every(
        ({ isCustom }) => isCustom === false,
      ),
    ).toBe(true);
  });

  it('defines one recommended plan per selectable paid plan group', () => {
    [PlanType.SELF_SERVICE, PlanType.ASSISTED].forEach((planType) => {
      expect(
        PLAN_SEEDS.filter(
          (plan) => plan.planType === planType && plan.isPopular,
        ),
      ).toHaveLength(1);
    });
  });

  it('defines every role exactly once with valid permissions', () => {
    const policyRoles = ROLE_PERMISSION_POLICIES.map(({ name }) => name);

    expect(new Set(policyRoles)).toEqual(new Set(Object.values(Role)));
    expect(policyRoles).toHaveLength(new Set(policyRoles).size);
    ROLE_PERMISSION_POLICIES.forEach((policy) => {
      resolveRolePermissions(policy).forEach((permission) =>
        expect(Object.values(Permission)).toContain(permission),
      );
    });
  });

  it('keeps privileged role boundaries explicit', () => {
    const policy = (role: Role) =>
      ROLE_PERMISSION_POLICIES.find(({ name }) => name === role)!;

    expect(resolveRolePermissions(policy(Role.SUPER_ADMIN))).toEqual(
      Object.values(Permission),
    );
    expect(resolveRolePermissions(policy(Role.USER))).toEqual([]);
    expect(resolveRolePermissions(policy(Role.FINANCE))).toContain(
      Permission.PAYMENT_REFUND,
    );
    expect(resolveRolePermissions(policy(Role.FINANCE))).not.toContain(
      Permission.USER_DELETE,
    );
    expect(resolveRolePermissions(policy(Role.KYC_REVIEWER))).toContain(
      Permission.PROFILE_VERIFY,
    );
    expect(resolveRolePermissions(policy(Role.KYC_REVIEWER))).not.toContain(
      Permission.PAYMENT_REFUND,
    );
  });

  it('defines numeric limits for every fixed recurring plan', () => {
    const fixedPlanNames = PLAN_SEEDS.filter(
      ({ planType, isCustom }) =>
        ![PlanType.LEARNING_BOOST, PlanType.ORGANIZATION].includes(planType) &&
        !isCustom,
    ).map(({ name }) => name);

    expect(new Set(Object.keys(FIXED_PLAN_LIMITS))).toEqual(
      new Set(fixedPlanNames),
    );
    Object.values(FIXED_PLAN_LIMITS).forEach((limits) => {
      expect(Object.keys(limits).length).toBeGreaterThan(0);
      Object.values(limits).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value === -1 || value >= 0).toBe(true);
      });
    });
  });

  it('uses numeric defaults for fixed limits and custom for custom scope', () => {
    FEATURE_SEEDS.forEach((feature) => {
      if (!['limit', 'quota', 'duration'].includes(feature.type)) return;

      if (feature.category === FeatureCategory.ENTERPRISE) {
        expect(feature.defaultValue).toBe(CUSTOM_ASSISTED_FEATURE_VALUE);
      } else {
        expect(typeof feature.defaultValue).toBe('number');
      }
    });
  });

  it('enforces fixed plan lifecycle policy', () => {
    const freePlan = PLAN_SEEDS.find(({ tier }) => tier === PlanTier.FREE)!;
    const paidPlans = PLAN_SEEDS.filter(
      ({ planType, tier, isCustom }) =>
        tier !== PlanTier.FREE &&
        ![PlanType.LEARNING_BOOST, PlanType.ORGANIZATION].includes(planType) &&
        !isCustom,
    );

    expect(freePlan).toMatchObject({
      durationDays: 365,
      trialDays: 0,
      autoRenewDefault: true,
    });
    paidPlans.forEach((plan) => {
      expect(plan.trialDays).toBe(7);
      expect(plan.autoRenewDefault).toBe(true);
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.durationDays).toBeGreaterThan(0);
    });
  });

  it('maps every paid recurring plan to unique store catalog entries', () => {
    const paidPlans = PLAN_SEEDS.filter(
      ({ planType, price, isCustom }) =>
        price > 0 &&
        ![PlanType.LEARNING_BOOST, PlanType.ORGANIZATION].includes(planType) &&
        !isCustom,
    );
    const androidBasePlans = paidPlans.map(
      (plan) =>
        `${plan.storeProducts?.android?.productId}:${plan.storeProducts?.android?.basePlanId}`,
    );
    const appleProducts = paidPlans.map(
      (plan) => plan.storeProducts?.ios?.productId,
    );

    expect(new Set(androidBasePlans).size).toBe(paidPlans.length);
    expect(new Set(appleProducts).size).toBe(paidPlans.length);
    paidPlans.forEach((plan) => {
      expect(plan.storeProducts?.android).toMatchObject({
        productType: StoreProductType.SUBSCRIPTION,
        offerId: 'trial-7-days',
      });
      expect(plan.storeProducts?.ios).toMatchObject({
        productType: StoreProductType.SUBSCRIPTION,
        subscriptionGroupId: 'mentora_membership',
      });
    });
  });
});
